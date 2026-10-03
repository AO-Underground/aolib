// AUTO-GENERATED from spec/types/* (enums). Do not edit; run aolib-gen.
#pragma once

#include <string>

#include "aolib/error.hpp"

namespace aolib {

enum class AreaUpdateType {
    player_count,
    status,
    case_manager,
    locked,
};

inline const char* area_update_type_to_string(AreaUpdateType v) {
    switch (v) {
        case AreaUpdateType::player_count: return "player_count";
        case AreaUpdateType::status: return "status";
        case AreaUpdateType::case_manager: return "case_manager";
        case AreaUpdateType::locked: return "locked";
    }
    return "";
}

inline AreaUpdateType area_update_type_from_string(const std::string& s) {
    if (s == "player_count") return AreaUpdateType::player_count;
    if (s == "status") return AreaUpdateType::status;
    if (s == "case_manager") return AreaUpdateType::case_manager;
    if (s == "locked") return AreaUpdateType::locked;
    throw Error("aolib: unknown AreaUpdateType value '" + s + "'");
}

inline int area_update_type_to_wire(AreaUpdateType v) {
    switch (v) {
        case AreaUpdateType::player_count: return 0;
        case AreaUpdateType::status: return 1;
        case AreaUpdateType::case_manager: return 2;
        case AreaUpdateType::locked: return 3;
    }
    return 0;
}

inline AreaUpdateType area_update_type_from_wire(int n) {
    switch (n) {
        case 0: return AreaUpdateType::player_count;
        case 1: return AreaUpdateType::status;
        case 2: return AreaUpdateType::case_manager;
        case 3: return AreaUpdateType::locked;
    }
    throw Error("aolib: unknown AreaUpdateType wire value " + std::to_string(n));
}

enum class AuthState {
    logout,
    failed,
    success,
};

inline const char* auth_state_to_string(AuthState v) {
    switch (v) {
        case AuthState::logout: return "logout";
        case AuthState::failed: return "failed";
        case AuthState::success: return "success";
    }
    return "";
}

inline AuthState auth_state_from_string(const std::string& s) {
    if (s == "logout") return AuthState::logout;
    if (s == "failed") return AuthState::failed;
    if (s == "success") return AuthState::success;
    throw Error("aolib: unknown AuthState value '" + s + "'");
}

inline int auth_state_to_wire(AuthState v) {
    switch (v) {
        case AuthState::logout: return -1;
        case AuthState::failed: return 0;
        case AuthState::success: return 1;
    }
    return 0;
}

inline AuthState auth_state_from_wire(int n) {
    switch (n) {
        case -1: return AuthState::logout;
        case 0: return AuthState::failed;
        case 1: return AuthState::success;
    }
    throw Error("aolib: unknown AuthState wire value " + std::to_string(n));
}

enum class CharAvailability {
    free,
    taken,
};

inline const char* char_availability_to_string(CharAvailability v) {
    switch (v) {
        case CharAvailability::free: return "free";
        case CharAvailability::taken: return "taken";
    }
    return "";
}

inline CharAvailability char_availability_from_string(const std::string& s) {
    if (s == "free") return CharAvailability::free;
    if (s == "taken") return CharAvailability::taken;
    throw Error("aolib: unknown CharAvailability value '" + s + "'");
}

inline int char_availability_to_wire(CharAvailability v) {
    switch (v) {
        case CharAvailability::free: return 0;
        case CharAvailability::taken: return -1;
    }
    return 0;
}

inline CharAvailability char_availability_from_wire(int n) {
    switch (n) {
        case 0: return CharAvailability::free;
        case -1: return CharAvailability::taken;
    }
    throw Error("aolib: unknown CharAvailability wire value " + std::to_string(n));
}

enum class DeskModifier {
    hidden,
    shown,
    hide_during_preanim,
    show_during_preanim,
    hide_and_center_during_preanim,
    show_during_preanim_then_center,
};

inline const char* desk_modifier_to_string(DeskModifier v) {
    switch (v) {
        case DeskModifier::hidden: return "hidden";
        case DeskModifier::shown: return "shown";
        case DeskModifier::hide_during_preanim: return "hide_during_preanim";
        case DeskModifier::show_during_preanim: return "show_during_preanim";
        case DeskModifier::hide_and_center_during_preanim: return "hide_and_center_during_preanim";
        case DeskModifier::show_during_preanim_then_center: return "show_during_preanim_then_center";
    }
    return "";
}

inline DeskModifier desk_modifier_from_string(const std::string& s) {
    if (s == "hidden") return DeskModifier::hidden;
    if (s == "shown") return DeskModifier::shown;
    if (s == "hide_during_preanim") return DeskModifier::hide_during_preanim;
    if (s == "show_during_preanim") return DeskModifier::show_during_preanim;
    if (s == "hide_and_center_during_preanim") return DeskModifier::hide_and_center_during_preanim;
    if (s == "show_during_preanim_then_center") return DeskModifier::show_during_preanim_then_center;
    throw Error("aolib: unknown DeskModifier value '" + s + "'");
}

inline int desk_modifier_to_wire(DeskModifier v) {
    switch (v) {
        case DeskModifier::hidden: return 0;
        case DeskModifier::shown: return 1;
        case DeskModifier::hide_during_preanim: return 2;
        case DeskModifier::show_during_preanim: return 3;
        case DeskModifier::hide_and_center_during_preanim: return 4;
        case DeskModifier::show_during_preanim_then_center: return 5;
    }
    return 0;
}

inline DeskModifier desk_modifier_from_wire(int n) {
    switch (n) {
        case 0: return DeskModifier::hidden;
        case 1: return DeskModifier::shown;
        case 2: return DeskModifier::hide_during_preanim;
        case 3: return DeskModifier::show_during_preanim;
        case 4: return DeskModifier::hide_and_center_during_preanim;
        case 5: return DeskModifier::show_during_preanim_then_center;
    }
    throw Error("aolib: unknown DeskModifier wire value " + std::to_string(n));
}

enum class EmoteModifier {
    no_preanim,
    preanim,
    preanim_and_objection,
    unused_3,
    unused_4,
    zoom,
    objection_zoom,
};

inline const char* emote_modifier_to_string(EmoteModifier v) {
    switch (v) {
        case EmoteModifier::no_preanim: return "no_preanim";
        case EmoteModifier::preanim: return "preanim";
        case EmoteModifier::preanim_and_objection: return "preanim_and_objection";
        case EmoteModifier::unused_3: return "unused_3";
        case EmoteModifier::unused_4: return "unused_4";
        case EmoteModifier::zoom: return "zoom";
        case EmoteModifier::objection_zoom: return "objection_zoom";
    }
    return "";
}

inline EmoteModifier emote_modifier_from_string(const std::string& s) {
    if (s == "no_preanim") return EmoteModifier::no_preanim;
    if (s == "preanim") return EmoteModifier::preanim;
    if (s == "preanim_and_objection") return EmoteModifier::preanim_and_objection;
    if (s == "unused_3") return EmoteModifier::unused_3;
    if (s == "unused_4") return EmoteModifier::unused_4;
    if (s == "zoom") return EmoteModifier::zoom;
    if (s == "objection_zoom") return EmoteModifier::objection_zoom;
    throw Error("aolib: unknown EmoteModifier value '" + s + "'");
}

inline int emote_modifier_to_wire(EmoteModifier v) {
    switch (v) {
        case EmoteModifier::no_preanim: return 0;
        case EmoteModifier::preanim: return 1;
        case EmoteModifier::preanim_and_objection: return 2;
        case EmoteModifier::unused_3: return 3;
        case EmoteModifier::unused_4: return 4;
        case EmoteModifier::zoom: return 5;
        case EmoteModifier::objection_zoom: return 6;
    }
    return 0;
}

inline EmoteModifier emote_modifier_from_wire(int n) {
    switch (n) {
        case 0: return EmoteModifier::no_preanim;
        case 1: return EmoteModifier::preanim;
        case 2: return EmoteModifier::preanim_and_objection;
        case 3: return EmoteModifier::unused_3;
        case 4: return EmoteModifier::unused_4;
        case 5: return EmoteModifier::zoom;
        case 6: return EmoteModifier::objection_zoom;
    }
    throw Error("aolib: unknown EmoteModifier wire value " + std::to_string(n));
}

enum class Flip {
    none,
    horizontal,
    vertical,
    horizontal_and_vertical,
};

inline const char* flip_to_string(Flip v) {
    switch (v) {
        case Flip::none: return "none";
        case Flip::horizontal: return "horizontal";
        case Flip::vertical: return "vertical";
        case Flip::horizontal_and_vertical: return "horizontal_and_vertical";
    }
    return "";
}

inline Flip flip_from_string(const std::string& s) {
    if (s == "none") return Flip::none;
    if (s == "horizontal") return Flip::horizontal;
    if (s == "vertical") return Flip::vertical;
    if (s == "horizontal_and_vertical") return Flip::horizontal_and_vertical;
    throw Error("aolib: unknown Flip value '" + s + "'");
}

inline int flip_to_wire(Flip v) {
    switch (v) {
        case Flip::none: return 0;
        case Flip::horizontal: return 1;
        case Flip::vertical: return 2;
        case Flip::horizontal_and_vertical: return 3;
    }
    return 0;
}

inline Flip flip_from_wire(int n) {
    switch (n) {
        case 0: return Flip::none;
        case 1: return Flip::horizontal;
        case 2: return Flip::vertical;
        case 3: return Flip::horizontal_and_vertical;
    }
    throw Error("aolib: unknown Flip wire value " + std::to_string(n));
}

enum class JudgeState {
    by_position,
    hidden,
    shown,
};

inline const char* judge_state_to_string(JudgeState v) {
    switch (v) {
        case JudgeState::by_position: return "by_position";
        case JudgeState::hidden: return "hidden";
        case JudgeState::shown: return "shown";
    }
    return "";
}

inline JudgeState judge_state_from_string(const std::string& s) {
    if (s == "by_position") return JudgeState::by_position;
    if (s == "hidden") return JudgeState::hidden;
    if (s == "shown") return JudgeState::shown;
    throw Error("aolib: unknown JudgeState value '" + s + "'");
}

inline int judge_state_to_wire(JudgeState v) {
    switch (v) {
        case JudgeState::by_position: return -1;
        case JudgeState::hidden: return 0;
        case JudgeState::shown: return 1;
    }
    return 0;
}

inline JudgeState judge_state_from_wire(int n) {
    switch (n) {
        case -1: return JudgeState::by_position;
        case 0: return JudgeState::hidden;
        case 1: return JudgeState::shown;
    }
    throw Error("aolib: unknown JudgeState wire value " + std::to_string(n));
}

enum class MusicChannel {
    music,
    ambience,
};

inline const char* music_channel_to_string(MusicChannel v) {
    switch (v) {
        case MusicChannel::music: return "music";
        case MusicChannel::ambience: return "ambience";
    }
    return "";
}

inline MusicChannel music_channel_from_string(const std::string& s) {
    if (s == "music") return MusicChannel::music;
    if (s == "ambience") return MusicChannel::ambience;
    throw Error("aolib: unknown MusicChannel value '" + s + "'");
}

inline int music_channel_to_wire(MusicChannel v) {
    switch (v) {
        case MusicChannel::music: return 0;
        case MusicChannel::ambience: return 1;
    }
    return 0;
}

inline MusicChannel music_channel_from_wire(int n) {
    switch (n) {
        case 0: return MusicChannel::music;
        case 1: return MusicChannel::ambience;
    }
    throw Error("aolib: unknown MusicChannel wire value " + std::to_string(n));
}

enum class PenaltyBar {
    defense,
    prosecution,
};

inline const char* penalty_bar_to_string(PenaltyBar v) {
    switch (v) {
        case PenaltyBar::defense: return "defense";
        case PenaltyBar::prosecution: return "prosecution";
    }
    return "";
}

inline PenaltyBar penalty_bar_from_string(const std::string& s) {
    if (s == "defense") return PenaltyBar::defense;
    if (s == "prosecution") return PenaltyBar::prosecution;
    throw Error("aolib: unknown PenaltyBar value '" + s + "'");
}

inline int penalty_bar_to_wire(PenaltyBar v) {
    switch (v) {
        case PenaltyBar::defense: return 1;
        case PenaltyBar::prosecution: return 2;
    }
    return 0;
}

inline PenaltyBar penalty_bar_from_wire(int n) {
    switch (n) {
        case 1: return PenaltyBar::defense;
        case 2: return PenaltyBar::prosecution;
    }
    throw Error("aolib: unknown PenaltyBar wire value " + std::to_string(n));
}

enum class PlayerDataType {
    ooc_name,
    char_name,
    showname,
    area_id,
};

inline const char* player_data_type_to_string(PlayerDataType v) {
    switch (v) {
        case PlayerDataType::ooc_name: return "ooc_name";
        case PlayerDataType::char_name: return "char_name";
        case PlayerDataType::showname: return "showname";
        case PlayerDataType::area_id: return "area_id";
    }
    return "";
}

inline PlayerDataType player_data_type_from_string(const std::string& s) {
    if (s == "ooc_name") return PlayerDataType::ooc_name;
    if (s == "char_name") return PlayerDataType::char_name;
    if (s == "showname") return PlayerDataType::showname;
    if (s == "area_id") return PlayerDataType::area_id;
    throw Error("aolib: unknown PlayerDataType value '" + s + "'");
}

inline int player_data_type_to_wire(PlayerDataType v) {
    switch (v) {
        case PlayerDataType::ooc_name: return 0;
        case PlayerDataType::char_name: return 1;
        case PlayerDataType::showname: return 2;
        case PlayerDataType::area_id: return 3;
    }
    return 0;
}

inline PlayerDataType player_data_type_from_wire(int n) {
    switch (n) {
        case 0: return PlayerDataType::ooc_name;
        case 1: return PlayerDataType::char_name;
        case 2: return PlayerDataType::showname;
        case 3: return PlayerDataType::area_id;
    }
    throw Error("aolib: unknown PlayerDataType wire value " + std::to_string(n));
}

enum class PlayerListUpdate {
    add,
    remove,
};

inline const char* player_list_update_to_string(PlayerListUpdate v) {
    switch (v) {
        case PlayerListUpdate::add: return "add";
        case PlayerListUpdate::remove: return "remove";
    }
    return "";
}

inline PlayerListUpdate player_list_update_from_string(const std::string& s) {
    if (s == "add") return PlayerListUpdate::add;
    if (s == "remove") return PlayerListUpdate::remove;
    throw Error("aolib: unknown PlayerListUpdate value '" + s + "'");
}

inline int player_list_update_to_wire(PlayerListUpdate v) {
    switch (v) {
        case PlayerListUpdate::add: return 0;
        case PlayerListUpdate::remove: return 1;
    }
    return 0;
}

inline PlayerListUpdate player_list_update_from_wire(int n) {
    switch (n) {
        case 0: return PlayerListUpdate::add;
        case 1: return PlayerListUpdate::remove;
    }
    throw Error("aolib: unknown PlayerListUpdate wire value " + std::to_string(n));
}

enum class RTAnimation {
    witness_testimony,
    cross_examination,
    not_guilty,
    guilty,
    end_animation,
    custom,
};

inline const char* r_t_animation_to_string(RTAnimation v) {
    switch (v) {
        case RTAnimation::witness_testimony: return "witness_testimony";
        case RTAnimation::cross_examination: return "cross_examination";
        case RTAnimation::not_guilty: return "not_guilty";
        case RTAnimation::guilty: return "guilty";
        case RTAnimation::end_animation: return "end_animation";
        case RTAnimation::custom: return "custom";
    }
    return "";
}

inline RTAnimation r_t_animation_from_string(const std::string& s) {
    if (s == "witness_testimony") return RTAnimation::witness_testimony;
    if (s == "cross_examination") return RTAnimation::cross_examination;
    if (s == "not_guilty") return RTAnimation::not_guilty;
    if (s == "guilty") return RTAnimation::guilty;
    if (s == "end_animation") return RTAnimation::end_animation;
    if (s == "custom") return RTAnimation::custom;
    throw Error("aolib: unknown RTAnimation value '" + s + "'");
}

enum class ShoutModifier {
    none,
    hold_it,
    objection,
    take_that,
    custom,
};

inline const char* shout_modifier_to_string(ShoutModifier v) {
    switch (v) {
        case ShoutModifier::none: return "none";
        case ShoutModifier::hold_it: return "hold_it";
        case ShoutModifier::objection: return "objection";
        case ShoutModifier::take_that: return "take_that";
        case ShoutModifier::custom: return "custom";
    }
    return "";
}

inline ShoutModifier shout_modifier_from_string(const std::string& s) {
    if (s == "none") return ShoutModifier::none;
    if (s == "hold_it") return ShoutModifier::hold_it;
    if (s == "objection") return ShoutModifier::objection;
    if (s == "take_that") return ShoutModifier::take_that;
    if (s == "custom") return ShoutModifier::custom;
    throw Error("aolib: unknown ShoutModifier value '" + s + "'");
}

inline int shout_modifier_to_wire(ShoutModifier v) {
    switch (v) {
        case ShoutModifier::none: return 0;
        case ShoutModifier::hold_it: return 1;
        case ShoutModifier::objection: return 2;
        case ShoutModifier::take_that: return 3;
        case ShoutModifier::custom: return 4;
    }
    return 0;
}

inline ShoutModifier shout_modifier_from_wire(int n) {
    switch (n) {
        case 0: return ShoutModifier::none;
        case 1: return ShoutModifier::hold_it;
        case 2: return ShoutModifier::objection;
        case 3: return ShoutModifier::take_that;
        case 4: return ShoutModifier::custom;
    }
    throw Error("aolib: unknown ShoutModifier wire value " + std::to_string(n));
}

enum class Side {
    def,
    pro,
    hld,
    hlp,
    wit,
    jud,
    jur,
    sea,
};

inline const char* side_to_string(Side v) {
    switch (v) {
        case Side::def: return "def";
        case Side::pro: return "pro";
        case Side::hld: return "hld";
        case Side::hlp: return "hlp";
        case Side::wit: return "wit";
        case Side::jud: return "jud";
        case Side::jur: return "jur";
        case Side::sea: return "sea";
    }
    return "";
}

inline Side side_from_string(const std::string& s) {
    if (s == "def") return Side::def;
    if (s == "pro") return Side::pro;
    if (s == "hld") return Side::hld;
    if (s == "hlp") return Side::hlp;
    if (s == "wit") return Side::wit;
    if (s == "jud") return Side::jud;
    if (s == "jur") return Side::jur;
    if (s == "sea") return Side::sea;
    throw Error("aolib: unknown Side value '" + s + "'");
}

enum class TextColor {
    white,
    green,
    red,
    orange,
    blue,
    yellow,
    pink,
    cyan,
    grey,
    rainbow,
};

inline const char* text_color_to_string(TextColor v) {
    switch (v) {
        case TextColor::white: return "white";
        case TextColor::green: return "green";
        case TextColor::red: return "red";
        case TextColor::orange: return "orange";
        case TextColor::blue: return "blue";
        case TextColor::yellow: return "yellow";
        case TextColor::pink: return "pink";
        case TextColor::cyan: return "cyan";
        case TextColor::grey: return "grey";
        case TextColor::rainbow: return "rainbow";
    }
    return "";
}

inline TextColor text_color_from_string(const std::string& s) {
    if (s == "white") return TextColor::white;
    if (s == "green") return TextColor::green;
    if (s == "red") return TextColor::red;
    if (s == "orange") return TextColor::orange;
    if (s == "blue") return TextColor::blue;
    if (s == "yellow") return TextColor::yellow;
    if (s == "pink") return TextColor::pink;
    if (s == "cyan") return TextColor::cyan;
    if (s == "grey") return TextColor::grey;
    if (s == "rainbow") return TextColor::rainbow;
    throw Error("aolib: unknown TextColor value '" + s + "'");
}

inline int text_color_to_wire(TextColor v) {
    switch (v) {
        case TextColor::white: return 0;
        case TextColor::green: return 1;
        case TextColor::red: return 2;
        case TextColor::orange: return 3;
        case TextColor::blue: return 4;
        case TextColor::yellow: return 5;
        case TextColor::pink: return 6;
        case TextColor::cyan: return 7;
        case TextColor::grey: return 8;
        case TextColor::rainbow: return 9;
    }
    return 0;
}

inline TextColor text_color_from_wire(int n) {
    switch (n) {
        case 0: return TextColor::white;
        case 1: return TextColor::green;
        case 2: return TextColor::red;
        case 3: return TextColor::orange;
        case 4: return TextColor::blue;
        case 5: return TextColor::yellow;
        case 6: return TextColor::pink;
        case 7: return TextColor::cyan;
        case 8: return TextColor::grey;
        case 9: return TextColor::rainbow;
    }
    throw Error("aolib: unknown TextColor wire value " + std::to_string(n));
}

enum class TimerCommand {
    start,
    pause,
    show,
    hide,
};

inline const char* timer_command_to_string(TimerCommand v) {
    switch (v) {
        case TimerCommand::start: return "start";
        case TimerCommand::pause: return "pause";
        case TimerCommand::show: return "show";
        case TimerCommand::hide: return "hide";
    }
    return "";
}

inline TimerCommand timer_command_from_string(const std::string& s) {
    if (s == "start") return TimerCommand::start;
    if (s == "pause") return TimerCommand::pause;
    if (s == "show") return TimerCommand::show;
    if (s == "hide") return TimerCommand::hide;
    throw Error("aolib: unknown TimerCommand value '" + s + "'");
}

inline int timer_command_to_wire(TimerCommand v) {
    switch (v) {
        case TimerCommand::start: return 0;
        case TimerCommand::pause: return 1;
        case TimerCommand::show: return 2;
        case TimerCommand::hide: return 3;
    }
    return 0;
}

inline TimerCommand timer_command_from_wire(int n) {
    switch (n) {
        case 0: return TimerCommand::start;
        case 1: return TimerCommand::pause;
        case 2: return TimerCommand::show;
        case 3: return TimerCommand::hide;
    }
    throw Error("aolib: unknown TimerCommand wire value " + std::to_string(n));
}

}  // namespace aolib
