#pragma once

#include <any>
#include <functional>
#include <map>
#include <memory>
#include <string>

#include <nlohmann/json.hpp>

#include "aolib/outgoing.hpp"
#include "aolib/packets_gen.hpp"

namespace aolib {

// Configures a session. `send` is the only required hook; the rest are
// observability callbacks that fire instead of throwing from receive().
struct SessionConfig {
    std::function<void(const std::string& wire)> send;
    bool disable_auto_json = false;
    std::function<void(const Error&, const std::string&)> on_malformed_frame;
    std::function<void(const std::string&, const std::string&)> on_unknown_header;
    std::function<void(const std::string&, const Error&, const std::string&)> on_decode_error;
    std::function<void(const std::string&, const std::any&)> on_unhandled;
    std::function<void(const std::string&, const Error&, const std::any&)> on_handler_error;
};

// Internal session core shared by ServerSession/ClientSession.
class Session {
public:
    Session(SessionConfig cfg, bool represents_server);

    void send(const Outgoing& p);
    void on(const std::string& header, std::function<void(std::any)> h);
    void receive(const std::string& wire);
    void close();
    void set_json_mode(bool enabled) { json_mode_ = enabled; }
    bool json_mode() const { return json_mode_; }
    void send_custom(const std::string& header, const nlohmann::json& payload);
    void on_custom(const std::string& header, std::function<void(std::any)> h);

private:
    void fire_hook(const std::function<void()>& h, const std::function<void()>& fallback);

    SessionConfig cfg_;
    bool represents_server_;
    bool json_mode_ = false;
    bool auto_json_;
    bool closed_ = false;
    std::map<std::string, std::function<void(std::any)>> handlers_;
    std::map<std::string, std::function<void(std::any)>> custom_handlers_;
};

// A session representing the remote *server* (client-side code): Send* ships
// C2S packets, On* registers handlers for S2C packets.
class ServerSession {
public:
    explicit ServerSession(SessionConfig cfg) : core_(std::make_shared<Session>(std::move(cfg), true)) {}
    Session* core() { return core_.get(); }
    void receive(const std::string& wire) { core_->receive(wire); }
    void close() { core_->close(); }
    void set_json_mode(bool enabled) { core_->set_json_mode(enabled); }
    bool json_mode() const { return core_->json_mode(); }
    void send_custom(const std::string& header, const nlohmann::json& payload) { core_->send_custom(header, payload); }
    void on_custom(const std::string& header, std::function<void(std::any)> h) { core_->on_custom(header, std::move(h)); }

#include "aolib/session_server_gen.hpp"

private:
    std::shared_ptr<Session> core_;
};

// A session representing one remote *client* (server-side code): Send* ships
// S2C packets, On* registers handlers for C2S packets.
class ClientSession {
public:
    explicit ClientSession(SessionConfig cfg) : core_(std::make_shared<Session>(std::move(cfg), false)) {}
    Session* core() { return core_.get(); }
    void receive(const std::string& wire) { core_->receive(wire); }
    void close() { core_->close(); }
    void set_json_mode(bool enabled) { core_->set_json_mode(enabled); }
    bool json_mode() const { return core_->json_mode(); }
    void send_custom(const std::string& header, const nlohmann::json& payload) { core_->send_custom(header, payload); }
    void on_custom(const std::string& header, std::function<void(std::any)> h) { core_->on_custom(header, std::move(h)); }

#include "aolib/session_client_gen.hpp"

private:
    std::shared_ptr<Session> core_;
};

ServerSession server(const SessionConfig& cfg);
ClientSession client(const SessionConfig& cfg);

}  // namespace aolib
