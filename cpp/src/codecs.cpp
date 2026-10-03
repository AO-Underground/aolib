#include "aolib/packets_gen.hpp"

#include <string>
#include <vector>

#include "aolib/error.hpp"
#include "aolib/fanta.hpp"

namespace aolib {

// ---------------------------------------------------------------------------
// ARUP: discriminator-driven array (player_count = numbers, else strings).
// ---------------------------------------------------------------------------

std::vector<std::string> ARUP::args() const {
    std::vector<std::string> out;
    out.push_back(std::to_string(area_update_type_to_wire(update_type)));
    for (const auto& v : update_data) {
        out.push_back(update_type == AreaUpdateType::player_count ? v : escape_fanta(v));
    }
    return out;
}

ARUP ARUP::parse(const std::vector<std::string>& body) {
    ARUP p;
    if (body.empty()) return p;
    p.update_type = area_update_type_from_wire(parse_wire_int(body[0], "update_type"));
    for (std::size_t i = 1; i < body.size(); ++i) {
        if (p.update_type == AreaUpdateType::player_count) {
            p.update_data.push_back(std::to_string(parse_wire_int(body[i], "update_data")));
        } else {
            p.update_data.push_back(unescape_fanta(body[i]));
        }
    }
    return p;
}

nlohmann::ordered_json ARUP::to_json_object() const {
    nlohmann::ordered_json j;
    j["update_type"] = area_update_type_to_string(update_type);
    nlohmann::ordered_json a = nlohmann::ordered_json::array();
    for (const auto& v : update_data) {
        if (update_type == AreaUpdateType::player_count) a.push_back(std::stoi(v));
        else a.push_back(v);
    }
    j["update_data"] = a;
    return j;
}

void ARUP::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("update_type")) update_type = area_update_type_from_string(j["update_type"].get<std::string>());
    if (j.contains("update_data")) {
        update_data.clear();
        for (const auto& v : j["update_data"]) {
            if (v.is_number_integer()) update_data.push_back(std::to_string(v.get<int>()));
            else update_data.push_back(v.get<std::string>());
        }
    }
}

// ---------------------------------------------------------------------------
// RT: one `animation` in JSON, `name#variant` on the wire.
// ---------------------------------------------------------------------------

namespace {

std::vector<std::string> rt_args(RTAnimation animation, const std::string& name) {
    if (animation == RTAnimation::custom) return {escape_fanta(name)};
    switch (animation) {
        case RTAnimation::witness_testimony: return {"testimony1", "0"};
        case RTAnimation::end_animation: return {"testimony1", "1"};
        case RTAnimation::cross_examination: return {"testimony2", "0"};
        case RTAnimation::not_guilty: return {"judgeruling", "0"};
        case RTAnimation::guilty: return {"judgeruling", "1"};
        default: return {"testimony1", "0"};
    }
}

int variant_of(const std::vector<std::string>& body) {
    if (body.size() > 1 && !body[1].empty() && is_wire_int(body[1])) {
        return parse_wire_int(body[1], "variant");
    }
    return 0;
}

}  // namespace

std::vector<std::string> RTToServer::args() const { return rt_args(animation, name); }
std::vector<std::string> RTToClient::args() const { return rt_args(animation, name); }

namespace {

std::pair<RTAnimation, std::string> parse_rt(const std::vector<std::string>& body) {
    std::string n = body.empty() ? "" : body[0];
    int variant = variant_of(body);
    if (n.empty()) throw Error("RT: empty animation slot");
    if (n == "testimony1") return {variant == 1 ? RTAnimation::end_animation : RTAnimation::witness_testimony, ""};
    if (n == "testimony2") return {RTAnimation::cross_examination, ""};
    if (n == "judgeruling") {
        if (variant == 0) return {RTAnimation::not_guilty, ""};
        if (variant == 1) return {RTAnimation::guilty, ""};
        throw Error("RT: unknown judgeruling variant " + (body.size() > 1 ? body[1] : ""));
    }
    return {RTAnimation::custom, unescape_fanta(n)};
}

}  // namespace

RTToServer RTToServer::parse(const std::vector<std::string>& body) {
    auto [a, n] = parse_rt(body);
    RTToServer p;
    p.animation = a;
    p.name = n;
    return p;
}

RTToClient RTToClient::parse(const std::vector<std::string>& body) {
    auto [a, n] = parse_rt(body);
    RTToClient p;
    p.animation = a;
    p.name = n;
    return p;
}

}  // namespace aolib
