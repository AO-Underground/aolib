#pragma once

#include <map>
#include <optional>
#include <string>
#include <vector>

#include "aolib/enums_gen.hpp"

namespace aolib {

// One normalized emote, from a `[emote <name>]` block or a legacy bank row.
struct CharEmote {
    std::string key;          // block name, or stringified id for legacy
    std::string name;         // display label
    std::string anim;
    std::optional<std::string> preanim;
    std::optional<std::string> postanim;
    std::optional<std::string> camera;
    EmoteModifier modifier{EmoteModifier::no_preanim};
    DeskModifier deskmod{DeskModifier::shown};
    std::optional<std::string> sound;
    int sounddelayms{0};
    int sounddelayticks{0};
    bool soundlooping{false};
    std::optional<int> preanimdurationms;
};

struct CharIniOptions {
    std::string name;
    std::string showname;
    std::string side{"wit"};
    std::string blips{"male"};
    std::optional<std::string> chat;
    std::optional<std::string> category;
    std::string model;
    std::string scaling{"auto"};
    bool stretch{false};
    std::optional<std::string> realization;
    std::optional<std::string> shouts;
    std::map<std::string, std::string> extra;
};

struct CharIni {
    CharIniOptions options;
    std::vector<CharEmote> emotes;
    std::map<std::string, std::map<std::string, std::string>> sections;
};

// Parse char.ini text (throws Error on malformed input).
CharIni parse_char_ini(const std::string& data);

}  // namespace aolib
