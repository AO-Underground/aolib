// AUTO-GENERATED from spec. Do not edit; run aolib-gen.
#include "aolib/schemas_gen.hpp"

#include <nlohmann/json.hpp>

namespace aolib {

const std::map<std::string, nlohmann::ordered_json>& spec_schemas() {
    static const std::map<std::string, nlohmann::ordered_json> schemas = {
        {"/types/AreaUpdateType.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/AreaUpdateType.schema.json",
  "title": "AreaUpdateType",
  "description": "Discriminator for ARUP payloads: 0 = player counts (numbers), 1/2/3 = area metadata strings.",
  "type": "string",
  "enum": [
    "player_count",
    "status",
    "case_manager",
    "locked"
  ],
  "x-wire-ints": [
    0,
    1,
    2,
    3
  ]
}
)AOLIB")},
        {"/types/AuthState.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/AuthState.schema.json",
  "type": "string",
  "title": "AuthState",
  "description": "Moderator authentication state (AUTH packet).",
  "enum": [
    "logout",
    "failed",
    "success"
  ],
  "x-wire-ints": [
    -1,
    0,
    1
  ],
  "x-enum-description": [
    "logout, hides the guard button",
    "unsuccessful login attempt",
    "successful login, shows the guard button"
  ]
}
)AOLIB")},
        {"/types/CharAvailability.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/CharAvailability.schema.json",
  "type": "string",
  "title": "CharAvailability",
  "description": "Per-character availability in a CharsCheck list.",
  "enum": [
    "free",
    "taken"
  ],
  "x-wire-ints": [
    0,
    -1
  ]
}
)AOLIB")},
        {"/types/DeskModifier.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/DeskModifier.schema.json",
  "title": "DeskModifier",
  "description": "Desk visibility behavior.",
  "type": "string",
  "enum": [
    "hidden",
    "shown",
    "hide_during_preanim",
    "show_during_preanim",
    "hide_and_center_during_preanim",
    "show_during_preanim_then_center"
  ],
  "x-wire-ints": [
    0,
    1,
    2,
    3,
    4,
    5
  ]
}
)AOLIB")},
        {"/types/Effect.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/Effect.schema.json",
  "title": "Effect",
  "description": "MS screen-effect overlay request: effect name, misc folder, and sound, packed into one `name|folder|sound` wire slot. An all-empty value is the no-effect sentinel and encodes to an empty slot.",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "default": ""
    },
    "folder": {
      "type": "string",
      "default": ""
    },
    "sound": {
      "type": "string",
      "default": ""
    }
  },
  "required": [
    "name",
    "folder",
    "sound"
  ],
  "additionalProperties": false,
  "x-fanta-separator": "|"
}
)AOLIB")},
        {"/types/EmoteModifier.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/EmoteModifier.schema.json",
  "title": "EmoteModifier",
  "description": "Emote behavior selector. Wire values 3 and 4 have no defined behavior and are carried as-is.",
  "type": "string",
  "enum": [
    "no_preanim",
    "preanim",
    "preanim_and_objection",
    "unused_3",
    "unused_4",
    "zoom",
    "objection_zoom"
  ],
  "x-wire-ints": [
    0,
    1,
    2,
    3,
    4,
    5,
    6
  ],
  "x-enum-description": [
    "no preanimation",
    "play the preanimation",
    "play the preanimation, with an objection",
    "undefined",
    "undefined",
    "zoom background, no preanimation",
    "preanimation, then zoom background"
  ]
}
)AOLIB")},
        {"/types/Flip.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/Flip.schema.json",
  "title": "Flip",
  "description": "Sprite mirroring.",
  "type": "string",
  "enum": [
    "none",
    "horizontal",
    "vertical",
    "horizontal_and_vertical"
  ],
  "x-wire-ints": [
    0,
    1,
    2,
    3
  ]
}
)AOLIB")},
        {"/types/JudgeState.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/JudgeState.schema.json",
  "type": "string",
  "title": "JudgeState",
  "description": "Judge-control visibility carried by the JD packet.",
  "enum": [
    "by_position",
    "hidden",
    "shown"
  ],
  "x-wire-ints": [
    -1,
    0,
    1
  ],
  "x-enum-description": [
    "show or hide by the client's seat (shown when jud)",
    "hide the judge controls",
    "show the judge controls"
  ]
}
)AOLIB")},
        {"/types/MusicChannel.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/MusicChannel.schema.json",
  "title": "MusicChannel",
  "description": "MC audio channel.",
  "type": "string",
  "enum": [
    "music",
    "ambience"
  ],
  "x-wire-ints": [
    0,
    1
  ],
  "x-enum-description": [
    "main track, shown as now playing",
    "ambience layer under the music"
  ]
}
)AOLIB")},
        {"/types/MusicEffects.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/MusicEffects.schema.json",
  "title": "MusicEffects",
  "description": "Transition effects for an MC track change.",
  "type": "object",
  "properties": {
    "fade_in": {
      "type": "boolean",
      "default": false,
      "description": "The new track fades in."
    },
    "fade_out": {
      "type": "boolean",
      "default": false,
      "description": "The track already playing on the channel fades out instead of stopping."
    },
    "sync_position": {
      "type": "boolean",
      "default": false,
      "description": "The new track starts at the previous track's playback position."
    }
  },
  "required": [
    "fade_in",
    "fade_out",
    "sync_position"
  ],
  "additionalProperties": false,
  "x-wire-bits": [
    1,
    2,
    4
  ]
}
)AOLIB")},
        {"/types/Offset.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/Offset.schema.json",
  "title": "Offset",
  "description": "Integer (x, y) screen-coordinate pair carried in MS offset / paired_offset slots.",
  "type": "object",
  "properties": {
    "x": {
      "type": "number",
      "description": "Horizontal offset, in percent of the viewport."
    },
    "y": {
      "type": "number",
      "default": 0,
      "description": "Vertical offset, in percent of the viewport. Legacy senders without `y_offset` send only `x`; a missing `y` is 0."
    }
  },
  "required": [
    "x",
    "y"
  ],
  "additionalProperties": false,
  "x-fanta-unescape-amp": true
}
)AOLIB")},
        {"/types/PenaltyBar.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/PenaltyBar.schema.json",
  "type": "string",
  "title": "PenaltyBar",
  "description": "Which penalty (health) bar an HP packet updates.",
  "enum": [
    "defense",
    "prosecution"
  ],
  "x-wire-ints": [
    1,
    2
  ]
}
)AOLIB")},
        {"/types/PlayerDataType.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/PlayerDataType.schema.json",
  "type": "string",
  "title": "PlayerDataType",
  "description": "PU packet field selector: which playerlist datum the packet updates.",
  "enum": [
    "ooc_name",
    "char_name",
    "showname",
    "area_id"
  ],
  "x-wire-ints": [
    0,
    1,
    2,
    3
  ]
}
)AOLIB")},
        {"/types/PlayerListUpdate.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/PlayerListUpdate.schema.json",
  "type": "string",
  "title": "PlayerListUpdate",
  "description": "PR packet update type: add or remove a player from the playerlist.",
  "enum": [
    "add",
    "remove"
  ],
  "x-wire-ints": [
    0,
    1
  ]
}
)AOLIB")},
        {"/types/RTAnimation.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/RTAnimation.schema.json",
  "title": "RTAnimation",
  "description": "Judge-control overlay animation played by RT.",
  "type": "string",
  "enum": [
    "witness_testimony",
    "cross_examination",
    "not_guilty",
    "guilty",
    "end_animation",
    "custom"
  ],
  "x-enum-description": [
    "Witness Testimony; loops on the testimony layer",
    "Cross Examination",
    "Not Guilty verdict",
    "Guilty verdict",
    "stops any looping animation on the testimony layer",
    "custom WTCE named by `name`"
  ]
}
)AOLIB")},
        {"/types/ShoutModifier.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/ShoutModifier.schema.json",
  "title": "ShoutModifier",
  "description": "Shout / objection selector.",
  "type": "string",
  "enum": [
    "none",
    "hold_it",
    "objection",
    "take_that",
    "custom"
  ],
  "x-wire-ints": [
    0,
    1,
    2,
    3,
    4
  ]
}
)AOLIB")},
        {"/types/Side.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/Side.schema.json",
  "title": "Side",
  "description": "Character position. Wire values are the lowercase 3-letter codes.",
  "type": "string",
  "enum": [
    "def",
    "pro",
    "hld",
    "hlp",
    "wit",
    "jud",
    "jur",
    "sea"
  ],
  "x-enum-description": [
    "defense",
    "prosecution",
    "defense_helper",
    "prosecution_helper",
    "witness",
    "judge",
    "jury",
    "seance"
  ]
}
)AOLIB")},
        {"/types/TextColor.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/TextColor.schema.json",
  "title": "TextColor",
  "description": "Chat message text color. `blue` also disables the talking animation.",
  "type": "string",
  "enum": [
    "white",
    "green",
    "red",
    "orange",
    "blue",
    "yellow",
    "pink",
    "cyan",
    "grey",
    "rainbow"
  ],
  "x-wire-ints": [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9
  ]
}
)AOLIB")},
        {"/types/TimerCommand.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/TimerCommand.schema.json",
  "type": "string",
  "title": "TimerCommand",
  "description": "TI packet command: how to manipulate a timer.",
  "enum": [
    "start",
    "pause",
    "show",
    "hide"
  ],
  "x-wire-ints": [
    0,
    1,
    2,
    3
  ],
  "x-enum-description": [
    "start, resume, or sync at time",
    "pause at time",
    "show the timer",
    "hide the timer"
  ]
}
)AOLIB")},
        {"/packets/schemas/ARUP.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/ARUP.schema.json",
  "title": "ARUP",
  "description": "Refreshes one column of the area list (player counts, status, case managers or lock state). Wire form in CODECS.md.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "ARUP"
    },
    "update_type": {
      "$ref": "../../types/AreaUpdateType.schema.json",
      "description": "Which column `update_data` carries."
    },
    "update_data": {
      "type": "array",
      "items": {
        "type": [
          "integer",
          "string"
        ]
      },
      "description": "One value per area, in FA order: an integer for `player_count`, otherwise a string (status, case manager names, or a lock state such as `FREE`, `SPECTATABLE`, `LOCKED`)."
    }
  },
  "required": [
    "$header",
    "update_type",
    "update_data"
  ],
  "additionalProperties": false,
  "x-fanta-codec": "ARUP",
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/ASS.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/ASS.schema.json",
  "title": "ASS",
  "description": "Base URL the client downloads missing assets from.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "ASS"
    },
    "asset_url": {
      "type": "string",
      "description": "Base URL that asset paths (e.g. `sounds/music/<name>`) are appended to. webAO ignores the value `None`."
    }
  },
  "required": [
    "$header",
    "asset_url"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/AUTH.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/AUTH.schema.json",
  "title": "AUTH",
  "description": "Result of a moderator login or logout.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "AUTH"
    },
    "auth_state": {
      "$ref": "../../types/AuthState.schema.json",
      "description": "Login result."
    }
  },
  "required": [
    "$header",
    "auth_state"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/BB.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/BB.schema.json",
  "title": "BB",
  "description": "Server notice shown to the client in a popup.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "BB"
    },
    "message": {
      "type": "string",
      "description": "Notice text."
    }
  },
  "required": [
    "$header",
    "message"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/BD.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/BD.schema.json",
  "title": "BD",
  "description": "Tells a connecting client it is banned.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "BD"
    },
    "reason": {
      "type": "string",
      "description": "Ban reason shown to the player."
    }
  },
  "required": [
    "$header",
    "reason"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/BN.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/BN.schema.json",
  "title": "BN",
  "description": "Changes the area background, optionally moving the client to a position.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "BN"
    },
    "background": {
      "type": "string",
      "description": "Background folder name."
    },
    "position": {
      "type": "string",
      "default": "",
      "description": "Position to move the client to; empty leaves it unchanged."
    }
  },
  "required": [
    "$header",
    "background"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/CASEAToClient.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CASEAToClient.schema.json",
  "title": "CASEA",
  "description": "Case announcement relayed by the server to clients whose SETCASE preferences match.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CASEA"
    },
    "message": {
      "type": "string",
      "description": "Server-formatted announcement text."
    },
    "need_def": {
      "type": "boolean",
      "default": false,
      "description": "The case needs defense."
    },
    "need_pro": {
      "type": "boolean",
      "default": false,
      "description": "The case needs prosecution."
    },
    "need_judge": {
      "type": "boolean",
      "default": false,
      "description": "The case needs judge."
    },
    "need_jury": {
      "type": "boolean",
      "default": false,
      "description": "The case needs jury."
    },
    "need_steno": {
      "type": "boolean",
      "default": false,
      "description": "The case needs stenographer."
    },
    "_legacy": {
      "type": "string",
      "const": "1",
      "default": "1"
    }
  },
  "required": [
    "$header",
    "message",
    "_legacy"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/CASEAToServer.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CASEAToServer.schema.json",
  "title": "CASEA",
  "description": "Announces a case, naming the roles it needs; the server alerts clients whose SETCASE preferences match.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CASEA"
    },
    "title": {
      "type": "string",
      "default": "",
      "description": "Case title; empty for an untitled case."
    },
    "need_def": {
      "type": "boolean",
      "default": false,
      "description": "The case needs defense."
    },
    "need_pro": {
      "type": "boolean",
      "default": false,
      "description": "The case needs prosecution."
    },
    "need_judge": {
      "type": "boolean",
      "default": false,
      "description": "The case needs judge."
    },
    "need_jury": {
      "type": "boolean",
      "default": false,
      "description": "The case needs jury."
    },
    "need_steno": {
      "type": "boolean",
      "default": false,
      "description": "The case needs stenographer."
    }
  },
  "required": [
    "$header"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/CC.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CC.schema.json",
  "title": "CC",
  "description": "Character selection request; the server confirms with PV.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CC"
    },
    "player_id": {
      "type": "number",
      "description": "Sender's player ID from IDToClient; servers identify the client by its connection instead."
    },
    "char_id": {
      "type": "number",
      "description": "Index into the SC list, or -1 to spectate."
    },
    "char_password": {
      "type": "string",
      "default": "",
      "description": "Unused; empty."
    }
  },
  "required": [
    "$header",
    "player_id",
    "char_id"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/CH.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CH.schema.json",
  "title": "CH",
  "description": "Keepalive sent periodically from the courtroom; the server answers with CHECK.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CH"
    },
    "char_id": {
      "type": "number",
      "description": "Sender's current character ID."
    }
  },
  "required": [
    "$header",
    "char_id"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/CHECK.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CHECK.schema.json",
  "title": "CHECK",
  "description": "Keepalive reply to CH; the client uses the round trip as its latency.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CHECK"
    }
  },
  "required": [
    "$header"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/CI.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CI.schema.json",
  "title": "CI",
  "description": "Legacy batched character list from before SC; webAO's old loader only.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CI"
    },
    "batch_index": {
      "type": "number",
      "description": "ID of the first character in this batch."
    },
    "entries": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "index": {
            "type": "number",
            "description": "Character ID."
          },
          "data": {
            "type": "string",
            "description": "`&`-joined character info, name first."
          }
        },
        "required": [
          "index",
          "data"
        ],
        "additionalProperties": false
      },
      "description": "Characters in this batch."
    }
  },
  "required": [
    "$header",
    "batch_index",
    "entries"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/CTToClient.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CTToClient.schema.json",
  "title": "CT",
  "description": "Out-of-character chat message.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CT"
    },
    "name": {
      "type": "string",
      "description": "Sender's OOC name, or the server's name for server messages."
    },
    "message": {
      "type": "string",
      "description": "Message text."
    },
    "is_from_server": {
      "type": "boolean",
      "default": false,
      "description": "True for server messages, which clients style differently."
    }
  },
  "required": [
    "$header",
    "name",
    "message"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/CTToServer.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CTToServer.schema.json",
  "title": "CT",
  "description": "Out-of-character chat message; servers treat a leading `/` as a command.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CT"
    },
    "name": {
      "type": "string",
      "description": "Sender's OOC name."
    },
    "message": {
      "type": "string",
      "description": "Message text."
    }
  },
  "required": [
    "$header",
    "name",
    "message"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/CharsCheck.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CharsCheck.schema.json",
  "title": "CharsCheck",
  "description": "Which characters are taken.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CharsCheck"
    },
    "taken": {
      "type": "array",
      "items": {
        "$ref": "../../types/CharAvailability.schema.json"
      },
      "description": "Availability per character, in SC order."
    }
  },
  "required": [
    "$header",
    "taken"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/DE.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/DE.schema.json",
  "title": "DE",
  "description": "Deletes an evidence item from the current area.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "DE"
    },
    "id": {
      "type": "number",
      "description": "Index into the LE list."
    }
  },
  "required": [
    "$header",
    "id"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/DONE.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/DONE.schema.json",
  "title": "DONE",
  "description": "Ends the loading handshake; the client leaves the lobby and enters the courtroom.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "DONE"
    }
  },
  "required": [
    "$header"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/EE.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/EE.schema.json",
  "title": "EE",
  "description": "Replaces an evidence item in the current area.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "EE"
    },
    "id": {
      "type": "number",
      "description": "Index into the LE list."
    },
    "name": {
      "type": "string",
      "description": "Evidence name."
    },
    "description": {
      "type": "string",
      "description": "Evidence description."
    },
    "image": {
      "type": "string",
      "description": "Image filename under `evidence/`."
    }
  },
  "required": [
    "$header",
    "id",
    "name",
    "description",
    "image"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/EI.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/EI.schema.json",
  "title": "EI",
  "description": "Legacy single evidence item sent during loading, from before LE; webAO's old loader only.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "EI"
    },
    "id": {
      "type": "number",
      "description": "Evidence index."
    },
    "details": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Evidence name."
        },
        "description": {
          "type": "string",
          "description": "Evidence description."
        },
        "type": {
          "type": "string",
          "description": "Legacy evidence type; unused."
        },
        "image": {
          "type": "string",
          "description": "Image filename under `evidence/`."
        }
      },
      "required": [
        "name",
        "description",
        "type",
        "image"
      ],
      "additionalProperties": false,
      "description": "The evidence item."
    }
  },
  "required": [
    "$header",
    "id",
    "details"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/EM.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/EM.schema.json",
  "title": "EM",
  "description": "Legacy batched area and music list from before SM; webAO's old loader only.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "EM"
    },
    "batch_index": {
      "type": "number",
      "description": "Index of the first entry in this batch."
    },
    "entries": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "index": {
            "type": "number",
            "description": "Entry index."
          },
          "name": {
            "type": "string",
            "description": "Area, category or track name."
          }
        },
        "required": [
          "index",
          "name"
        ],
        "additionalProperties": false
      },
      "description": "Area names, then music entries, in this batch."
    }
  },
  "required": [
    "$header",
    "batch_index",
    "entries"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/FA.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/FA.schema.json",
  "title": "FA",
  "description": "Full area list; replaces the client's areas.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "FA"
    },
    "areas": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Area names, in the order ARUP values refer to."
    }
  },
  "required": [
    "$header",
    "areas"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/FL.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/FL.schema.json",
  "title": "FL",
  "description": "Optional protocol features the server supports.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "FL"
    },
    "features": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Feature names, e.g. `yellowtext`, `y_offset`, `effects`."
    }
  },
  "required": [
    "$header",
    "features"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/FM.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/FM.schema.json",
  "title": "FM",
  "description": "Full music list; replaces the client's music list.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "FM"
    },
    "music_list": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Track filename, or a category name (no audio extension)."
          }
        },
        "required": [
          "name"
        ],
        "additionalProperties": false
      },
      "description": "Categories and tracks in display order."
    }
  },
  "required": [
    "$header",
    "music_list"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/HI.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/HI.schema.json",
  "title": "HI",
  "description": "Client hardware ID, sent in reply to decryptor; servers use it for bans.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "HI"
    },
    "hdid": {
      "type": "string",
      "description": "Hardware ID string."
    }
  },
  "required": [
    "$header",
    "hdid"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/HPToClient.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/HPToClient.schema.json",
  "title": "HP",
  "description": "Sets a penalty bar.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "HP"
    },
    "bar": {
      "$ref": "../../types/PenaltyBar.schema.json",
      "description": "Which bar."
    },
    "value": {
      "type": "integer",
      "minimum": 0,
      "maximum": 10,
      "description": "Penalty bar fill, 0 (empty) to 10 (full)."
    }
  },
  "required": [
    "$header",
    "bar",
    "value"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/HPToServer.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/HPToServer.schema.json",
  "title": "HP",
  "description": "Requests a penalty bar change.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "HP"
    },
    "bar": {
      "$ref": "../../types/PenaltyBar.schema.json",
      "description": "Which bar."
    },
    "value": {
      "type": "integer",
      "minimum": 0,
      "maximum": 10,
      "description": "Penalty bar fill, 0 (empty) to 10 (full)."
    }
  },
  "required": [
    "$header",
    "bar",
    "value"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/IDToClient.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/IDToClient.schema.json",
  "title": "ID",
  "description": "Server identification, sent after HI; the client replies with its own ID.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "ID"
    },
    "player_id": {
      "type": "number",
      "description": "The client's player ID."
    },
    "software": {
      "type": "string",
      "description": "Server software name."
    },
    "version": {
      "type": "string",
      "description": "Server software version."
    }
  },
  "required": [
    "$header",
    "player_id",
    "software",
    "version"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/IDToServer.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/IDToServer.schema.json",
  "title": "ID",
  "description": "Client identification, sent in reply to IDToClient.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "ID"
    },
    "software": {
      "type": "string",
      "description": "Client software name, e.g. `AO2`."
    },
    "version": {
      "type": "string",
      "description": "Client version."
    }
  },
  "required": [
    "$header",
    "software",
    "version"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/JD.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/JD.schema.json",
  "title": "JD",
  "description": "Shows or hides the judge controls for this client.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "JD"
    },
    "state": {
      "$ref": "../../types/JudgeState.schema.json",
      "description": "Judge-control visibility."
    }
  },
  "required": [
    "$header",
    "state"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/KB.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/KB.schema.json",
  "title": "KB",
  "description": "Tells the client it was banned; the client returns to the lobby.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "KB"
    },
    "reason": {
      "type": "string",
      "description": "Ban reason shown to the player."
    }
  },
  "required": [
    "$header",
    "reason"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/KK.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/KK.schema.json",
  "title": "KK",
  "description": "Tells the client it was kicked; the client returns to the lobby.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "KK"
    },
    "reason": {
      "type": "string",
      "description": "Kick reason shown to the player."
    }
  },
  "required": [
    "$header",
    "reason"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/LE.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/LE.schema.json",
  "title": "LE",
  "description": "Full evidence list for the current area.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "LE"
    },
    "evidence": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Evidence name."
          },
          "description": {
            "type": "string",
            "description": "Evidence description."
          },
          "image": {
            "type": "string",
            "description": "Image filename under `evidence/`."
          }
        },
        "required": [
          "name",
          "description",
          "image"
        ],
        "additionalProperties": false
      },
      "description": "Evidence items in index order."
    }
  },
  "required": [
    "$header",
    "evidence"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/MA.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/MA.schema.json",
  "title": "MA",
  "description": "Moderator action: kicks or bans a player.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "MA"
    },
    "player_id": {
      "type": "number",
      "description": "Target player's ID."
    },
    "duration_minutes": {
      "type": "integer",
      "description": "Ban length in minutes. 0 kicks instead of banning; -1 bans permanently."
    },
    "reason": {
      "type": "string",
      "description": "Reason shown to the target."
    }
  },
  "required": [
    "$header",
    "player_id",
    "duration_minutes",
    "reason"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/MCToClient.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/MCToClient.schema.json",
  "title": "MC",
  "description": "Plays a track on a music channel.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "MC"
    },
    "name": {
      "type": "string",
      "description": "Track filename or URL; `~stop.mp3` stops the channel."
    },
    "char_id": {
      "type": "number",
      "description": "Character who played it, announced in the IC log; -1 (or any non-character) for none."
    },
    "showname": {
      "type": "string",
      "default": "",
      "description": "Name used in the IC log; empty uses the character's showname."
    },
    "looping": {
      "type": "boolean",
      "default": false,
      "description": "Loop the track."
    },
    "channel": {
      "$ref": "../../types/MusicChannel.schema.json",
      "default": "music",
      "description": "Audio channel."
    },
    "effects": {
      "$ref": "../../types/MusicEffects.schema.json",
      "default": {
        "fade_in": false,
        "fade_out": false,
        "sync_position": false
      },
      "description": "Transition effects."
    }
  },
  "required": [
    "$header",
    "name",
    "char_id"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/MCToServer.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/MCToServer.schema.json",
  "title": "MC",
  "description": "Requests a track, or an area change when `name` is an area name.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "MC"
    },
    "name": {
      "type": "string",
      "description": "Track name from the music list, or an area name."
    },
    "char_id": {
      "type": "number",
      "description": "Sender's character ID."
    },
    "showname": {
      "type": "string",
      "default": "",
      "description": "Sender's showname, used in the IC log."
    },
    "effects": {
      "$ref": "../../types/MusicEffects.schema.json",
      "default": {
        "fade_in": false,
        "fade_out": false,
        "sync_position": false
      },
      "description": "Transition effects."
    }
  },
  "required": [
    "$header",
    "name",
    "char_id"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/MSToClient.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/MSToClient.schema.json",
  "title": "MS",
  "description": "In-character message as broadcast by the server, with the pair's data filled in.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "MS"
    },
    "desk_modifier": {
      "$ref": "../../types/DeskModifier.schema.json",
      "default": "shown",
      "description": "Desk visibility for the speaker."
    },
    "preanim": {
      "type": "string",
      "default": "",
      "description": "Preanimation played before the emote; empty or `-` for none."
    },
    "character": {
      "type": "string",
      "description": "Speaker's character folder name."
    },
    "emote": {
      "type": "string",
      "description": "Emote name; the client plays its `(b)` talking and `(a)` idle variants."
    },
    "message": {
      "type": "string",
      "description": "IC message text."
    },
    "side": {
      "$ref": "../../types/Side.schema.json",
      "description": "Speaker's position."
    },
    "sfx_name": {
      "type": "string",
      "default": "",
      "description": "Sound effect to play; `1`, `0` or empty for none."
    },
    "emote_modifier": {
      "$ref": "../../types/EmoteModifier.schema.json",
      "default": "no_preanim",
      "description": "Whether the preanim plays and whether the zoom background is used."
    },
    "char_id": {
      "type": "number",
      "description": "Speaker's character ID."
    },
    "sfx_delay": {
      "type": "number",
      "default": 0,
      "description": "Delay before `sfx_name` plays, in ticks of 40 ms."
    },
    "shout_modifier": {
      "$ref": "../../types/ShoutModifier.schema.json",
      "default": "none",
      "description": "Shout bubble (objection etc.) shown before the message."
    },
    "evidence_id": {
      "type": "number",
      "default": 0,
      "description": "1-based index of the evidence item to present; 0 for none."
    },
    "flip": {
      "$ref": "../../types/Flip.schema.json",
      "default": "none",
      "description": "Mirror the speaker horizontally."
    },
    "realization": {
      "type": "boolean",
      "default": false,
      "description": "Flash the screen and play the realization sound."
    },
    "text_color": {
      "$ref": "../../types/TextColor.schema.json",
      "default": "white",
      "description": "Message text colour."
    },
    "showname": {
      "type": "string",
      "default": "",
      "description": "Name shown in the chatbox; empty uses the character's default showname."
    },
    "paired_charid": {
      "type": "number",
      "default": -1,
      "description": "Paired character's ID, or -1 for no pair."
    },
    "paired_order": {
      "type": "integer",
      "default": 0,
      "description": "Z-order of the paired character relative to the speaker; 0 renders behind (the default), 1 in front. Packed onto paired_charid as `<id>^1` when 1, the bare `<id>` otherwise.",
      "x-fanta-suffix-of": "paired_charid"
    },
    "paired_name": {
      "type": "string",
      "default": "",
      "description": "Paired character's folder name."
    },
    "paired_emote": {
      "type": "string",
      "default": "",
      "description": "Paired character's current emote."
    },
    "offset": {
      "$ref": "../../types/Offset.schema.json",
      "default": {
        "x": 0,
        "y": 0
      },
      "description": "Speaker's horizontal and vertical offset, in percent of the viewport."
    },
    "paired_offset": {
      "$ref": "../../types/Offset.schema.json",
      "default": {
        "x": 0,
        "y": 0
      },
      "description": "Paired character's offset; empty on the wire when there is no pair."
    },
    "paired_flip": {
      "$ref": "../../types/Flip.schema.json",
      "default": "none",
      "description": "Mirror the paired character."
    },
    "noninterrupting_preanim": {
      "type": "boolean",
      "default": false,
      "description": "Show the message while the preanim plays instead of after it."
    },
    "sfx_looping": {
      "type": "boolean",
      "default": false,
      "description": "Loop the sound effect."
    },
    "screenshake": {
      "type": "boolean",
      "default": false,
      "description": "Shake the screen."
    },
    "frames_shake": {
      "type": "string",
      "default": "",
      "description": "Frame-triggered screenshakes from char.ini: one `^`-terminated segment per emote (preanim, `(b)`, `(a)`), each `emote|frame=value|...`."
    },
    "frames_realization": {
      "type": "string",
      "default": "",
      "description": "Frame-triggered realization flashes, in the `frames_shake` format."
    },
    "frames_sfx": {
      "type": "string",
      "default": "",
      "description": "Frame-triggered sound effects, in the `frames_shake` format."
    },
    "additive": {
      "type": "boolean",
      "default": false,
      "description": "Append the message to the previous one instead of replacing it."
    },
    "effect": {
      "$ref": "../../types/Effect.schema.json",
      "default": {
        "name": "",
        "folder": "",
        "sound": ""
      },
      "description": "Screen-effect overlay request, packed on the wire as `name|folder|sound` (see EFFECTS.md)."
    }
  },
  "required": [
    "$header",
    "character",
    "emote",
    "message",
    "side",
    "char_id"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/MSToServer.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/MSToServer.schema.json",
  "title": "MS",
  "description": "In-character message sent by the speaker.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "MS"
    },
    "desk_modifier": {
      "$ref": "../../types/DeskModifier.schema.json",
      "default": "shown",
      "description": "Desk visibility for the speaker."
    },
    "preanim": {
      "type": "string",
      "default": "",
      "description": "Preanimation played before the emote; empty or `-` for none."
    },
    "character": {
      "type": "string",
      "description": "Speaker's character folder name."
    },
    "emote": {
      "type": "string",
      "description": "Emote name; the client plays its `(b)` talking and `(a)` idle variants."
    },
    "message": {
      "type": "string",
      "description": "IC message text."
    },
    "side": {
      "$ref": "../../types/Side.schema.json",
      "description": "Speaker's position."
    },
    "sfx_name": {
      "type": "string",
      "default": "",
      "description": "Sound effect to play; `1`, `0` or empty for none."
    },
    "emote_modifier": {
      "$ref": "../../types/EmoteModifier.schema.json",
      "default": "no_preanim",
      "description": "Whether the preanim plays and whether the zoom background is used."
    },
    "char_id": {
      "type": "number",
      "description": "Speaker's character ID."
    },
    "sfx_delay": {
      "type": "number",
      "default": 0,
      "description": "Delay before `sfx_name` plays, in ticks of 40 ms."
    },
    "shout_modifier": {
      "$ref": "../../types/ShoutModifier.schema.json",
      "default": "none",
      "description": "Shout bubble (objection etc.) shown before the message."
    },
    "evidence_id": {
      "type": "number",
      "default": 0,
      "description": "1-based index of the evidence item to present; 0 for none."
    },
    "flip": {
      "$ref": "../../types/Flip.schema.json",
      "default": "none",
      "description": "Mirror the speaker horizontally."
    },
    "realization": {
      "type": "boolean",
      "default": false,
      "description": "Flash the screen and play the realization sound."
    },
    "text_color": {
      "$ref": "../../types/TextColor.schema.json",
      "default": "white",
      "description": "Message text colour."
    },
    "showname": {
      "type": "string",
      "default": "",
      "description": "Name shown in the chatbox; empty uses the character's default showname."
    },
    "paired_charid": {
      "type": "number",
      "default": -1,
      "description": "Character to pair with, or -1 for no pair."
    },
    "paired_order": {
      "type": "integer",
      "default": 0,
      "description": "Z-order of the paired character relative to the speaker; 0 renders behind (the default), 1 in front. Packed onto paired_charid as `<id>^1` when 1, the bare `<id>` otherwise.",
      "x-fanta-suffix-of": "paired_charid"
    },
    "offset": {
      "$ref": "../../types/Offset.schema.json",
      "default": {
        "x": 0,
        "y": 0
      },
      "description": "Speaker's horizontal and vertical offset, in percent of the viewport."
    },
    "noninterrupting_preanim": {
      "type": "boolean",
      "default": false,
      "description": "Show the message while the preanim plays instead of after it."
    },
    "sfx_looping": {
      "type": "boolean",
      "default": false,
      "description": "Loop the sound effect."
    },
    "screenshake": {
      "type": "boolean",
      "default": false,
      "description": "Shake the screen."
    },
    "frames_shake": {
      "type": "string",
      "default": "",
      "description": "Frame-triggered screenshakes from char.ini: one `^`-terminated segment per emote (preanim, `(b)`, `(a)`), each `emote|frame=value|...`."
    },
    "frames_realization": {
      "type": "string",
      "default": "",
      "description": "Frame-triggered realization flashes, in the `frames_shake` format."
    },
    "frames_sfx": {
      "type": "string",
      "default": "",
      "description": "Frame-triggered sound effects, in the `frames_shake` format."
    },
    "additive": {
      "type": "boolean",
      "default": false,
      "description": "Append the message to the previous one instead of replacing it."
    },
    "effect": {
      "$ref": "../../types/Effect.schema.json",
      "default": {
        "name": "",
        "folder": "",
        "sound": ""
      },
      "description": "Screen-effect overlay request, packed on the wire as `name|folder|sound` (see EFFECTS.md)."
    }
  },
  "required": [
    "$header",
    "character",
    "emote",
    "message",
    "side",
    "char_id"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/PE.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/PE.schema.json",
  "title": "PE",
  "description": "Adds an evidence item to the current area.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "PE"
    },
    "name": {
      "type": "string",
      "description": "Evidence name."
    },
    "description": {
      "type": "string",
      "description": "Evidence description."
    },
    "image": {
      "type": "string",
      "description": "Image filename under `evidence/`."
    }
  },
  "required": [
    "$header",
    "name",
    "description",
    "image"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/PN.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/PN.schema.json",
  "title": "PN",
  "description": "Player count and server description, shown in the lobby.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "PN"
    },
    "player_count": {
      "type": "number",
      "description": "Players online."
    },
    "max_players": {
      "type": "number",
      "description": "Player cap."
    },
    "server_description": {
      "type": "string",
      "default": "",
      "description": "Server description."
    }
  },
  "required": [
    "$header",
    "player_count",
    "max_players"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/PR.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/PR.schema.json",
  "title": "PR",
  "description": "Adds or removes a player-list entry.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "PR"
    },
    "id": {
      "type": "number",
      "description": "Player ID."
    },
    "type": {
      "$ref": "../../types/PlayerListUpdate.schema.json",
      "description": "Add or remove."
    }
  },
  "required": [
    "$header",
    "id",
    "type"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/PU.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/PU.schema.json",
  "title": "PU",
  "description": "Updates one field of a player-list entry.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "PU"
    },
    "id": {
      "type": "number",
      "description": "Player ID."
    },
    "type": {
      "$ref": "../../types/PlayerDataType.schema.json",
      "description": "Which field `data` holds."
    },
    "data": {
      "type": "string",
      "description": "New value; a decimal area index for `area_id`."
    }
  },
  "required": [
    "$header",
    "id",
    "type",
    "data"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/PV.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/PV.schema.json",
  "title": "PV",
  "description": "Confirms a character selection (reply to CC).",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "PV"
    },
    "player_id": {
      "type": "number",
      "description": "Client's player ID; AO2-Client ignores it."
    },
    "_cid": {
      "type": "string",
      "const": "CID",
      "default": "CID"
    },
    "char_id": {
      "type": "number",
      "description": "Character the client now plays, or -1 for spectator."
    }
  },
  "required": [
    "$header",
    "player_id",
    "_cid",
    "char_id"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/RC.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/RC.schema.json",
  "title": "RC",
  "description": "Requests the character list; the server replies with SC.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "RC"
    }
  },
  "required": [
    "$header"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/RD.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/RD.schema.json",
  "title": "RD",
  "description": "Tells the server the client has loaded its lists; the server sends area state and DONE.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "RD"
    }
  },
  "required": [
    "$header"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/RM.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/RM.schema.json",
  "title": "RM",
  "description": "Requests the music list; the server replies with SM.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "RM"
    }
  },
  "required": [
    "$header"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/RMC.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/RMC.schema.json",
  "title": "RMC",
  "description": "Seeks the currently playing track to an offset. Only webAO handles it; AO2-Client ignores it.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "RMC"
    },
    "to_time": {
      "type": "string",
      "description": "Offset into the track, in seconds, as a decimal string."
    }
  },
  "required": [
    "$header",
    "to_time"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/RTToClient.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/RTToClient.schema.json",
  "title": "RT",
  "description": "Plays a testimony or verdict animation.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "RT"
    },
    "animation": {
      "$ref": "../../types/RTAnimation.schema.json",
      "description": "Animation to play."
    },
    "name": {
      "type": "string",
      "default": "",
      "description": "Custom WTCE name; set only when `animation` is `custom`."
    }
  },
  "required": [
    "$header",
    "animation"
  ],
  "additionalProperties": false,
  "if": {
    "required": [
      "animation"
    ],
    "properties": {
      "animation": {
        "const": "custom"
      }
    }
  },
  "then": {
    "required": [
      "name"
    ],
    "properties": {
      "name": {
        "minLength": 1
      }
    }
  },
  "else": {
    "properties": {
      "name": {
        "const": ""
      }
    }
  },
  "x-fanta-codec": "RT",
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/RTToServer.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/RTToServer.schema.json",
  "title": "RT",
  "description": "Requests a testimony or verdict animation.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "RT"
    },
    "animation": {
      "$ref": "../../types/RTAnimation.schema.json",
      "description": "Animation to play."
    },
    "name": {
      "type": "string",
      "default": "",
      "description": "Custom WTCE name; set only when `animation` is `custom`."
    }
  },
  "required": [
    "$header",
    "animation"
  ],
  "additionalProperties": false,
  "if": {
    "required": [
      "animation"
    ],
    "properties": {
      "animation": {
        "const": "custom"
      }
    }
  },
  "then": {
    "required": [
      "name"
    ],
    "properties": {
      "name": {
        "minLength": 1
      }
    }
  },
  "else": {
    "properties": {
      "name": {
        "const": ""
      }
    }
  },
  "x-fanta-codec": "RT",
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/SC.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/SC.schema.json",
  "title": "SC",
  "description": "Character list, sent in reply to RC.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "SC"
    },
    "char_data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Character folder name."
          },
          "desc": {
            "type": "string",
            "default": "",
            "description": "Character description."
          },
          "evidence": {
            "type": "string",
            "default": "",
            "description": "Legacy field; unused."
          }
        },
        "required": [
          "name"
        ],
        "additionalProperties": false
      },
      "description": "Characters in ID order."
    }
  },
  "required": [
    "$header",
    "char_data"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/SETCASE.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/SETCASE.schema.json",
  "title": "SETCASE",
  "description": "Sets which roles the client wants case announcements (CASEA) for.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "SETCASE"
    },
    "cases": {
      "type": "string",
      "default": "",
      "description": "Legacy case-list field; servers ignore it."
    },
    "will_cm": {
      "type": "boolean",
      "default": false,
      "description": "Wants announcements for case manager. tsuserver3 reads it; akashi and Athena ignore it."
    },
    "will_def": {
      "type": "boolean",
      "default": false,
      "description": "Wants announcements needing defense."
    },
    "will_pro": {
      "type": "boolean",
      "default": false,
      "description": "Wants announcements needing prosecution."
    },
    "will_judge": {
      "type": "boolean",
      "default": false,
      "description": "Wants announcements needing judge."
    },
    "will_jury": {
      "type": "boolean",
      "default": false,
      "description": "Wants announcements needing jury."
    },
    "will_steno": {
      "type": "boolean",
      "default": false,
      "description": "Wants announcements needing stenographer."
    }
  },
  "required": [
    "$header"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/SI.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/SI.schema.json",
  "title": "SI",
  "description": "List sizes, sent in reply to askchaa; the client then requests SC with RC.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "SI"
    },
    "char_count": {
      "type": "number",
      "description": "Number of characters."
    },
    "evi_count": {
      "type": "number",
      "description": "Number of evidence items."
    },
    "mus_count": {
      "type": "number",
      "description": "Number of music list entries."
    }
  },
  "required": [
    "$header",
    "char_count",
    "evi_count",
    "mus_count"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/SM.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/SM.schema.json",
  "title": "SM",
  "description": "Legacy combined area and music list, sent in reply to RM; the client replies with RD.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "SM"
    },
    "music_list": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Area, category or track name."
          }
        },
        "required": [
          "name"
        ],
        "additionalProperties": false
      },
      "description": "Area names, then music entries starting at the first name with an audio extension."
    }
  },
  "required": [
    "$header",
    "music_list"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/SP.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/SP.schema.json",
  "title": "SP",
  "description": "Moves the client to a position.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "SP"
    },
    "side": {
      "$ref": "../../types/Side.schema.json",
      "description": "Position to move to."
    }
  },
  "required": [
    "$header",
    "side"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/ST.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/ST.schema.json",
  "title": "ST",
  "description": "Sets the client's theme subtheme; akashi sends it for /subtheme.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "ST"
    },
    "subtheme": {
      "type": "string",
      "description": "Subfolder of the client's current theme to load assets from first."
    },
    "reload": {
      "type": "boolean",
      "default": false,
      "description": "Apply the subtheme and reload the theme now. AO2-Client applies it only with this set, and only when the player's subtheme setting is `server`."
    }
  },
  "required": [
    "$header",
    "subtheme"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/TI.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/TI.schema.json",
  "title": "TI",
  "description": "Controls a countdown clock.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "TI"
    },
    "timer_id": {
      "type": "number",
      "description": "Clock index, 0-4. akashi uses 0 for the global timer and 1-4 for area timers."
    },
    "command": {
      "$ref": "../../types/TimerCommand.schema.json",
      "description": "Clock action."
    },
    "time": {
      "type": "number",
      "default": 0,
      "description": "Clock value in milliseconds for `start` and `pause`; 0 or negative stops the timer. Ignored by `show` and `hide`, which may omit it."
    }
  },
  "required": [
    "$header",
    "timer_id",
    "command"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/ZZToClient.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/ZZToClient.schema.json",
  "title": "ZZ",
  "description": "Mod call notice delivered to moderators.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "ZZ"
    },
    "reason": {
      "type": "string",
      "description": "Server-formatted mod call notice, shown to moderators."
    }
  },
  "required": [
    "$header",
    "reason"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
        {"/packets/schemas/ZZToServer.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/ZZToServer.schema.json",
  "title": "ZZ",
  "description": "Calls a moderator.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "ZZ"
    },
    "reason": {
      "type": "string",
      "default": "",
      "description": "Caller's reason; empty when the server does not advertise `modcall_reason`."
    },
    "reported_player_id": {
      "type": "number",
      "default": -1,
      "description": "ID of the player being reported, or -1 for a general mod call."
    }
  },
  "required": [
    "$header",
    "reason"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/askchaa.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/askchaa.schema.json",
  "title": "askchaa",
  "description": "Asks for the list sizes to start loading; the server replies with SI.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "askchaa"
    }
  },
  "required": [
    "$header"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
}
)AOLIB")},
        {"/packets/schemas/decryptor.schema.json", nlohmann::ordered_json::parse(R"AOLIB({
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/decryptor.schema.json",
  "title": "decryptor",
  "description": "First packet from the server; the client replies with HI.",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "decryptor"
    },
    "value": {
      "type": "string",
      "description": "Legacy encryption key; unused, but AO2-Client ignores the packet when it is empty."
    }
  },
  "required": [
    "$header",
    "value"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
}
)AOLIB")},
    };
    return schemas;
}

}  // namespace aolib
