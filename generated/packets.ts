// AUTO-GENERATED from aolib-meta/. Do not edit; run `bun run codegen`.

/* eslint-disable */

import { AreaUpdateType, DeskModifier, EmoteModifier, Flip, ShoutModifier, Side, TextColor } from "./enums";
import { Offset } from "./types";

import AreaUpdateTypeEnumSchema from "../aolib-meta/types/AreaUpdateType.schema.json";

import DeskModifierEnumSchema from "../aolib-meta/types/DeskModifier.schema.json";

import EmoteModifierEnumSchema from "../aolib-meta/types/EmoteModifier.schema.json";

import FlipEnumSchema from "../aolib-meta/types/Flip.schema.json";

import ShoutModifierEnumSchema from "../aolib-meta/types/ShoutModifier.schema.json";

import SideEnumSchema from "../aolib-meta/types/Side.schema.json";

import TextColorEnumSchema from "../aolib-meta/types/TextColor.schema.json";

import OffsetTypeSchema from "../aolib-meta/types/Offset.schema.json";


import ARUPSchema from "../aolib-meta/packets/schemas/ARUP.schema.json";

import ASSSchema from "../aolib-meta/packets/schemas/ASS.schema.json";

import AUTHSchema from "../aolib-meta/packets/schemas/AUTH.schema.json";

import BBSchema from "../aolib-meta/packets/schemas/BB.schema.json";

import BDSchema from "../aolib-meta/packets/schemas/BD.schema.json";

import BNSchema from "../aolib-meta/packets/schemas/BN.schema.json";

import CCSchema from "../aolib-meta/packets/schemas/CC.schema.json";

import CHSchema from "../aolib-meta/packets/schemas/CH.schema.json";

import CHECKSchema from "../aolib-meta/packets/schemas/CHECK.schema.json";

import CISchema from "../aolib-meta/packets/schemas/CI.schema.json";

import CTToClientSchema from "../aolib-meta/packets/schemas/CTToClient.schema.json";

import CTToServerSchema from "../aolib-meta/packets/schemas/CTToServer.schema.json";

import CharsCheckSchema from "../aolib-meta/packets/schemas/CharsCheck.schema.json";

import DESchema from "../aolib-meta/packets/schemas/DE.schema.json";

import DONESchema from "../aolib-meta/packets/schemas/DONE.schema.json";

import EESchema from "../aolib-meta/packets/schemas/EE.schema.json";

import EISchema from "../aolib-meta/packets/schemas/EI.schema.json";

import EMSchema from "../aolib-meta/packets/schemas/EM.schema.json";

import FASchema from "../aolib-meta/packets/schemas/FA.schema.json";

import FLSchema from "../aolib-meta/packets/schemas/FL.schema.json";

import FMSchema from "../aolib-meta/packets/schemas/FM.schema.json";

import HISchema from "../aolib-meta/packets/schemas/HI.schema.json";

import HPToClientSchema from "../aolib-meta/packets/schemas/HPToClient.schema.json";

import HPToServerSchema from "../aolib-meta/packets/schemas/HPToServer.schema.json";

import IDToClientSchema from "../aolib-meta/packets/schemas/IDToClient.schema.json";

import IDToServerSchema from "../aolib-meta/packets/schemas/IDToServer.schema.json";

import JDSchema from "../aolib-meta/packets/schemas/JD.schema.json";

import KBSchema from "../aolib-meta/packets/schemas/KB.schema.json";

import KKSchema from "../aolib-meta/packets/schemas/KK.schema.json";

import LESchema from "../aolib-meta/packets/schemas/LE.schema.json";

import MASchema from "../aolib-meta/packets/schemas/MA.schema.json";

import MCToClientSchema from "../aolib-meta/packets/schemas/MCToClient.schema.json";

import MCToServerSchema from "../aolib-meta/packets/schemas/MCToServer.schema.json";

import MSToClientSchema from "../aolib-meta/packets/schemas/MSToClient.schema.json";

import MSToServerSchema from "../aolib-meta/packets/schemas/MSToServer.schema.json";

import PESchema from "../aolib-meta/packets/schemas/PE.schema.json";

import PNSchema from "../aolib-meta/packets/schemas/PN.schema.json";

import PRSchema from "../aolib-meta/packets/schemas/PR.schema.json";

import PUSchema from "../aolib-meta/packets/schemas/PU.schema.json";

import PVSchema from "../aolib-meta/packets/schemas/PV.schema.json";

import RCSchema from "../aolib-meta/packets/schemas/RC.schema.json";

import RDSchema from "../aolib-meta/packets/schemas/RD.schema.json";

import RMSchema from "../aolib-meta/packets/schemas/RM.schema.json";

import RMCSchema from "../aolib-meta/packets/schemas/RMC.schema.json";

import RTToClientSchema from "../aolib-meta/packets/schemas/RTToClient.schema.json";

import RTToServerSchema from "../aolib-meta/packets/schemas/RTToServer.schema.json";

import SCSchema from "../aolib-meta/packets/schemas/SC.schema.json";

import SISchema from "../aolib-meta/packets/schemas/SI.schema.json";

import SMSchema from "../aolib-meta/packets/schemas/SM.schema.json";

import SPSchema from "../aolib-meta/packets/schemas/SP.schema.json";

import TISchema from "../aolib-meta/packets/schemas/TI.schema.json";

import VS_AUDIOSchema from "../aolib-meta/packets/schemas/VS_AUDIO.schema.json";

import VS_CAPSSchema from "../aolib-meta/packets/schemas/VS_CAPS.schema.json";

import VS_FRAMESchema from "../aolib-meta/packets/schemas/VS_FRAME.schema.json";

import VS_JOINToClientSchema from "../aolib-meta/packets/schemas/VS_JOINToClient.schema.json";

import VS_JOINToServerSchema from "../aolib-meta/packets/schemas/VS_JOINToServer.schema.json";

import VS_LEAVEToClientSchema from "../aolib-meta/packets/schemas/VS_LEAVEToClient.schema.json";

import VS_LEAVEToServerSchema from "../aolib-meta/packets/schemas/VS_LEAVEToServer.schema.json";

import VS_PEERSSchema from "../aolib-meta/packets/schemas/VS_PEERS.schema.json";

import VS_SPEAKToClientSchema from "../aolib-meta/packets/schemas/VS_SPEAKToClient.schema.json";

import VS_SPEAKToServerSchema from "../aolib-meta/packets/schemas/VS_SPEAKToServer.schema.json";

import ZZToClientSchema from "../aolib-meta/packets/schemas/ZZToClient.schema.json";

import ZZToServerSchema from "../aolib-meta/packets/schemas/ZZToServer.schema.json";

import askchaaSchema from "../aolib-meta/packets/schemas/askchaa.schema.json";

import decryptorSchema from "../aolib-meta/packets/schemas/decryptor.schema.json";


export { default as ARUPSchema } from "../aolib-meta/packets/schemas/ARUP.schema.json";

export { default as ASSSchema } from "../aolib-meta/packets/schemas/ASS.schema.json";

export { default as AUTHSchema } from "../aolib-meta/packets/schemas/AUTH.schema.json";

export { default as BBSchema } from "../aolib-meta/packets/schemas/BB.schema.json";

export { default as BDSchema } from "../aolib-meta/packets/schemas/BD.schema.json";

export { default as BNSchema } from "../aolib-meta/packets/schemas/BN.schema.json";

export { default as CCSchema } from "../aolib-meta/packets/schemas/CC.schema.json";

export { default as CHSchema } from "../aolib-meta/packets/schemas/CH.schema.json";

export { default as CHECKSchema } from "../aolib-meta/packets/schemas/CHECK.schema.json";

export { default as CISchema } from "../aolib-meta/packets/schemas/CI.schema.json";

export { default as CTToClientSchema } from "../aolib-meta/packets/schemas/CTToClient.schema.json";

export { default as CTToServerSchema } from "../aolib-meta/packets/schemas/CTToServer.schema.json";

export { default as CharsCheckSchema } from "../aolib-meta/packets/schemas/CharsCheck.schema.json";

export { default as DESchema } from "../aolib-meta/packets/schemas/DE.schema.json";

export { default as DONESchema } from "../aolib-meta/packets/schemas/DONE.schema.json";

export { default as EESchema } from "../aolib-meta/packets/schemas/EE.schema.json";

export { default as EISchema } from "../aolib-meta/packets/schemas/EI.schema.json";

export { default as EMSchema } from "../aolib-meta/packets/schemas/EM.schema.json";

export { default as FASchema } from "../aolib-meta/packets/schemas/FA.schema.json";

export { default as FLSchema } from "../aolib-meta/packets/schemas/FL.schema.json";

export { default as FMSchema } from "../aolib-meta/packets/schemas/FM.schema.json";

export { default as HISchema } from "../aolib-meta/packets/schemas/HI.schema.json";

export { default as HPToClientSchema } from "../aolib-meta/packets/schemas/HPToClient.schema.json";

export { default as HPToServerSchema } from "../aolib-meta/packets/schemas/HPToServer.schema.json";

export { default as IDToClientSchema } from "../aolib-meta/packets/schemas/IDToClient.schema.json";

export { default as IDToServerSchema } from "../aolib-meta/packets/schemas/IDToServer.schema.json";

export { default as JDSchema } from "../aolib-meta/packets/schemas/JD.schema.json";

export { default as KBSchema } from "../aolib-meta/packets/schemas/KB.schema.json";

export { default as KKSchema } from "../aolib-meta/packets/schemas/KK.schema.json";

export { default as LESchema } from "../aolib-meta/packets/schemas/LE.schema.json";

export { default as MASchema } from "../aolib-meta/packets/schemas/MA.schema.json";

export { default as MCToClientSchema } from "../aolib-meta/packets/schemas/MCToClient.schema.json";

export { default as MCToServerSchema } from "../aolib-meta/packets/schemas/MCToServer.schema.json";

export { default as MSToClientSchema } from "../aolib-meta/packets/schemas/MSToClient.schema.json";

export { default as MSToServerSchema } from "../aolib-meta/packets/schemas/MSToServer.schema.json";

export { default as PESchema } from "../aolib-meta/packets/schemas/PE.schema.json";

export { default as PNSchema } from "../aolib-meta/packets/schemas/PN.schema.json";

export { default as PRSchema } from "../aolib-meta/packets/schemas/PR.schema.json";

export { default as PUSchema } from "../aolib-meta/packets/schemas/PU.schema.json";

export { default as PVSchema } from "../aolib-meta/packets/schemas/PV.schema.json";

export { default as RCSchema } from "../aolib-meta/packets/schemas/RC.schema.json";

export { default as RDSchema } from "../aolib-meta/packets/schemas/RD.schema.json";

export { default as RMSchema } from "../aolib-meta/packets/schemas/RM.schema.json";

export { default as RMCSchema } from "../aolib-meta/packets/schemas/RMC.schema.json";

export { default as RTToClientSchema } from "../aolib-meta/packets/schemas/RTToClient.schema.json";

export { default as RTToServerSchema } from "../aolib-meta/packets/schemas/RTToServer.schema.json";

export { default as SCSchema } from "../aolib-meta/packets/schemas/SC.schema.json";

export { default as SISchema } from "../aolib-meta/packets/schemas/SI.schema.json";

export { default as SMSchema } from "../aolib-meta/packets/schemas/SM.schema.json";

export { default as SPSchema } from "../aolib-meta/packets/schemas/SP.schema.json";

export { default as TISchema } from "../aolib-meta/packets/schemas/TI.schema.json";

export { default as VS_AUDIOSchema } from "../aolib-meta/packets/schemas/VS_AUDIO.schema.json";

export { default as VS_CAPSSchema } from "../aolib-meta/packets/schemas/VS_CAPS.schema.json";

export { default as VS_FRAMESchema } from "../aolib-meta/packets/schemas/VS_FRAME.schema.json";

export { default as VS_JOINToClientSchema } from "../aolib-meta/packets/schemas/VS_JOINToClient.schema.json";

export { default as VS_JOINToServerSchema } from "../aolib-meta/packets/schemas/VS_JOINToServer.schema.json";

export { default as VS_LEAVEToClientSchema } from "../aolib-meta/packets/schemas/VS_LEAVEToClient.schema.json";

export { default as VS_LEAVEToServerSchema } from "../aolib-meta/packets/schemas/VS_LEAVEToServer.schema.json";

export { default as VS_PEERSSchema } from "../aolib-meta/packets/schemas/VS_PEERS.schema.json";

export { default as VS_SPEAKToClientSchema } from "../aolib-meta/packets/schemas/VS_SPEAKToClient.schema.json";

export { default as VS_SPEAKToServerSchema } from "../aolib-meta/packets/schemas/VS_SPEAKToServer.schema.json";

export { default as ZZToClientSchema } from "../aolib-meta/packets/schemas/ZZToClient.schema.json";

export { default as ZZToServerSchema } from "../aolib-meta/packets/schemas/ZZToServer.schema.json";

export { default as askchaaSchema } from "../aolib-meta/packets/schemas/askchaa.schema.json";

export { default as decryptorSchema } from "../aolib-meta/packets/schemas/decryptor.schema.json";


export const enumSchemas = [AreaUpdateTypeEnumSchema, DeskModifierEnumSchema, EmoteModifierEnumSchema, FlipEnumSchema, ShoutModifierEnumSchema, SideEnumSchema, TextColorEnumSchema];

export const typeSchemas = [OffsetTypeSchema];


export class ARUP {
  update_type!: AreaUpdateType;
  update_data!: (number | string)[];

  constructor(input: {
    update_type: AreaUpdateType;
    update_data: (number | string)[];
  }) {
    this.update_type = input.update_type;
    this.update_data = input.update_data;
  }
}


export class ASS {
  asset_url!: string;

  constructor(input: {
    asset_url: string;
  }) {
    this.asset_url = input.asset_url;
  }
}


export class AUTH {
  auth_state!: number;

  constructor(input: {
    auth_state: number;
  }) {
    this.auth_state = input.auth_state;
  }
}


export class BB {
  message!: string;

  constructor(input: {
    message: string;
  }) {
    this.message = input.message;
  }
}


export class BD {
  reason!: string;

  constructor(input: {
    reason: string;
  }) {
    this.reason = input.reason;
  }
}


export class BN {
  background!: string;
  position!: string;

  constructor(input: {
    background: string;
    position?: string;
  }) {
    this.background = input.background;
    this.position = input.position ?? "";
  }
}


export class CC {
  player_id!: number;
  char_id!: number;
  char_password!: string;

  constructor(input: {
    player_id: number;
    char_id: number;
    char_password?: string;
  }) {
    this.player_id = input.player_id;
    this.char_id = input.char_id;
    this.char_password = input.char_password ?? "";
  }
}


export class CH {
  char_id!: number;

  constructor(input: {
    char_id: number;
  }) {
    this.char_id = input.char_id;
  }
}


export class CHECK {
  constructor(_input: Record<string, never> = {}) {
    void _input;
  }
}


export class CI {
  batchIndex!: number;
  entries!: {
    index: number;
    data: string;
  }[];

  constructor(input: {
    batchIndex: number;
    entries: {
    index: number;
    data: string;
  }[];
  }) {
    this.batchIndex = input.batchIndex;
    this.entries = input.entries;
  }
}


export class CTToClient {
  name!: string;
  message!: string;
  is_from_server!: boolean;

  constructor(input: {
    name: string;
    message: string;
    is_from_server?: boolean;
  }) {
    this.name = input.name;
    this.message = input.message;
    this.is_from_server = input.is_from_server ?? false;
  }
}


export class CTToServer {
  name!: string;
  message!: string;

  constructor(input: {
    name: string;
    message: string;
  }) {
    this.name = input.name;
    this.message = input.message;
  }
}


export class CharsCheck {
  taken!: number[];

  constructor(input: {
    taken: number[];
  }) {
    this.taken = input.taken;
  }
}


export class DE {
  id!: number;

  constructor(input: {
    id: number;
  }) {
    this.id = input.id;
  }
}


export class DONE {
  constructor(_input: Record<string, never> = {}) {
    void _input;
  }
}


export class EE {
  id!: number;
  name!: string;
  description!: string;
  image!: string;

  constructor(input: {
    id: number;
    name: string;
    description: string;
    image: string;
  }) {
    this.id = input.id;
    this.name = input.name;
    this.description = input.description;
    this.image = input.image;
  }
}


export class EI {
  id!: number;
  details!: {
    name: string;
    description: string;
    type: string;
    image: string;
  };

  constructor(input: {
    id: number;
    details: {
    name: string;
    description: string;
    type: string;
    image: string;
  };
  }) {
    this.id = input.id;
    this.details = input.details;
  }
}


export class EM {
  batchIndex!: number;
  entries!: {
    index: number;
    name: string;
  }[];

  constructor(input: {
    batchIndex: number;
    entries: {
    index: number;
    name: string;
  }[];
  }) {
    this.batchIndex = input.batchIndex;
    this.entries = input.entries;
  }
}


export class FA {
  areas!: string[];

  constructor(input: {
    areas: string[];
  }) {
    this.areas = input.areas;
  }
}


export class FL {
  features!: string[];

  constructor(input: {
    features: string[];
  }) {
    this.features = input.features;
  }
}


export class FM {
  music_list!: {
    name: string;
  }[];

  constructor(input: {
    music_list: {
    name: string;
  }[];
  }) {
    this.music_list = input.music_list;
  }
}


export class HI {
  hdid!: string;

  constructor(input: {
    hdid: string;
  }) {
    this.hdid = input.hdid;
  }
}


export class HPToClient {
  bar!: number;
  value!: number;

  constructor(input: {
    bar: number;
    value: number;
  }) {
    this.bar = input.bar;
    this.value = input.value;
  }
}


export class HPToServer {
  bar!: number;
  value!: number;

  constructor(input: {
    bar: number;
    value: number;
  }) {
    this.bar = input.bar;
    this.value = input.value;
  }
}


export class IDToClient {
  player_id!: number;
  software!: string;
  version!: string;

  constructor(input: {
    player_id: number;
    software: string;
    version: string;
  }) {
    this.player_id = input.player_id;
    this.software = input.software;
    this.version = input.version;
  }
}


export class IDToServer {
  software!: string;
  version!: string;

  constructor(input: {
    software: string;
    version: string;
  }) {
    this.software = input.software;
    this.version = input.version;
  }
}


export class JD {
  state!: number;

  constructor(input: {
    state: number;
  }) {
    this.state = input.state;
  }
}


export class KB {
  reason!: string;

  constructor(input: {
    reason: string;
  }) {
    this.reason = input.reason;
  }
}


export class KK {
  reason!: string;

  constructor(input: {
    reason: string;
  }) {
    this.reason = input.reason;
  }
}


export class LE {
  evidence!: {
    name: string;
    description: string;
    image: string;
  }[];

  constructor(input: {
    evidence: {
    name: string;
    description: string;
    image: string;
  }[];
  }) {
    this.evidence = input.evidence;
  }
}


export class MA {
  id!: number;
  duration!: number;
  reason!: string;

  constructor(input: {
    id: number;
    duration: number;
    reason: string;
  }) {
    this.id = input.id;
    this.duration = input.duration;
    this.reason = input.reason;
  }
}


export class MCToClient {
  name!: string;
  char_id!: number;
  showname!: string;
  looping!: boolean;
  channel!: number;
  effects!: number;

  constructor(input: {
    name: string;
    char_id: number;
    showname?: string;
    looping?: boolean;
    channel?: number;
    effects?: number;
  }) {
    this.name = input.name;
    this.char_id = input.char_id;
    this.showname = input.showname ?? "";
    this.looping = input.looping ?? false;
    this.channel = input.channel ?? 0;
    this.effects = input.effects ?? 0;
  }
}


export class MCToServer {
  name!: string;
  char_id!: number;
  showname!: string;
  effects!: number;

  constructor(input: {
    name: string;
    char_id: number;
    showname?: string;
    effects?: number;
  }) {
    this.name = input.name;
    this.char_id = input.char_id;
    this.showname = input.showname ?? "";
    this.effects = input.effects ?? 0;
  }
}


export class MSToClient {
  desk_modifier!: DeskModifier;
  preanim!: string;
  character!: string;
  emote!: string;
  message!: string;
  side!: Side;
  sfx_name!: string;
  emote_modifier!: EmoteModifier;
  char_id!: number;
  sfx_delay!: number;
  shout_modifier!: ShoutModifier;
  evidence_id!: number;
  flip!: Flip;
  realization!: boolean;
  text_color!: TextColor;
  showname!: string;
  paired_charid!: number;
  paired_name!: string;
  paired_emote!: string;
  offset!: Offset;
  paired_offset!: Offset;
  paired_flip!: Flip;
  noninterrupting_preanim!: boolean;
  sfx_looping!: boolean;
  screenshake!: boolean;
  frames_shake!: string;
  frames_realization!: string;
  frames_sfx!: string;
  additive!: boolean;
  effect!: string;

  constructor(input: {
    desk_modifier?: DeskModifier;
    preanim?: string;
    character: string;
    emote: string;
    message: string;
    side: Side;
    sfx_name?: string;
    emote_modifier?: EmoteModifier;
    char_id: number;
    sfx_delay?: number;
    shout_modifier?: ShoutModifier;
    evidence_id?: number;
    flip?: Flip;
    realization?: boolean;
    text_color?: TextColor;
    showname?: string;
    paired_charid?: number;
    paired_name?: string;
    paired_emote?: string;
    offset?: Offset;
    paired_offset?: Offset;
    paired_flip?: Flip;
    noninterrupting_preanim?: boolean;
    sfx_looping?: boolean;
    screenshake?: boolean;
    frames_shake?: string;
    frames_realization?: string;
    frames_sfx?: string;
    additive?: boolean;
    effect?: string;
  }) {
    this.desk_modifier = input.desk_modifier ?? DeskModifier.shown;
    this.preanim = input.preanim ?? "";
    this.character = input.character;
    this.emote = input.emote;
    this.message = input.message;
    this.side = input.side;
    this.sfx_name = input.sfx_name ?? "";
    this.emote_modifier = input.emote_modifier ?? EmoteModifier.no_preanim;
    this.char_id = input.char_id;
    this.sfx_delay = input.sfx_delay ?? 0;
    this.shout_modifier = input.shout_modifier ?? ShoutModifier.none;
    this.evidence_id = input.evidence_id ?? 0;
    this.flip = input.flip ?? Flip.none;
    this.realization = input.realization ?? false;
    this.text_color = input.text_color ?? TextColor.white;
    this.showname = input.showname ?? "";
    this.paired_charid = input.paired_charid ?? -1;
    this.paired_name = input.paired_name ?? "";
    this.paired_emote = input.paired_emote ?? "";
    this.offset = input.offset ?? {"x":0,"y":0};
    this.paired_offset = input.paired_offset ?? {"x":0,"y":0};
    this.paired_flip = input.paired_flip ?? Flip.none;
    this.noninterrupting_preanim = input.noninterrupting_preanim ?? false;
    this.sfx_looping = input.sfx_looping ?? false;
    this.screenshake = input.screenshake ?? false;
    this.frames_shake = input.frames_shake ?? "";
    this.frames_realization = input.frames_realization ?? "";
    this.frames_sfx = input.frames_sfx ?? "";
    this.additive = input.additive ?? false;
    this.effect = input.effect ?? "";
  }
}


export class MSToServer {
  desk_modifier!: DeskModifier;
  preanim!: string;
  character!: string;
  emote!: string;
  message!: string;
  side!: Side;
  sfx_name!: string;
  emote_modifier!: EmoteModifier;
  char_id!: number;
  sfx_delay!: number;
  shout_modifier!: ShoutModifier;
  evidence_id!: number;
  flip!: Flip;
  realization!: boolean;
  text_color!: TextColor;
  showname!: string;
  paired_charid!: number;
  offset!: Offset;
  noninterrupting_preanim!: boolean;
  sfx_looping!: boolean;
  screenshake!: boolean;
  frames_shake!: string;
  frames_realization!: string;
  frames_sfx!: string;
  additive!: boolean;
  effect!: string;

  constructor(input: {
    desk_modifier?: DeskModifier;
    preanim?: string;
    character: string;
    emote: string;
    message: string;
    side: Side;
    sfx_name?: string;
    emote_modifier?: EmoteModifier;
    char_id: number;
    sfx_delay?: number;
    shout_modifier?: ShoutModifier;
    evidence_id?: number;
    flip?: Flip;
    realization?: boolean;
    text_color?: TextColor;
    showname?: string;
    paired_charid?: number;
    offset?: Offset;
    noninterrupting_preanim?: boolean;
    sfx_looping?: boolean;
    screenshake?: boolean;
    frames_shake?: string;
    frames_realization?: string;
    frames_sfx?: string;
    additive?: boolean;
    effect?: string;
  }) {
    this.desk_modifier = input.desk_modifier ?? DeskModifier.shown;
    this.preanim = input.preanim ?? "";
    this.character = input.character;
    this.emote = input.emote;
    this.message = input.message;
    this.side = input.side;
    this.sfx_name = input.sfx_name ?? "";
    this.emote_modifier = input.emote_modifier ?? EmoteModifier.no_preanim;
    this.char_id = input.char_id;
    this.sfx_delay = input.sfx_delay ?? 0;
    this.shout_modifier = input.shout_modifier ?? ShoutModifier.none;
    this.evidence_id = input.evidence_id ?? 0;
    this.flip = input.flip ?? Flip.none;
    this.realization = input.realization ?? false;
    this.text_color = input.text_color ?? TextColor.white;
    this.showname = input.showname ?? "";
    this.paired_charid = input.paired_charid ?? -1;
    this.offset = input.offset ?? {"x":0,"y":0};
    this.noninterrupting_preanim = input.noninterrupting_preanim ?? false;
    this.sfx_looping = input.sfx_looping ?? false;
    this.screenshake = input.screenshake ?? false;
    this.frames_shake = input.frames_shake ?? "";
    this.frames_realization = input.frames_realization ?? "";
    this.frames_sfx = input.frames_sfx ?? "";
    this.additive = input.additive ?? false;
    this.effect = input.effect ?? "";
  }
}


export class PE {
  name!: string;
  description!: string;
  image!: string;

  constructor(input: {
    name: string;
    description: string;
    image: string;
  }) {
    this.name = input.name;
    this.description = input.description;
    this.image = input.image;
  }
}


export class PN {
  player_count!: number;
  max_players!: number;
  server_description!: string;

  constructor(input: {
    player_count: number;
    max_players: number;
    server_description?: string;
  }) {
    this.player_count = input.player_count;
    this.max_players = input.max_players;
    this.server_description = input.server_description ?? "";
  }
}


export class PR {
  id!: number;
  type!: number;

  constructor(input: {
    id: number;
    type: number;
  }) {
    this.id = input.id;
    this.type = input.type;
  }
}


export class PU {
  id!: number;
  type!: number;
  data!: string;

  constructor(input: {
    id: number;
    type: number;
    data: string;
  }) {
    this.id = input.id;
    this.type = input.type;
    this.data = input.data;
  }
}


export class PV {
  player_id!: number;
  char_id!: number;

  constructor(input: {
    player_id: number;
    char_id: number;
  }) {
    this.player_id = input.player_id;
    this.char_id = input.char_id;
  }
}


export class RC {
  constructor(_input: Record<string, never> = {}) {
    void _input;
  }
}


export class RD {
  constructor(_input: Record<string, never> = {}) {
    void _input;
  }
}


export class RM {
  constructor(_input: Record<string, never> = {}) {
    void _input;
  }
}


export class RMC {
  toTime!: string;

  constructor(input: {
    toTime: string;
  }) {
    this.toTime = input.toTime;
  }
}


export class RTToClient {
  animation!: string;
  judgeId!: number;

  constructor(input: {
    animation: string;
    judgeId?: number;
  }) {
    this.animation = input.animation;
    this.judgeId = input.judgeId ?? -1;
  }
}


export class RTToServer {
  animation!: string;
  judgeId!: number;

  constructor(input: {
    animation: string;
    judgeId?: number;
  }) {
    this.animation = input.animation;
    this.judgeId = input.judgeId ?? -1;
  }
}


export class SC {
  char_data!: {
    name: string;
    desc?: string;
    evidence?: string;
  }[];

  constructor(input: {
    char_data: {
    name: string;
    desc?: string;
    evidence?: string;
  }[];
  }) {
    this.char_data = input.char_data;
  }
}


export class SI {
  char_count!: number;
  evi_count!: number;
  mus_count!: number;

  constructor(input: {
    char_count: number;
    evi_count: number;
    mus_count: number;
  }) {
    this.char_count = input.char_count;
    this.evi_count = input.evi_count;
    this.mus_count = input.mus_count;
  }
}


export class SM {
  music_list!: {
    name: string;
  }[];

  constructor(input: {
    music_list: {
    name: string;
  }[];
  }) {
    this.music_list = input.music_list;
  }
}


export class SP {
  side!: Side;

  constructor(input: {
    side: Side;
  }) {
    this.side = input.side;
  }
}


export class TI {
  timer_id!: number;
  command!: number;
  time!: number;

  constructor(input: {
    timer_id: number;
    command: number;
    time: number;
  }) {
    this.timer_id = input.timer_id;
    this.command = input.command;
    this.time = input.time;
  }
}


export class VS_AUDIO {
  fromUid!: number;
  payload!: string;

  constructor(input: {
    fromUid: number;
    payload: string;
  }) {
    this.fromUid = input.fromUid;
    this.payload = input.payload;
  }
}


export class VS_CAPS {
  enabled!: boolean;
  pttOnly!: boolean;
  maxPeers!: number;
  codec!: string;
  sampleRate!: number;
  frameMs!: number;
  maxFrameBytes!: number;

  constructor(input: {
    enabled: boolean;
    pttOnly: boolean;
    maxPeers: number;
    codec: string;
    sampleRate: number;
    frameMs: number;
    maxFrameBytes: number;
  }) {
    this.enabled = input.enabled;
    this.pttOnly = input.pttOnly;
    this.maxPeers = input.maxPeers;
    this.codec = input.codec;
    this.sampleRate = input.sampleRate;
    this.frameMs = input.frameMs;
    this.maxFrameBytes = input.maxFrameBytes;
  }
}


export class VS_FRAME {
  payload!: string;

  constructor(input: {
    payload: string;
  }) {
    this.payload = input.payload;
  }
}


export class VS_JOINToClient {
  uid!: number;

  constructor(input: {
    uid: number;
  }) {
    this.uid = input.uid;
  }
}


export class VS_JOINToServer {
  constructor(_input: Record<string, never> = {}) {
    void _input;
  }
}


export class VS_LEAVEToClient {
  uid!: number;

  constructor(input: {
    uid: number;
  }) {
    this.uid = input.uid;
  }
}


export class VS_LEAVEToServer {
  constructor(_input: Record<string, never> = {}) {
    void _input;
  }
}


export class VS_PEERS {
  uids!: number[];

  constructor(input: {
    uids: number[];
  }) {
    this.uids = input.uids;
  }
}


export class VS_SPEAKToClient {
  uid!: number;
  on!: boolean;

  constructor(input: {
    uid: number;
    on: boolean;
  }) {
    this.uid = input.uid;
    this.on = input.on;
  }
}


export class VS_SPEAKToServer {
  on!: boolean;

  constructor(input: {
    on: boolean;
  }) {
    this.on = input.on;
  }
}


export class ZZToClient {
  reason!: string;
  target!: number;

  constructor(input: {
    reason: string;
    target?: number;
  }) {
    this.reason = input.reason;
    this.target = input.target ?? -1;
  }
}


export class ZZToServer {
  reason!: string;
  target!: number;

  constructor(input: {
    reason: string;
    target?: number;
  }) {
    this.reason = input.reason;
    this.target = input.target ?? -1;
  }
}


export class askchaa {
  constructor(_input: Record<string, never> = {}) {
    void _input;
  }
}


export class decryptor {
  value!: string;

  constructor(input: {
    value: string;
  }) {
    this.value = input.value;
  }
}



export const c2sSchemas = {
  askchaa: askchaaSchema,
  CC: CCSchema,
  CH: CHSchema,
  CT: CTToServerSchema,
  DE: DESchema,
  EE: EESchema,
  HI: HISchema,
  HP: HPToServerSchema,
  ID: IDToServerSchema,
  MA: MASchema,
  MC: MCToServerSchema,
  MS: MSToServerSchema,
  PE: PESchema,
  RC: RCSchema,
  RD: RDSchema,
  RM: RMSchema,
  RT: RTToServerSchema,
  VS_FRAME: VS_FRAMESchema,
  VS_JOIN: VS_JOINToServerSchema,
  VS_LEAVE: VS_LEAVEToServerSchema,
  VS_SPEAK: VS_SPEAKToServerSchema,
  ZZ: ZZToServerSchema,
} as const;

export const s2cSchemas = {
  ARUP: ARUPSchema,
  ASS: ASSSchema,
  AUTH: AUTHSchema,
  BB: BBSchema,
  BD: BDSchema,
  BN: BNSchema,
  CharsCheck: CharsCheckSchema,
  CHECK: CHECKSchema,
  CI: CISchema,
  CT: CTToClientSchema,
  decryptor: decryptorSchema,
  DONE: DONESchema,
  EI: EISchema,
  EM: EMSchema,
  FA: FASchema,
  FL: FLSchema,
  FM: FMSchema,
  HP: HPToClientSchema,
  ID: IDToClientSchema,
  JD: JDSchema,
  KB: KBSchema,
  KK: KKSchema,
  LE: LESchema,
  MC: MCToClientSchema,
  MS: MSToClientSchema,
  PN: PNSchema,
  PR: PRSchema,
  PU: PUSchema,
  PV: PVSchema,
  RMC: RMCSchema,
  RT: RTToClientSchema,
  SC: SCSchema,
  SI: SISchema,
  SM: SMSchema,
  SP: SPSchema,
  TI: TISchema,
  VS_AUDIO: VS_AUDIOSchema,
  VS_CAPS: VS_CAPSSchema,
  VS_JOIN: VS_JOINToClientSchema,
  VS_LEAVE: VS_LEAVEToClientSchema,
  VS_PEERS: VS_PEERSSchema,
  VS_SPEAK: VS_SPEAKToClientSchema,
  ZZ: ZZToClientSchema,
} as const;

export const c2sClasses = {
  askchaa: askchaa,
  CC: CC,
  CH: CH,
  CT: CTToServer,
  DE: DE,
  EE: EE,
  HI: HI,
  HP: HPToServer,
  ID: IDToServer,
  MA: MA,
  MC: MCToServer,
  MS: MSToServer,
  PE: PE,
  RC: RC,
  RD: RD,
  RM: RM,
  RT: RTToServer,
  VS_FRAME: VS_FRAME,
  VS_JOIN: VS_JOINToServer,
  VS_LEAVE: VS_LEAVEToServer,
  VS_SPEAK: VS_SPEAKToServer,
  ZZ: ZZToServer,
} as const;

export const s2cClasses = {
  ARUP: ARUP,
  ASS: ASS,
  AUTH: AUTH,
  BB: BB,
  BD: BD,
  BN: BN,
  CharsCheck: CharsCheck,
  CHECK: CHECK,
  CI: CI,
  CT: CTToClient,
  decryptor: decryptor,
  DONE: DONE,
  EI: EI,
  EM: EM,
  FA: FA,
  FL: FL,
  FM: FM,
  HP: HPToClient,
  ID: IDToClient,
  JD: JD,
  KB: KB,
  KK: KK,
  LE: LE,
  MC: MCToClient,
  MS: MSToClient,
  PN: PN,
  PR: PR,
  PU: PU,
  PV: PV,
  RMC: RMC,
  RT: RTToClient,
  SC: SC,
  SI: SI,
  SM: SM,
  SP: SP,
  TI: TI,
  VS_AUDIO: VS_AUDIO,
  VS_CAPS: VS_CAPS,
  VS_JOIN: VS_JOINToClient,
  VS_LEAVE: VS_LEAVEToClient,
  VS_PEERS: VS_PEERS,
  VS_SPEAK: VS_SPEAKToClient,
  ZZ: ZZToClient,
} as const;

export type C2SInputs = {
  askchaa: ConstructorParameters<typeof askchaa>[0];
  CC: ConstructorParameters<typeof CC>[0];
  CH: ConstructorParameters<typeof CH>[0];
  CT: ConstructorParameters<typeof CTToServer>[0];
  DE: ConstructorParameters<typeof DE>[0];
  EE: ConstructorParameters<typeof EE>[0];
  HI: ConstructorParameters<typeof HI>[0];
  HP: ConstructorParameters<typeof HPToServer>[0];
  ID: ConstructorParameters<typeof IDToServer>[0];
  MA: ConstructorParameters<typeof MA>[0];
  MC: ConstructorParameters<typeof MCToServer>[0];
  MS: ConstructorParameters<typeof MSToServer>[0];
  PE: ConstructorParameters<typeof PE>[0];
  RC: ConstructorParameters<typeof RC>[0];
  RD: ConstructorParameters<typeof RD>[0];
  RM: ConstructorParameters<typeof RM>[0];
  RT: ConstructorParameters<typeof RTToServer>[0];
  VS_FRAME: ConstructorParameters<typeof VS_FRAME>[0];
  VS_JOIN: ConstructorParameters<typeof VS_JOINToServer>[0];
  VS_LEAVE: ConstructorParameters<typeof VS_LEAVEToServer>[0];
  VS_SPEAK: ConstructorParameters<typeof VS_SPEAKToServer>[0];
  ZZ: ConstructorParameters<typeof ZZToServer>[0];
};

export type S2CInputs = {
  ARUP: ConstructorParameters<typeof ARUP>[0];
  ASS: ConstructorParameters<typeof ASS>[0];
  AUTH: ConstructorParameters<typeof AUTH>[0];
  BB: ConstructorParameters<typeof BB>[0];
  BD: ConstructorParameters<typeof BD>[0];
  BN: ConstructorParameters<typeof BN>[0];
  CharsCheck: ConstructorParameters<typeof CharsCheck>[0];
  CHECK: ConstructorParameters<typeof CHECK>[0];
  CI: ConstructorParameters<typeof CI>[0];
  CT: ConstructorParameters<typeof CTToClient>[0];
  decryptor: ConstructorParameters<typeof decryptor>[0];
  DONE: ConstructorParameters<typeof DONE>[0];
  EI: ConstructorParameters<typeof EI>[0];
  EM: ConstructorParameters<typeof EM>[0];
  FA: ConstructorParameters<typeof FA>[0];
  FL: ConstructorParameters<typeof FL>[0];
  FM: ConstructorParameters<typeof FM>[0];
  HP: ConstructorParameters<typeof HPToClient>[0];
  ID: ConstructorParameters<typeof IDToClient>[0];
  JD: ConstructorParameters<typeof JD>[0];
  KB: ConstructorParameters<typeof KB>[0];
  KK: ConstructorParameters<typeof KK>[0];
  LE: ConstructorParameters<typeof LE>[0];
  MC: ConstructorParameters<typeof MCToClient>[0];
  MS: ConstructorParameters<typeof MSToClient>[0];
  PN: ConstructorParameters<typeof PN>[0];
  PR: ConstructorParameters<typeof PR>[0];
  PU: ConstructorParameters<typeof PU>[0];
  PV: ConstructorParameters<typeof PV>[0];
  RMC: ConstructorParameters<typeof RMC>[0];
  RT: ConstructorParameters<typeof RTToClient>[0];
  SC: ConstructorParameters<typeof SC>[0];
  SI: ConstructorParameters<typeof SI>[0];
  SM: ConstructorParameters<typeof SM>[0];
  SP: ConstructorParameters<typeof SP>[0];
  TI: ConstructorParameters<typeof TI>[0];
  VS_AUDIO: ConstructorParameters<typeof VS_AUDIO>[0];
  VS_CAPS: ConstructorParameters<typeof VS_CAPS>[0];
  VS_JOIN: ConstructorParameters<typeof VS_JOINToClient>[0];
  VS_LEAVE: ConstructorParameters<typeof VS_LEAVEToClient>[0];
  VS_PEERS: ConstructorParameters<typeof VS_PEERS>[0];
  VS_SPEAK: ConstructorParameters<typeof VS_SPEAKToClient>[0];
  ZZ: ConstructorParameters<typeof ZZToClient>[0];
};

export type C2SOutputs = {
  askchaa: askchaa;
  CC: CC;
  CH: CH;
  CT: CTToServer;
  DE: DE;
  EE: EE;
  HI: HI;
  HP: HPToServer;
  ID: IDToServer;
  MA: MA;
  MC: MCToServer;
  MS: MSToServer;
  PE: PE;
  RC: RC;
  RD: RD;
  RM: RM;
  RT: RTToServer;
  VS_FRAME: VS_FRAME;
  VS_JOIN: VS_JOINToServer;
  VS_LEAVE: VS_LEAVEToServer;
  VS_SPEAK: VS_SPEAKToServer;
  ZZ: ZZToServer;
};

export type S2COutputs = {
  ARUP: ARUP;
  ASS: ASS;
  AUTH: AUTH;
  BB: BB;
  BD: BD;
  BN: BN;
  CharsCheck: CharsCheck;
  CHECK: CHECK;
  CI: CI;
  CT: CTToClient;
  decryptor: decryptor;
  DONE: DONE;
  EI: EI;
  EM: EM;
  FA: FA;
  FL: FL;
  FM: FM;
  HP: HPToClient;
  ID: IDToClient;
  JD: JD;
  KB: KB;
  KK: KK;
  LE: LE;
  MC: MCToClient;
  MS: MSToClient;
  PN: PN;
  PR: PR;
  PU: PU;
  PV: PV;
  RMC: RMC;
  RT: RTToClient;
  SC: SC;
  SI: SI;
  SM: SM;
  SP: SP;
  TI: TI;
  VS_AUDIO: VS_AUDIO;
  VS_CAPS: VS_CAPS;
  VS_JOIN: VS_JOINToClient;
  VS_LEAVE: VS_LEAVEToClient;
  VS_PEERS: VS_PEERS;
  VS_SPEAK: VS_SPEAKToClient;
  ZZ: ZZToClient;
};
