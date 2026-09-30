// AUTO-GENERATED from spec/. Do not edit; run `bun run codegen`.

/* eslint-disable */

import { AreaUpdateType, DeskModifier, EmoteModifier, Flip, JudgeState, ShoutModifier, Side, TextColor } from "./enums";
import { Offset } from "./types";

import AreaUpdateTypeEnumSchema from "../../spec/types/AreaUpdateType.schema.json";

import DeskModifierEnumSchema from "../../spec/types/DeskModifier.schema.json";

import EmoteModifierEnumSchema from "../../spec/types/EmoteModifier.schema.json";

import FlipEnumSchema from "../../spec/types/Flip.schema.json";

import JudgeStateEnumSchema from "../../spec/types/JudgeState.schema.json";

import ShoutModifierEnumSchema from "../../spec/types/ShoutModifier.schema.json";

import SideEnumSchema from "../../spec/types/Side.schema.json";

import TextColorEnumSchema from "../../spec/types/TextColor.schema.json";

import OffsetTypeSchema from "../../spec/types/Offset.schema.json";


import ARUPSchema from "../../spec/packets/schemas/ARUP.schema.json";

import ASSSchema from "../../spec/packets/schemas/ASS.schema.json";

import AUTHSchema from "../../spec/packets/schemas/AUTH.schema.json";

import BBSchema from "../../spec/packets/schemas/BB.schema.json";

import BDSchema from "../../spec/packets/schemas/BD.schema.json";

import BNSchema from "../../spec/packets/schemas/BN.schema.json";

import CCSchema from "../../spec/packets/schemas/CC.schema.json";

import CHSchema from "../../spec/packets/schemas/CH.schema.json";

import CHECKSchema from "../../spec/packets/schemas/CHECK.schema.json";

import CISchema from "../../spec/packets/schemas/CI.schema.json";

import CTToClientSchema from "../../spec/packets/schemas/CTToClient.schema.json";

import CTToServerSchema from "../../spec/packets/schemas/CTToServer.schema.json";

import CharsCheckSchema from "../../spec/packets/schemas/CharsCheck.schema.json";

import DESchema from "../../spec/packets/schemas/DE.schema.json";

import DONESchema from "../../spec/packets/schemas/DONE.schema.json";

import EESchema from "../../spec/packets/schemas/EE.schema.json";

import EISchema from "../../spec/packets/schemas/EI.schema.json";

import EMSchema from "../../spec/packets/schemas/EM.schema.json";

import FASchema from "../../spec/packets/schemas/FA.schema.json";

import FLSchema from "../../spec/packets/schemas/FL.schema.json";

import FMSchema from "../../spec/packets/schemas/FM.schema.json";

import HISchema from "../../spec/packets/schemas/HI.schema.json";

import HPToClientSchema from "../../spec/packets/schemas/HPToClient.schema.json";

import HPToServerSchema from "../../spec/packets/schemas/HPToServer.schema.json";

import IDToClientSchema from "../../spec/packets/schemas/IDToClient.schema.json";

import IDToServerSchema from "../../spec/packets/schemas/IDToServer.schema.json";

import JDSchema from "../../spec/packets/schemas/JD.schema.json";

import KBSchema from "../../spec/packets/schemas/KB.schema.json";

import KKSchema from "../../spec/packets/schemas/KK.schema.json";

import LESchema from "../../spec/packets/schemas/LE.schema.json";

import MASchema from "../../spec/packets/schemas/MA.schema.json";

import MCToClientSchema from "../../spec/packets/schemas/MCToClient.schema.json";

import MCToServerSchema from "../../spec/packets/schemas/MCToServer.schema.json";

import MSToClientSchema from "../../spec/packets/schemas/MSToClient.schema.json";

import MSToServerSchema from "../../spec/packets/schemas/MSToServer.schema.json";

import PESchema from "../../spec/packets/schemas/PE.schema.json";

import PNSchema from "../../spec/packets/schemas/PN.schema.json";

import PRSchema from "../../spec/packets/schemas/PR.schema.json";

import PUSchema from "../../spec/packets/schemas/PU.schema.json";

import PVSchema from "../../spec/packets/schemas/PV.schema.json";

import RCSchema from "../../spec/packets/schemas/RC.schema.json";

import RDSchema from "../../spec/packets/schemas/RD.schema.json";

import RMSchema from "../../spec/packets/schemas/RM.schema.json";

import RMCSchema from "../../spec/packets/schemas/RMC.schema.json";

import RTToClientSchema from "../../spec/packets/schemas/RTToClient.schema.json";

import RTToServerSchema from "../../spec/packets/schemas/RTToServer.schema.json";

import SCSchema from "../../spec/packets/schemas/SC.schema.json";

import SISchema from "../../spec/packets/schemas/SI.schema.json";

import SMSchema from "../../spec/packets/schemas/SM.schema.json";

import SPSchema from "../../spec/packets/schemas/SP.schema.json";

import TISchema from "../../spec/packets/schemas/TI.schema.json";

import ZZToClientSchema from "../../spec/packets/schemas/ZZToClient.schema.json";

import ZZToServerSchema from "../../spec/packets/schemas/ZZToServer.schema.json";

import askchaaSchema from "../../spec/packets/schemas/askchaa.schema.json";

import decryptorSchema from "../../spec/packets/schemas/decryptor.schema.json";


export { default as ARUPSchema } from "../../spec/packets/schemas/ARUP.schema.json";

export { default as ASSSchema } from "../../spec/packets/schemas/ASS.schema.json";

export { default as AUTHSchema } from "../../spec/packets/schemas/AUTH.schema.json";

export { default as BBSchema } from "../../spec/packets/schemas/BB.schema.json";

export { default as BDSchema } from "../../spec/packets/schemas/BD.schema.json";

export { default as BNSchema } from "../../spec/packets/schemas/BN.schema.json";

export { default as CCSchema } from "../../spec/packets/schemas/CC.schema.json";

export { default as CHSchema } from "../../spec/packets/schemas/CH.schema.json";

export { default as CHECKSchema } from "../../spec/packets/schemas/CHECK.schema.json";

export { default as CISchema } from "../../spec/packets/schemas/CI.schema.json";

export { default as CTToClientSchema } from "../../spec/packets/schemas/CTToClient.schema.json";

export { default as CTToServerSchema } from "../../spec/packets/schemas/CTToServer.schema.json";

export { default as CharsCheckSchema } from "../../spec/packets/schemas/CharsCheck.schema.json";

export { default as DESchema } from "../../spec/packets/schemas/DE.schema.json";

export { default as DONESchema } from "../../spec/packets/schemas/DONE.schema.json";

export { default as EESchema } from "../../spec/packets/schemas/EE.schema.json";

export { default as EISchema } from "../../spec/packets/schemas/EI.schema.json";

export { default as EMSchema } from "../../spec/packets/schemas/EM.schema.json";

export { default as FASchema } from "../../spec/packets/schemas/FA.schema.json";

export { default as FLSchema } from "../../spec/packets/schemas/FL.schema.json";

export { default as FMSchema } from "../../spec/packets/schemas/FM.schema.json";

export { default as HISchema } from "../../spec/packets/schemas/HI.schema.json";

export { default as HPToClientSchema } from "../../spec/packets/schemas/HPToClient.schema.json";

export { default as HPToServerSchema } from "../../spec/packets/schemas/HPToServer.schema.json";

export { default as IDToClientSchema } from "../../spec/packets/schemas/IDToClient.schema.json";

export { default as IDToServerSchema } from "../../spec/packets/schemas/IDToServer.schema.json";

export { default as JDSchema } from "../../spec/packets/schemas/JD.schema.json";

export { default as KBSchema } from "../../spec/packets/schemas/KB.schema.json";

export { default as KKSchema } from "../../spec/packets/schemas/KK.schema.json";

export { default as LESchema } from "../../spec/packets/schemas/LE.schema.json";

export { default as MASchema } from "../../spec/packets/schemas/MA.schema.json";

export { default as MCToClientSchema } from "../../spec/packets/schemas/MCToClient.schema.json";

export { default as MCToServerSchema } from "../../spec/packets/schemas/MCToServer.schema.json";

export { default as MSToClientSchema } from "../../spec/packets/schemas/MSToClient.schema.json";

export { default as MSToServerSchema } from "../../spec/packets/schemas/MSToServer.schema.json";

export { default as PESchema } from "../../spec/packets/schemas/PE.schema.json";

export { default as PNSchema } from "../../spec/packets/schemas/PN.schema.json";

export { default as PRSchema } from "../../spec/packets/schemas/PR.schema.json";

export { default as PUSchema } from "../../spec/packets/schemas/PU.schema.json";

export { default as PVSchema } from "../../spec/packets/schemas/PV.schema.json";

export { default as RCSchema } from "../../spec/packets/schemas/RC.schema.json";

export { default as RDSchema } from "../../spec/packets/schemas/RD.schema.json";

export { default as RMSchema } from "../../spec/packets/schemas/RM.schema.json";

export { default as RMCSchema } from "../../spec/packets/schemas/RMC.schema.json";

export { default as RTToClientSchema } from "../../spec/packets/schemas/RTToClient.schema.json";

export { default as RTToServerSchema } from "../../spec/packets/schemas/RTToServer.schema.json";

export { default as SCSchema } from "../../spec/packets/schemas/SC.schema.json";

export { default as SISchema } from "../../spec/packets/schemas/SI.schema.json";

export { default as SMSchema } from "../../spec/packets/schemas/SM.schema.json";

export { default as SPSchema } from "../../spec/packets/schemas/SP.schema.json";

export { default as TISchema } from "../../spec/packets/schemas/TI.schema.json";

export { default as ZZToClientSchema } from "../../spec/packets/schemas/ZZToClient.schema.json";

export { default as ZZToServerSchema } from "../../spec/packets/schemas/ZZToServer.schema.json";

export { default as askchaaSchema } from "../../spec/packets/schemas/askchaa.schema.json";

export { default as decryptorSchema } from "../../spec/packets/schemas/decryptor.schema.json";


export const enumSchemas = [AreaUpdateTypeEnumSchema, DeskModifierEnumSchema, EmoteModifierEnumSchema, FlipEnumSchema, JudgeStateEnumSchema, ShoutModifierEnumSchema, SideEnumSchema, TextColorEnumSchema];

export const typeSchemas = [OffsetTypeSchema];


export interface Packet {
  $header: string;
}

export interface ARUP extends Packet {
  $header: "ARUP";
  update_type: AreaUpdateType;
  update_data: (number | string)[];
}

export interface ARUPInit {
  update_type: AreaUpdateType;
  update_data: (number | string)[];
}


export interface ASS extends Packet {
  $header: "ASS";
  asset_url: string;
}

export interface ASSInit {
  asset_url: string;
}


export interface AUTH extends Packet {
  $header: "AUTH";
  auth_state: number;
}

export interface AUTHInit {
  auth_state: number;
}


export interface BB extends Packet {
  $header: "BB";
  message: string;
}

export interface BBInit {
  message: string;
}


export interface BD extends Packet {
  $header: "BD";
  reason: string;
}

export interface BDInit {
  reason: string;
}


export interface BN extends Packet {
  $header: "BN";
  background: string;
  position: string;
}

export interface BNInit {
  background: string;
  position?: string;
}


export interface CC extends Packet {
  $header: "CC";
  player_id: number;
  char_id: number;
  char_password: string;
}

export interface CCInit {
  player_id: number;
  char_id: number;
  char_password?: string;
}


export interface CH extends Packet {
  $header: "CH";
  char_id: number;
}

export interface CHInit {
  char_id: number;
}


export interface CHECK extends Packet {
  $header: "CHECK";
}

export interface CHECKInit {

}


export interface CI extends Packet {
  $header: "CI";
  batchIndex: number;
  entries: {
    index: number;
    data: string;
  }[];
}

export interface CIInit {
  batchIndex: number;
  entries: {
    index: number;
    data: string;
  }[];
}


export interface CTToClient extends Packet {
  $header: "CT";
  name: string;
  message: string;
  is_from_server: boolean;
}

export interface CTToClientInit {
  name: string;
  message: string;
  is_from_server?: boolean;
}


export interface CTToServer extends Packet {
  $header: "CT";
  name: string;
  message: string;
}

export interface CTToServerInit {
  name: string;
  message: string;
}


export interface CharsCheck extends Packet {
  $header: "CharsCheck";
  taken: number[];
}

export interface CharsCheckInit {
  taken: number[];
}


export interface DE extends Packet {
  $header: "DE";
  id: number;
}

export interface DEInit {
  id: number;
}


export interface DONE extends Packet {
  $header: "DONE";
}

export interface DONEInit {

}


export interface EE extends Packet {
  $header: "EE";
  id: number;
  name: string;
  description: string;
  image: string;
}

export interface EEInit {
  id: number;
  name: string;
  description: string;
  image: string;
}


export interface EI extends Packet {
  $header: "EI";
  id: number;
  details: {
    name: string;
    description: string;
    type: string;
    image: string;
  };
}

export interface EIInit {
  id: number;
  details: {
    name: string;
    description: string;
    type: string;
    image: string;
  };
}


export interface EM extends Packet {
  $header: "EM";
  batchIndex: number;
  entries: {
    index: number;
    name: string;
  }[];
}

export interface EMInit {
  batchIndex: number;
  entries: {
    index: number;
    name: string;
  }[];
}


export interface FA extends Packet {
  $header: "FA";
  areas: string[];
}

export interface FAInit {
  areas: string[];
}


export interface FL extends Packet {
  $header: "FL";
  features: string[];
}

export interface FLInit {
  features: string[];
}


export interface FM extends Packet {
  $header: "FM";
  music_list: {
    name: string;
  }[];
}

export interface FMInit {
  music_list: {
    name: string;
  }[];
}


export interface HI extends Packet {
  $header: "HI";
  hdid: string;
}

export interface HIInit {
  hdid: string;
}


export interface HPToClient extends Packet {
  $header: "HP";
  bar: number;
  value: number;
}

export interface HPToClientInit {
  bar: number;
  value: number;
}


export interface HPToServer extends Packet {
  $header: "HP";
  bar: number;
  value: number;
}

export interface HPToServerInit {
  bar: number;
  value: number;
}


export interface IDToClient extends Packet {
  $header: "ID";
  player_id: number;
  software: string;
  version: string;
}

export interface IDToClientInit {
  player_id: number;
  software: string;
  version: string;
}


export interface IDToServer extends Packet {
  $header: "ID";
  software: string;
  version: string;
}

export interface IDToServerInit {
  software: string;
  version: string;
}


export interface JD extends Packet {
  $header: "JD";
  state: JudgeState;
}

export interface JDInit {
  state: JudgeState;
}


export interface KB extends Packet {
  $header: "KB";
  reason: string;
}

export interface KBInit {
  reason: string;
}


export interface KK extends Packet {
  $header: "KK";
  reason: string;
}

export interface KKInit {
  reason: string;
}


export interface LE extends Packet {
  $header: "LE";
  evidence: {
    name: string;
    description: string;
    image: string;
  }[];
}

export interface LEInit {
  evidence: {
    name: string;
    description: string;
    image: string;
  }[];
}


export interface MA extends Packet {
  $header: "MA";
  id: number;
  duration: number;
  reason: string;
}

export interface MAInit {
  id: number;
  duration: number;
  reason: string;
}


export interface MCToClient extends Packet {
  $header: "MC";
  name: string;
  char_id: number;
  showname: string;
  looping: boolean;
  channel: number;
  effects: number;
}

export interface MCToClientInit {
  name: string;
  char_id: number;
  showname?: string;
  looping?: boolean;
  channel?: number;
  effects?: number;
}


export interface MCToServer extends Packet {
  $header: "MC";
  name: string;
  char_id: number;
  showname: string;
  effects: number;
}

export interface MCToServerInit {
  name: string;
  char_id: number;
  showname?: string;
  effects?: number;
}


export interface MSToClient extends Packet {
  $header: "MS";
  desk_modifier: DeskModifier;
  preanim: string;
  character: string;
  emote: string;
  message: string;
  side: Side;
  sfx_name: string;
  emote_modifier: EmoteModifier;
  char_id: number;
  sfx_delay: number;
  shout_modifier: ShoutModifier;
  evidence_id: number;
  flip: Flip;
  realization: boolean;
  text_color: TextColor;
  showname: string;
  paired_charid: number;
  paired_name: string;
  paired_emote: string;
  offset: Offset;
  paired_offset: Offset;
  paired_flip: Flip;
  noninterrupting_preanim: boolean;
  sfx_looping: boolean;
  screenshake: boolean;
  frames_shake: string;
  frames_realization: string;
  frames_sfx: string;
  additive: boolean;
  effect: string;
}

export interface MSToClientInit {
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
}


export interface MSToServer extends Packet {
  $header: "MS";
  desk_modifier: DeskModifier;
  preanim: string;
  character: string;
  emote: string;
  message: string;
  side: Side;
  sfx_name: string;
  emote_modifier: EmoteModifier;
  char_id: number;
  sfx_delay: number;
  shout_modifier: ShoutModifier;
  evidence_id: number;
  flip: Flip;
  realization: boolean;
  text_color: TextColor;
  showname: string;
  paired_charid: number;
  offset: Offset;
  noninterrupting_preanim: boolean;
  sfx_looping: boolean;
  screenshake: boolean;
  frames_shake: string;
  frames_realization: string;
  frames_sfx: string;
  additive: boolean;
  effect: string;
}

export interface MSToServerInit {
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
}


export interface PE extends Packet {
  $header: "PE";
  name: string;
  description: string;
  image: string;
}

export interface PEInit {
  name: string;
  description: string;
  image: string;
}


export interface PN extends Packet {
  $header: "PN";
  player_count: number;
  max_players: number;
  server_description: string;
}

export interface PNInit {
  player_count: number;
  max_players: number;
  server_description?: string;
}


export interface PR extends Packet {
  $header: "PR";
  id: number;
  type: number;
}

export interface PRInit {
  id: number;
  type: number;
}


export interface PU extends Packet {
  $header: "PU";
  id: number;
  type: number;
  data: string;
}

export interface PUInit {
  id: number;
  type: number;
  data: string;
}


export interface PV extends Packet {
  $header: "PV";
  player_id: number;
  char_id: number;
}

export interface PVInit {
  player_id: number;
  char_id: number;
}


export interface RC extends Packet {
  $header: "RC";
}

export interface RCInit {

}


export interface RD extends Packet {
  $header: "RD";
}

export interface RDInit {

}


export interface RM extends Packet {
  $header: "RM";
}

export interface RMInit {

}


export interface RMC extends Packet {
  $header: "RMC";
  toTime: string;
}

export interface RMCInit {
  toTime: string;
}


export interface RTToClient extends Packet {
  $header: "RT";
  animation: string;
  judgeId: number;
}

export interface RTToClientInit {
  animation: string;
  judgeId?: number;
}


export interface RTToServer extends Packet {
  $header: "RT";
  animation: string;
  judgeId: number;
}

export interface RTToServerInit {
  animation: string;
  judgeId?: number;
}


export interface SC extends Packet {
  $header: "SC";
  char_data: {
    name: string;
    desc?: string;
    evidence?: string;
  }[];
}

export interface SCInit {
  char_data: {
    name: string;
    desc?: string;
    evidence?: string;
  }[];
}


export interface SI extends Packet {
  $header: "SI";
  char_count: number;
  evi_count: number;
  mus_count: number;
}

export interface SIInit {
  char_count: number;
  evi_count: number;
  mus_count: number;
}


export interface SM extends Packet {
  $header: "SM";
  music_list: {
    name: string;
  }[];
}

export interface SMInit {
  music_list: {
    name: string;
  }[];
}


export interface SP extends Packet {
  $header: "SP";
  side: Side;
}

export interface SPInit {
  side: Side;
}


export interface TI extends Packet {
  $header: "TI";
  timer_id: number;
  command: number;
  time: number;
}

export interface TIInit {
  timer_id: number;
  command: number;
  time: number;
}


export interface ZZToClient extends Packet {
  $header: "ZZ";
  reason: string;
  target: number;
}

export interface ZZToClientInit {
  reason: string;
  target?: number;
}


export interface ZZToServer extends Packet {
  $header: "ZZ";
  reason: string;
  target: number;
}

export interface ZZToServerInit {
  reason: string;
  target?: number;
}


export interface askchaa extends Packet {
  $header: "askchaa";
}

export interface askchaaInit {

}


export interface decryptor extends Packet {
  $header: "decryptor";
  value: string;
}

export interface decryptorInit {
  value: string;
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
  ZZ: ZZToClientSchema,
} as const;

export type C2SInputs = {
  askchaa: askchaaInit;
  CC: CCInit;
  CH: CHInit;
  CT: CTToServerInit;
  DE: DEInit;
  EE: EEInit;
  HI: HIInit;
  HP: HPToServerInit;
  ID: IDToServerInit;
  MA: MAInit;
  MC: MCToServerInit;
  MS: MSToServerInit;
  PE: PEInit;
  RC: RCInit;
  RD: RDInit;
  RM: RMInit;
  RT: RTToServerInit;
  ZZ: ZZToServerInit;
};

export type S2CInputs = {
  ARUP: ARUPInit;
  ASS: ASSInit;
  AUTH: AUTHInit;
  BB: BBInit;
  BD: BDInit;
  BN: BNInit;
  CharsCheck: CharsCheckInit;
  CHECK: CHECKInit;
  CI: CIInit;
  CT: CTToClientInit;
  decryptor: decryptorInit;
  DONE: DONEInit;
  EI: EIInit;
  EM: EMInit;
  FA: FAInit;
  FL: FLInit;
  FM: FMInit;
  HP: HPToClientInit;
  ID: IDToClientInit;
  JD: JDInit;
  KB: KBInit;
  KK: KKInit;
  LE: LEInit;
  MC: MCToClientInit;
  MS: MSToClientInit;
  PN: PNInit;
  PR: PRInit;
  PU: PUInit;
  PV: PVInit;
  RMC: RMCInit;
  RT: RTToClientInit;
  SC: SCInit;
  SI: SIInit;
  SM: SMInit;
  SP: SPInit;
  TI: TIInit;
  ZZ: ZZToClientInit;
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
  ZZ: ZZToClient;
};

/** Discriminated union of decoded packets, narrow on `$header`. */
export type AnyC2S = C2SOutputs[keyof C2SOutputs];
export type AnyS2C = S2COutputs[keyof S2COutputs];
export type AnyPacket = AnyC2S | AnyS2C;
