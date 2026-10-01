// AUTO-GENERATED from spec/. Do not edit; run `bun run codegen`.

export const AreaUpdateTypeEnumSchema = {
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
};

export const AuthStateEnumSchema = {
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
};

export const CharAvailabilityEnumSchema = {
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
};

export const DeskModifierEnumSchema = {
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
};

export const EmoteModifierEnumSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/EmoteModifier.schema.json",
  "title": "EmoteModifier",
  "description": "Emote behavior selector. Spec values 3 and 4 are documented as unused.",
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
  ]
};

export const FlipEnumSchema = {
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
};

export const JudgeStateEnumSchema = {
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
};

export const MusicChannelEnumSchema = {
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
};

export const PenaltyBarEnumSchema = {
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
};

export const PlayerDataTypeEnumSchema = {
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
};

export const PlayerListUpdateEnumSchema = {
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
};

export const RTAnimationEnumSchema = {
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
};

export const ShoutModifierEnumSchema = {
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
};

export const SideEnumSchema = {
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
};

export const TextColorEnumSchema = {
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
};

export const TimerCommandEnumSchema = {
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
};

export const EffectTypeSchema = {
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
};

export const MusicEffectsTypeSchema = {
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
};

export const OffsetTypeSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/types/Offset.schema.json",
  "title": "Offset",
  "description": "Integer (x, y) screen-coordinate pair carried in MS offset / paired_offset slots.",
  "type": "object",
  "properties": {
    "x": {
      "type": "number"
    },
    "y": {
      "type": "number"
    }
  },
  "required": [
    "x",
    "y"
  ],
  "additionalProperties": false,
  "x-fanta-unescape-amp": true
};

export const ARUPSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/ARUP.schema.json",
  "title": "ARUP",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "ARUP"
    },
    "update_type": {
      "$ref": "../../types/AreaUpdateType.schema.json"
    },
    "update_data": {
      "type": "array",
      "items": {
        "type": [
          "integer",
          "string"
        ]
      }
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
};

export const ASSSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/ASS.schema.json",
  "title": "ASS",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "ASS"
    },
    "asset_url": {
      "type": "string"
    }
  },
  "required": [
    "$header",
    "asset_url"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const AUTHSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/AUTH.schema.json",
  "title": "AUTH",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "AUTH"
    },
    "auth_state": {
      "$ref": "../../types/AuthState.schema.json"
    }
  },
  "required": [
    "$header",
    "auth_state"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const BBSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/BB.schema.json",
  "title": "BB",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "BB"
    },
    "message": {
      "type": "string"
    }
  },
  "required": [
    "$header",
    "message"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const BDSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/BD.schema.json",
  "title": "BD",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "BD"
    },
    "reason": {
      "type": "string"
    }
  },
  "required": [
    "$header",
    "reason"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const BNSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/BN.schema.json",
  "title": "BN",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "BN"
    },
    "background": {
      "type": "string"
    },
    "position": {
      "type": "string",
      "default": ""
    }
  },
  "required": [
    "$header",
    "background"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const CCSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CC.schema.json",
  "title": "CC",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CC"
    },
    "player_id": {
      "type": "number"
    },
    "char_id": {
      "type": "number"
    },
    "char_password": {
      "type": "string",
      "default": ""
    }
  },
  "required": [
    "$header",
    "player_id",
    "char_id"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
};

export const CHSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CH.schema.json",
  "title": "CH",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CH"
    },
    "char_id": {
      "type": "number"
    }
  },
  "required": [
    "$header",
    "char_id"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
};

export const CHECKSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CHECK.schema.json",
  "title": "CHECK",
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
};

export const CISchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CI.schema.json",
  "title": "CI",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CI"
    },
    "batchIndex": {
      "type": "number"
    },
    "entries": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "index": {
            "type": "number"
          },
          "data": {
            "type": "string"
          }
        },
        "required": [
          "index",
          "data"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "$header",
    "batchIndex",
    "entries"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const CTToClientSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CTToClient.schema.json",
  "title": "CT",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CT"
    },
    "name": {
      "type": "string"
    },
    "message": {
      "type": "string"
    },
    "is_from_server": {
      "type": "boolean",
      "default": false
    }
  },
  "required": [
    "$header",
    "name",
    "message"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const CTToServerSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CTToServer.schema.json",
  "title": "CT",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "CT"
    },
    "name": {
      "type": "string"
    },
    "message": {
      "type": "string"
    }
  },
  "required": [
    "$header",
    "name",
    "message"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
};

export const CharsCheckSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/CharsCheck.schema.json",
  "title": "CharsCheck",
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
      }
    }
  },
  "required": [
    "$header",
    "taken"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const DESchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/DE.schema.json",
  "title": "DE",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "DE"
    },
    "id": {
      "type": "number"
    }
  },
  "required": [
    "$header",
    "id"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
};

export const DONESchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/DONE.schema.json",
  "title": "DONE",
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
};

export const EESchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/EE.schema.json",
  "title": "EE",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "EE"
    },
    "id": {
      "type": "number"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "image": {
      "type": "string"
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
};

export const EISchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/EI.schema.json",
  "title": "EI",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "EI"
    },
    "id": {
      "type": "number"
    },
    "details": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "type": {
          "type": "string"
        },
        "image": {
          "type": "string"
        }
      },
      "required": [
        "name",
        "description",
        "type",
        "image"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "$header",
    "id",
    "details"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const EMSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/EM.schema.json",
  "title": "EM",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "EM"
    },
    "batchIndex": {
      "type": "number"
    },
    "entries": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "index": {
            "type": "number"
          },
          "name": {
            "type": "string"
          }
        },
        "required": [
          "index",
          "name"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "$header",
    "batchIndex",
    "entries"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const FASchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/FA.schema.json",
  "title": "FA",
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
      }
    }
  },
  "required": [
    "$header",
    "areas"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const FLSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/FL.schema.json",
  "title": "FL",
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
      }
    }
  },
  "required": [
    "$header",
    "features"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const FMSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/FM.schema.json",
  "title": "FM",
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
            "type": "string"
          }
        },
        "required": [
          "name"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "$header",
    "music_list"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const HISchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/HI.schema.json",
  "title": "HI",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "HI"
    },
    "hdid": {
      "type": "string"
    }
  },
  "required": [
    "$header",
    "hdid"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
};

export const HPToClientSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/HPToClient.schema.json",
  "title": "HP",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "HP"
    },
    "bar": {
      "$ref": "../../types/PenaltyBar.schema.json"
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
};

export const HPToServerSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/HPToServer.schema.json",
  "title": "HP",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "HP"
    },
    "bar": {
      "$ref": "../../types/PenaltyBar.schema.json"
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
};

export const IDToClientSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/IDToClient.schema.json",
  "title": "ID",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "ID"
    },
    "player_id": {
      "type": "number"
    },
    "software": {
      "type": "string"
    },
    "version": {
      "type": "string"
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
};

export const IDToServerSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/IDToServer.schema.json",
  "title": "ID",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "ID"
    },
    "software": {
      "type": "string"
    },
    "version": {
      "type": "string"
    }
  },
  "required": [
    "$header",
    "software",
    "version"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
};

export const JDSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/JD.schema.json",
  "title": "JD",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "JD"
    },
    "state": {
      "$ref": "../../types/JudgeState.schema.json"
    }
  },
  "required": [
    "$header",
    "state"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const KBSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/KB.schema.json",
  "title": "KB",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "KB"
    },
    "reason": {
      "type": "string"
    }
  },
  "required": [
    "$header",
    "reason"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const KKSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/KK.schema.json",
  "title": "KK",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "KK"
    },
    "reason": {
      "type": "string"
    }
  },
  "required": [
    "$header",
    "reason"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const LESchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/LE.schema.json",
  "title": "LE",
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
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "image": {
            "type": "string"
          }
        },
        "required": [
          "name",
          "description",
          "image"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "$header",
    "evidence"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const MASchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/MA.schema.json",
  "title": "MA",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "MA"
    },
    "player_id": {
      "type": "number"
    },
    "duration_minutes": {
      "type": "integer",
      "description": "Ban length in minutes. 0 kicks instead of banning; -1 bans permanently."
    },
    "reason": {
      "type": "string"
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
};

export const MCToClientSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/MCToClient.schema.json",
  "title": "MC",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "MC"
    },
    "name": {
      "type": "string"
    },
    "char_id": {
      "type": "number"
    },
    "showname": {
      "type": "string",
      "default": ""
    },
    "looping": {
      "type": "boolean",
      "default": false
    },
    "channel": {
      "$ref": "../../types/MusicChannel.schema.json",
      "default": "music"
    },
    "effects": {
      "$ref": "../../types/MusicEffects.schema.json",
      "default": {
        "fade_in": false,
        "fade_out": false,
        "sync_position": false
      }
    }
  },
  "required": [
    "$header",
    "name",
    "char_id"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const MCToServerSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/MCToServer.schema.json",
  "title": "MC",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "MC"
    },
    "name": {
      "type": "string"
    },
    "char_id": {
      "type": "number"
    },
    "showname": {
      "type": "string",
      "default": ""
    },
    "effects": {
      "$ref": "../../types/MusicEffects.schema.json",
      "default": {
        "fade_in": false,
        "fade_out": false,
        "sync_position": false
      }
    }
  },
  "required": [
    "$header",
    "name",
    "char_id"
  ],
  "additionalProperties": false,
  "x-receiver": "server"
};

export const MSToClientSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/MSToClient.schema.json",
  "title": "MS",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "MS"
    },
    "desk_modifier": {
      "$ref": "../../types/DeskModifier.schema.json",
      "default": "shown"
    },
    "preanim": {
      "type": "string",
      "default": ""
    },
    "character": {
      "type": "string"
    },
    "emote": {
      "type": "string"
    },
    "message": {
      "type": "string"
    },
    "side": {
      "$ref": "../../types/Side.schema.json"
    },
    "sfx_name": {
      "type": "string",
      "default": ""
    },
    "emote_modifier": {
      "$ref": "../../types/EmoteModifier.schema.json",
      "default": "no_preanim"
    },
    "char_id": {
      "type": "number"
    },
    "sfx_delay": {
      "type": "number",
      "default": 0,
      "description": "Delay before `sfx_name` plays, in ticks of 40 ms."
    },
    "shout_modifier": {
      "$ref": "../../types/ShoutModifier.schema.json",
      "default": "none"
    },
    "evidence_id": {
      "type": "number",
      "default": 0
    },
    "flip": {
      "$ref": "../../types/Flip.schema.json",
      "default": "none"
    },
    "realization": {
      "type": "boolean",
      "default": false
    },
    "text_color": {
      "$ref": "../../types/TextColor.schema.json",
      "default": "white"
    },
    "showname": {
      "type": "string",
      "default": ""
    },
    "paired_charid": {
      "type": "number",
      "default": -1
    },
    "paired_name": {
      "type": "string",
      "default": ""
    },
    "paired_emote": {
      "type": "string",
      "default": ""
    },
    "offset": {
      "$ref": "../../types/Offset.schema.json",
      "default": {
        "x": 0,
        "y": 0
      }
    },
    "paired_offset": {
      "$ref": "../../types/Offset.schema.json",
      "default": {
        "x": 0,
        "y": 0
      }
    },
    "paired_flip": {
      "$ref": "../../types/Flip.schema.json",
      "default": "none"
    },
    "noninterrupting_preanim": {
      "type": "boolean",
      "default": false
    },
    "sfx_looping": {
      "type": "boolean",
      "default": false
    },
    "screenshake": {
      "type": "boolean",
      "default": false
    },
    "frames_shake": {
      "type": "string",
      "default": ""
    },
    "frames_realization": {
      "type": "string",
      "default": ""
    },
    "frames_sfx": {
      "type": "string",
      "default": ""
    },
    "additive": {
      "type": "boolean",
      "default": false
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
};

export const MSToServerSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/MSToServer.schema.json",
  "title": "MS",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "MS"
    },
    "desk_modifier": {
      "$ref": "../../types/DeskModifier.schema.json",
      "default": "shown"
    },
    "preanim": {
      "type": "string",
      "default": ""
    },
    "character": {
      "type": "string"
    },
    "emote": {
      "type": "string"
    },
    "message": {
      "type": "string"
    },
    "side": {
      "$ref": "../../types/Side.schema.json"
    },
    "sfx_name": {
      "type": "string",
      "default": ""
    },
    "emote_modifier": {
      "$ref": "../../types/EmoteModifier.schema.json",
      "default": "no_preanim"
    },
    "char_id": {
      "type": "number"
    },
    "sfx_delay": {
      "type": "number",
      "default": 0,
      "description": "Delay before `sfx_name` plays, in ticks of 40 ms."
    },
    "shout_modifier": {
      "$ref": "../../types/ShoutModifier.schema.json",
      "default": "none"
    },
    "evidence_id": {
      "type": "number",
      "default": 0
    },
    "flip": {
      "$ref": "../../types/Flip.schema.json",
      "default": "none"
    },
    "realization": {
      "type": "boolean",
      "default": false
    },
    "text_color": {
      "$ref": "../../types/TextColor.schema.json",
      "default": "white"
    },
    "showname": {
      "type": "string",
      "default": ""
    },
    "paired_charid": {
      "type": "number",
      "default": -1
    },
    "offset": {
      "$ref": "../../types/Offset.schema.json",
      "default": {
        "x": 0,
        "y": 0
      }
    },
    "noninterrupting_preanim": {
      "type": "boolean",
      "default": false
    },
    "sfx_looping": {
      "type": "boolean",
      "default": false
    },
    "screenshake": {
      "type": "boolean",
      "default": false
    },
    "frames_shake": {
      "type": "string",
      "default": ""
    },
    "frames_realization": {
      "type": "string",
      "default": ""
    },
    "frames_sfx": {
      "type": "string",
      "default": ""
    },
    "additive": {
      "type": "boolean",
      "default": false
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
};

export const PESchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/PE.schema.json",
  "title": "PE",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "PE"
    },
    "name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "image": {
      "type": "string"
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
};

export const PNSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/PN.schema.json",
  "title": "PN",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "PN"
    },
    "player_count": {
      "type": "number"
    },
    "max_players": {
      "type": "number"
    },
    "server_description": {
      "type": "string",
      "default": ""
    }
  },
  "required": [
    "$header",
    "player_count",
    "max_players"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const PRSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/PR.schema.json",
  "title": "PR",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "PR"
    },
    "id": {
      "type": "number"
    },
    "type": {
      "$ref": "../../types/PlayerListUpdate.schema.json"
    }
  },
  "required": [
    "$header",
    "id",
    "type"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const PUSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/PU.schema.json",
  "title": "PU",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "PU"
    },
    "id": {
      "type": "number"
    },
    "type": {
      "$ref": "../../types/PlayerDataType.schema.json"
    },
    "data": {
      "type": "string"
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
};

export const PVSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/PV.schema.json",
  "title": "PV",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "PV"
    },
    "player_id": {
      "type": "number"
    },
    "_cid": {
      "type": "string",
      "const": "CID",
      "default": "CID"
    },
    "char_id": {
      "type": "number"
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
};

export const RCSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/RC.schema.json",
  "title": "RC",
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
};

export const RDSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/RD.schema.json",
  "title": "RD",
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
};

export const RMSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/RM.schema.json",
  "title": "RM",
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
};

export const RMCSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/RMC.schema.json",
  "title": "RMC",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "RMC"
    },
    "toTime": {
      "type": "string"
    }
  },
  "required": [
    "$header",
    "toTime"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const RTToClientSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/RTToClient.schema.json",
  "title": "RT",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "RT"
    },
    "animation": {
      "$ref": "../../types/RTAnimation.schema.json"
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
};

export const RTToServerSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/RTToServer.schema.json",
  "title": "RT",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "RT"
    },
    "animation": {
      "$ref": "../../types/RTAnimation.schema.json"
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
};

export const SCSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/SC.schema.json",
  "title": "SC",
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
            "type": "string"
          },
          "desc": {
            "type": "string",
            "default": ""
          },
          "evidence": {
            "type": "string",
            "default": ""
          }
        },
        "required": [
          "name"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "$header",
    "char_data"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const SISchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/SI.schema.json",
  "title": "SI",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "SI"
    },
    "char_count": {
      "type": "number"
    },
    "evi_count": {
      "type": "number"
    },
    "mus_count": {
      "type": "number"
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
};

export const SMSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/SM.schema.json",
  "title": "SM",
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
            "type": "string"
          }
        },
        "required": [
          "name"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "$header",
    "music_list"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const SPSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/SP.schema.json",
  "title": "SP",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "SP"
    },
    "side": {
      "$ref": "../../types/Side.schema.json"
    }
  },
  "required": [
    "$header",
    "side"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};

export const TISchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/TI.schema.json",
  "title": "TI",
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
      "$ref": "../../types/TimerCommand.schema.json"
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
};

export const ZZToClientSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/ZZToClient.schema.json",
  "title": "ZZ",
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
};

export const ZZToServerSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/ZZToServer.schema.json",
  "title": "ZZ",
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
};

export const askchaaSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/askchaa.schema.json",
  "title": "askchaa",
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
};

export const decryptorSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/packets/schemas/decryptor.schema.json",
  "title": "decryptor",
  "type": "object",
  "properties": {
    "$header": {
      "type": "string",
      "const": "decryptor"
    },
    "value": {
      "type": "string"
    }
  },
  "required": [
    "$header",
    "value"
  ],
  "additionalProperties": false,
  "x-receiver": "client"
};
