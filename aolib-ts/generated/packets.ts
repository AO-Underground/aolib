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
  state: number;
}

export interface JDInit {
  state: number;
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


export interface VS_AUDIO extends Packet {
  $header: "VS_AUDIO";
  fromUid: number;
  payload: string;
}

export interface VS_AUDIOInit {
  fromUid: number;
  payload: string;
}


export interface VS_CAPS extends Packet {
  $header: "VS_CAPS";
  enabled: boolean;
  pttOnly: boolean;
  maxPeers: number;
  codec: string;
  sampleRate: number;
  frameMs: number;
  maxFrameBytes: number;
}

export interface VS_CAPSInit {
  enabled: boolean;
  pttOnly: boolean;
  maxPeers: number;
  codec: string;
  sampleRate: number;
  frameMs: number;
  maxFrameBytes: number;
}


export interface VS_FRAME extends Packet {
  $header: "VS_FRAME";
  payload: string;
}

export interface VS_FRAMEInit {
  payload: string;
}


export interface VS_JOINToClient extends Packet {
  $header: "VS_JOIN";
  uid: number;
}

export interface VS_JOINToClientInit {
  uid: number;
}


export interface VS_JOINToServer extends Packet {
  $header: "VS_JOIN";
}

export interface VS_JOINToServerInit {

}


export interface VS_LEAVEToClient extends Packet {
  $header: "VS_LEAVE";
  uid: number;
}

export interface VS_LEAVEToClientInit {
  uid: number;
}


export interface VS_LEAVEToServer extends Packet {
  $header: "VS_LEAVE";
}

export interface VS_LEAVEToServerInit {

}


export interface VS_PEERS extends Packet {
  $header: "VS_PEERS";
  uids: number[];
}

export interface VS_PEERSInit {
  uids: number[];
}


export interface VS_SPEAKToClient extends Packet {
  $header: "VS_SPEAK";
  uid: number;
  on: boolean;
}

export interface VS_SPEAKToClientInit {
  uid: number;
  on: boolean;
}


export interface VS_SPEAKToServer extends Packet {
  $header: "VS_SPEAK";
  on: boolean;
}

export interface VS_SPEAKToServerInit {
  on: boolean;
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
  VS_FRAME: VS_FRAMEInit;
  VS_JOIN: VS_JOINToServerInit;
  VS_LEAVE: VS_LEAVEToServerInit;
  VS_SPEAK: VS_SPEAKToServerInit;
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
  VS_AUDIO: VS_AUDIOInit;
  VS_CAPS: VS_CAPSInit;
  VS_JOIN: VS_JOINToClientInit;
  VS_LEAVE: VS_LEAVEToClientInit;
  VS_PEERS: VS_PEERSInit;
  VS_SPEAK: VS_SPEAKToClientInit;
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

/** Discriminated union of decoded packets, narrow on `$header`. */
export type AnyC2S = C2SOutputs[keyof C2SOutputs];
export type AnyS2C = S2COutputs[keyof S2COutputs];
export type AnyPacket = AnyC2S | AnyS2C;
