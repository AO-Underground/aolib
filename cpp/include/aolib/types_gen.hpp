// AUTO-GENERATED from spec/types/* (object types). Do not edit; run aolib-gen.
#pragma once

#include <string>

#include <nlohmann/json.hpp>

#include "aolib/fanta.hpp"

namespace aolib {

struct Effect {
    std::string name{};
    std::string folder{};
    std::string sound{};

    nlohmann::ordered_json to_json_object() const;
    static Effect from_json_object(const nlohmann::ordered_json& j);
};

inline nlohmann::ordered_json Effect::to_json_object() const {
    nlohmann::ordered_json j;
    j["name"] = name;
    j["folder"] = folder;
    j["sound"] = sound;
    return j;
}

inline Effect Effect::from_json_object(const nlohmann::ordered_json& j) {
    Effect o;
    if (j.contains("name")) o.name = j["name"].get<std::string>();
    if (j.contains("folder")) o.folder = j["folder"].get<std::string>();
    if (j.contains("sound")) o.sound = j["sound"].get<std::string>();
    return o;
}

inline std::string effect_to_wire(const Effect& v) {
    if (v.name.empty() && v.folder.empty() && v.sound.empty()) return "";
    return escape_fanta(v.name) + "|" + escape_fanta(v.folder) + "|" + escape_fanta(v.sound);
}

inline Effect effect_from_wire(const std::string& s) {
    if (s.empty()) return Effect{};
    std::string t = s;
    auto parts = split_on(t, '|', 3);
    Effect o;
    if (parts.size() > 0) o.name = unescape_fanta(parts[0]);
    if (parts.size() > 1) o.folder = unescape_fanta(parts[1]);
    if (parts.size() > 2) o.sound = unescape_fanta(parts[2]);
    return o;
}

struct MusicEffects {
    bool fade_in{false};
    bool fade_out{false};
    bool sync_position{false};

    nlohmann::ordered_json to_json_object() const;
    static MusicEffects from_json_object(const nlohmann::ordered_json& j);
};

inline nlohmann::ordered_json MusicEffects::to_json_object() const {
    nlohmann::ordered_json j;
    j["fade_in"] = fade_in;
    j["fade_out"] = fade_out;
    j["sync_position"] = sync_position;
    return j;
}

inline MusicEffects MusicEffects::from_json_object(const nlohmann::ordered_json& j) {
    MusicEffects o;
    if (j.contains("fade_in")) o.fade_in = j["fade_in"].get<bool>();
    if (j.contains("fade_out")) o.fade_out = j["fade_out"].get<bool>();
    if (j.contains("sync_position")) o.sync_position = j["sync_position"].get<bool>();
    return o;
}

inline std::string music_effects_to_wire(const MusicEffects& v) {
    int n = 0;
    if (v.fade_in) n |= 1;
    if (v.fade_out) n |= 2;
    if (v.sync_position) n |= 4;
    return std::to_string(n);
}

inline MusicEffects music_effects_from_wire(const std::string& s) {
    int n = parse_wire_int(s, "music_effects");
    MusicEffects v;
    v.fade_in = (n & 1) != 0;
    v.fade_out = (n & 2) != 0;
    v.sync_position = (n & 4) != 0;
    return v;
}

struct Offset {
    int x{0};
    int y{0};

    nlohmann::ordered_json to_json_object() const;
    static Offset from_json_object(const nlohmann::ordered_json& j);
};

inline nlohmann::ordered_json Offset::to_json_object() const {
    nlohmann::ordered_json j;
    j["x"] = x;
    j["y"] = y;
    return j;
}

inline Offset Offset::from_json_object(const nlohmann::ordered_json& j) {
    Offset o;
    if (j.contains("x")) o.x = j["x"].get<int>();
    if (j.contains("y")) o.y = j["y"].get<int>();
    return o;
}

inline std::string offset_to_wire(const Offset& v) {
    return std::to_string(v.x) + "&" + std::to_string(v.y);
}

inline Offset offset_from_wire(const std::string& s) {
    std::string t = s;
    std::size_t pos = 0;
    while ((pos = t.find("<and>", pos)) != std::string::npos) { t.replace(pos, 5, "&"); pos += 1; }
    auto parts = split_on(t, '&', 2);
    Offset o;
    if (parts.size() > 0) o.x = parse_wire_int(parts[0], "Offset.x");
    if (parts.size() > 1) o.y = parse_wire_int(parts[1], "Offset.y");
    return o;
}

}  // namespace aolib
