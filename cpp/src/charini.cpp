#include "aolib/charini.hpp"

#include <cctype>
#include <sstream>

#include "aolib/error.hpp"
#include "aolib/fanta.hpp"
#include "aolib/ticks.hpp"

namespace aolib {

namespace {

std::string lower_s(const std::string& s) {
    std::string out = s;
    for (auto& c : out) c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    return out;
}

std::string trim(const std::string& s) {
    std::size_t a = 0, b = s.size();
    while (a < b && (s[a] == ' ' || s[a] == '\t' || s[a] == '\r')) ++a;
    while (b > a && (s[b - 1] == ' ' || s[b - 1] == '\t' || s[b - 1] == '\r')) --b;
    return s.substr(a, b - a);
}

// Drop `;`/`//` comments at a line start or after whitespace.
std::string strip_comments(const std::string& data) {
    std::string out;
    std::istringstream ss(data);
    std::string line;
    while (std::getline(ss, line)) {
        std::size_t cut = std::string::npos;
        for (std::size_t i = 0; i < line.size(); ++i) {
            bool after_ws = (i == 0) || line[i - 1] == ' ' || line[i - 1] == '\t';
            if (!after_ws) continue;
            if (line[i] == ';') { cut = i; break; }
            if (line[i] == '/' && i + 1 < line.size() && line[i + 1] == '/') { cut = i; break; }
        }
        if (cut != std::string::npos) line.resize(cut);
        out += line;
        out += '\n';
    }
    return out;
}

int to_int(const std::string& s, int fallback) {
    if (s.empty()) return fallback;
    try { return std::stoi(trim(s)); } catch (...) { return fallback; }
}

std::optional<std::string> norm_preanim(const std::string& s) {
    if (s.empty() || s == "-") return std::nullopt;
    return s;
}

std::optional<std::string> norm_sound(const std::string& s) {
    return s.empty() ? std::nullopt : std::optional<std::string>(s);
}

std::optional<std::string> norm_legacy_sound(const std::string& s) {
    if (s == "0" || s == "1" || s == "-") return std::nullopt;
    return norm_sound(s);
}

std::optional<int> positive_ms(const std::string& s) {
    int n = to_int(s, 0);
    return n > 0 ? std::optional<int>(n) : std::nullopt;
}

void require_extension(const std::string& value, const std::string& field, const std::string& key) {
    std::size_t dot = value.find_last_of('.');
    bool ok = dot != std::string::npos && dot + 1 < value.size();
    if (ok) {
        for (std::size_t i = dot + 1; i < value.size(); ++i) {
            if (value[i] == '.' || std::isspace(static_cast<unsigned char>(value[i]))) { ok = false; break; }
        }
    }
    if (!ok) throw Error("char.ini emote \"" + key + "\": " + field + " \"" + value + "\" must include a file extension");
}

EmoteModifier parse_emote_modifier(const std::string& raw, EmoteModifier fallback) {
    if (raw.empty()) return fallback;
    std::string v = lower_s(trim(raw));
    try { return emote_modifier_from_string(v); } catch (const Error&) {}
    if (is_wire_int(v)) { try { return emote_modifier_from_wire(std::stoi(v)); } catch (const Error&) {} }
    return fallback;
}

DeskModifier parse_desk_modifier(const std::string& raw, DeskModifier fallback) {
    if (raw.empty()) return fallback;
    std::string v = lower_s(trim(raw));
    try { return desk_modifier_from_string(v); } catch (const Error&) {}
    if (is_wire_int(v)) { try { return desk_modifier_from_wire(std::stoi(v)); } catch (const Error&) {} }
    return fallback;
}

std::optional<EmoteModifier> require_emote_name(const std::string& raw, const std::string& field, const std::string& key) {
    if (raw.empty()) return std::nullopt;
    std::string v = lower_s(trim(raw));
    if (is_wire_int(v)) throw Error("char.ini emote \"" + key + "\": " + field + " must be a named identifier, not a number");
    try { return emote_modifier_from_string(v); }
    catch (const Error&) { throw Error("char.ini emote \"" + key + "\": unknown " + field + " \"" + raw + "\""); }
}

std::optional<DeskModifier> require_desk_name(const std::string& raw, const std::string& field, const std::string& key) {
    if (raw.empty()) return std::nullopt;
    std::string v = lower_s(trim(raw));
    if (is_wire_int(v)) throw Error("char.ini emote \"" + key + "\": " + field + " must be a named identifier, not a number");
    try { return desk_modifier_from_string(v); }
    catch (const Error&) { throw Error("char.ini emote \"" + key + "\": unknown " + field + " \"" + raw + "\""); }
}

DeskModifier unset_deskmod(EmoteModifier m) {
    return (m == EmoteModifier::zoom || m == EmoteModifier::objection_zoom) ? DeskModifier::hidden : DeskModifier::shown;
}

}  // namespace

namespace {

struct Ini {
    std::map<std::string, std::map<std::string, std::string>> sections;
    std::vector<std::string> block_order;
};

Ini parse_ini(const std::string& data) {
    Ini ini;
    std::string current;
    std::istringstream ss(strip_comments(data));
    std::string line;
    while (std::getline(ss, line)) {
        std::string t = trim(line);
        if (t.empty()) continue;
        if (t.size() >= 2 && t.front() == '[' && t.back() == ']') {
            std::string sec = trim(t.substr(1, t.size() - 2));
            current = lower_s(sec);
            if (current.rfind("emote ", 0) == 0) ini.block_order.push_back(sec.substr(6));
            continue;
        }
        if (current.empty()) continue;
        std::size_t eq = t.find('=');
        if (eq == std::string::npos) continue;
        ini.sections[current][lower_s(trim(t.substr(0, eq)))] = trim(t.substr(eq + 1));
    }
    return ini;
}

std::vector<CharEmote> read_block_emotes(const Ini& ini) {
    std::vector<CharEmote> emotes;
    for (const auto& key : ini.block_order) {
        auto it = ini.sections.find("emote " + lower_s(key));
        const auto& block = it == ini.sections.end() ? std::map<std::string, std::string>() : it->second;
        auto get = [&](const std::string& k) { auto i = block.find(k); return i == block.end() ? "" : i->second; };

        std::string anim = get("anim");
        require_extension(anim, "anim", key);
        auto preanim = norm_preanim(get("preanim"));
        if (preanim) require_extension(*preanim, "preanim", key);
        auto postanim = norm_preanim(get("postanim"));
        if (postanim) require_extension(*postanim, "postanim", key);
        auto camera = norm_preanim(get("camera"));
        if (camera) require_extension(*camera, "camera", key);
        auto sound = norm_sound(get("sound"));
        if (sound) require_extension(*sound, "sound", key);

        EmoteModifier modifier = require_emote_name(get("modifier"), "modifier", key).value_or(EmoteModifier::no_preanim);
        DeskModifier deskmod = require_desk_name(get("deskmod"), "deskmod", key).value_or(unset_deskmod(modifier));

        CharEmote e;
        e.key = key;
        e.name = block.count("name") ? get("name") : key;
        e.anim = anim;
        e.preanim = preanim;
        e.postanim = postanim;
        e.camera = camera;
        e.modifier = modifier;
        e.deskmod = deskmod;
        e.sound = sound;
        e.sounddelayms = to_int(get("sounddelayms"), 0);
        e.sounddelayticks = ms_to_ticks(e.sounddelayms);
        e.soundlooping = get("soundlooping") == "true";
        e.preanimdurationms = positive_ms(get("preanimdurationms"));
        emotes.push_back(std::move(e));
    }
    return emotes;
}

std::vector<CharEmote> read_legacy_emotes(const Ini& ini, const std::map<std::string, std::string>& emotions, int count) {
    static const std::map<std::string, std::string> empty;
    auto sec = [&](const std::string& n) -> const std::map<std::string, std::string>& {
        auto it = ini.sections.find(n);
        return it == ini.sections.end() ? empty : it->second;
    };
    const auto& sound_n = sec("soundn");
    const auto& sound_t = sec("soundt");
    const auto& sound_l = sec("soundl");
    const auto& time = sec("time");

    std::vector<CharEmote> emotes;
    for (int id = 1; id <= count; ++id) {
        std::string sid = std::to_string(id);
        auto it = emotions.find(sid);
        if (it == emotions.end()) continue;
        const std::string& def = it->second;

        std::vector<std::string> parts;
        std::stringstream ss(def);
        std::string part;
        while (std::getline(ss, part, '#')) parts.push_back(part);

        int delay = sound_t.count(sid) ? to_int(sound_t.at(sid), 0) : 0;
        EmoteModifier modifier = parse_emote_modifier(parts.size() > 3 ? parts[3] : "", EmoteModifier::no_preanim);
        auto preanim = norm_preanim(parts.size() > 1 ? parts[1] : "");

        CharEmote e;
        e.key = sid;
        e.name = parts.empty() ? "" : parts[0];
        e.anim = parts.size() > 2 ? parts[2] : "";
        e.preanim = preanim;
        e.modifier = modifier;
        std::string desk_raw = parts.size() > 4 ? trim(parts[4]) : "";
        e.deskmod = desk_raw.empty() ? unset_deskmod(modifier) : parse_desk_modifier(desk_raw, DeskModifier::shown);
        e.sound = norm_legacy_sound(sound_n.count(sid) ? sound_n.at(sid) : "");
        e.sounddelayticks = delay;
        e.sounddelayms = ticks_to_ms(delay);
        e.soundlooping = (sound_l.count(sid) ? trim(sound_l.at(sid)) : "") == "1";
        e.preanimdurationms = preanim ? positive_ms(time.count(lower_s(*preanim)) ? time.at(lower_s(*preanim)) : "") : std::nullopt;
        emotes.push_back(std::move(e));
    }
    return emotes;
}

}  // namespace

CharIni parse_char_ini(const std::string& data) {
    Ini ini = parse_ini(data);

    auto opt_it = ini.sections.find("options");
    if (opt_it == ini.sections.end()) throw Error("char.ini: missing required [options] section");
    const auto& opt = opt_it->second;
    if (!opt.count("name") || opt.at("name").empty()) throw Error("char.ini: [options] is missing the required `name` key");

    CharIniOptions options;
    options.name = opt.at("name");
    options.showname = opt.count("showname") ? opt.at("showname") : "";
    options.side = opt.count("side") ? opt.at("side") : "wit";
    options.model = opt.count("model") ? opt.at("model") : "";
    std::string blips = opt.count("blips") ? opt.at("blips") : (opt.count("gender") ? opt.at("gender") : "male");
    options.blips = blips.empty() ? "male" : blips;
    options.chat = opt.count("chat") ? std::optional<std::string>(opt.at("chat")) : std::nullopt;
    options.category = opt.count("category") ? std::optional<std::string>(opt.at("category")) : std::nullopt;
    std::string scaling = opt.count("scaling") ? opt.at("scaling") : "";
    options.scaling = scaling == "smooth" ? "smooth" : (scaling == "pixel" || scaling == "fast" ? "pixel" : "auto");
    options.stretch = (opt.count("stretch") && opt.at("stretch").rfind("true", 0) == 0);
    options.realization = (opt.count("realization") && !opt.at("realization").empty()) ? std::optional<std::string>(opt.at("realization")) : std::nullopt;
    options.shouts = (opt.count("shouts") && !opt.at("shouts").empty()) ? std::optional<std::string>(opt.at("shouts")) : std::nullopt;

    const auto& emotions = ini.sections.count("emotions") ? ini.sections.at("emotions") : std::map<std::string, std::string>();
    int count = to_int(emotions.count("number") ? emotions.at("number") : "0", 0);

    std::vector<CharEmote> emotes = !ini.block_order.empty() ? read_block_emotes(ini) : read_legacy_emotes(ini, emotions, count);
    if (emotes.empty()) throw Error("char.ini: no emotes; at least one [emote <name>] block or [emotions] row is required");

    CharIni out;
    out.options = std::move(options);
    out.emotes = std::move(emotes);
    out.sections = ini.sections;
    return out;
}

}  // namespace aolib


