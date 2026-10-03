#include "aolib/session.hpp"

#include <typeinfo>

#include "aolib/aopacket.hpp"
#include "aolib/custom.hpp"
#include "aolib/packets_gen.hpp"
#include "aolib/wire.hpp"

namespace aolib {

Session::Session(SessionConfig cfg, bool represents_server)
    : cfg_(std::move(cfg)), represents_server_(represents_server), auto_json_(!cfg_.disable_auto_json) {}

void Session::send(const Outgoing& p) {
    if (closed_) throw Error("aolib: send on a closed session");
    if (!cfg_.send) throw Error("aolib: session has no send hook");
    cfg_.send(encode(p, json_mode_ ? WireMode::json : WireMode::fanta));
}

void Session::on(const std::string& header, std::function<void(std::any)> h) {
    handlers_[header] = std::move(h);
}

void Session::close() {
    closed_ = true;
    handlers_.clear();
    custom_handlers_.clear();
}

void Session::receive(const std::string& wire) {
    if (closed_) return;
    bool is_json = !wire.empty() && wire[0] == '{';
    if (auto_json_ && !represents_server_ && is_json) json_mode_ = true;

    std::string header;
    try {
        header = read_header(wire);
    } catch (const Error& e) {
        if (cfg_.on_malformed_frame) cfg_.on_malformed_frame(e, wire);
        return;
    }

    std::optional<nlohmann::json> custom;
    try {
        custom = decode_custom(header, wire);
    } catch (const Error& e) {
        if (cfg_.on_decode_error) cfg_.on_decode_error(header, e, wire);
        return;
    }
    if (custom.has_value()) {
        auto it = custom_handlers_.find(header);
        if (it == custom_handlers_.end()) {
            if (cfg_.on_unhandled) cfg_.on_unhandled(header, std::any{custom.value()});
            return;
        }
        try {
            it->second(std::any{custom.value()});
        } catch (const std::exception& e) {
            if (cfg_.on_handler_error) cfg_.on_handler_error(header, Error(e.what()), std::any{custom.value()});
        }
        return;
    }

    WireMode mode = is_json ? WireMode::json : WireMode::fanta;
    std::any pkt;
    try {
        pkt = represents_server_ ? decode_to_client(wire, mode) : decode_to_server(wire, mode);
    } catch (const Error& e) {
        if (cfg_.on_decode_error) cfg_.on_decode_error(header, e, wire);
        return;
    }

    if (pkt.type() == typeid(Packet)) {
        if (cfg_.on_unknown_header) cfg_.on_unknown_header(header, wire);
        return;
    }

    if (auto_json_ && represents_server_ && header == "decryptor") {
        auto sp = std::any_cast<std::shared_ptr<Outgoing>>(pkt);
        if (auto d = std::dynamic_pointer_cast<decryptor>(sp); d && d->value == "JSON") {
            json_mode_ = true;
        }
    }

    auto it = handlers_.find(header);
    if (it == handlers_.end()) {
        if (cfg_.on_unhandled) cfg_.on_unhandled(header, pkt);
        return;
    }
    try {
        it->second(pkt);
    } catch (const std::exception& e) {
        if (cfg_.on_handler_error) cfg_.on_handler_error(header, Error(e.what()), pkt);
    }
}

void Session::send_custom(const std::string& header, const nlohmann::json& payload) {
    if (closed_) throw Error("aolib: sendCustom on a closed session");
    if (!cfg_.send) throw Error("aolib: session has no send hook");
    cfg_.send(encode_custom(header, payload, json_mode_ ? WireMode::json : WireMode::fanta));
}

void Session::on_custom(const std::string& header, std::function<void(std::any)> h) {
    custom_handlers_[header] = std::move(h);
}

ServerSession server(const SessionConfig& cfg) { return ServerSession(cfg); }
ClientSession client(const SessionConfig& cfg) { return ClientSession(cfg); }

}  // namespace aolib
