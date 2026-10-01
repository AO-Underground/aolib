// AUTO-GENERATED from spec/. Do not edit; run `bun run codegen`.

/* eslint-disable */

import { AreaUpdateType, AuthState, CharAvailability, DeskModifier, EmoteModifier, Flip, JudgeState, MusicChannel, PenaltyBar, PlayerDataType, PlayerListUpdate, RTAnimation, ShoutModifier, Side, TextColor, TimerCommand } from "./enums";
import { Effect, MusicEffects, Offset } from "./types";

import { AreaUpdateTypeEnumSchema, AuthStateEnumSchema, CharAvailabilityEnumSchema, DeskModifierEnumSchema, EmoteModifierEnumSchema, FlipEnumSchema, JudgeStateEnumSchema, MusicChannelEnumSchema, PenaltyBarEnumSchema, PlayerDataTypeEnumSchema, PlayerListUpdateEnumSchema, RTAnimationEnumSchema, ShoutModifierEnumSchema, SideEnumSchema, TextColorEnumSchema, TimerCommandEnumSchema, EffectTypeSchema, MusicEffectsTypeSchema, OffsetTypeSchema, ARUPSchema, ASSSchema, AUTHSchema, BBSchema, BDSchema, BNSchema, CCSchema, CHSchema, CHECKSchema, CISchema, CTToClientSchema, CTToServerSchema, CharsCheckSchema, DESchema, DONESchema, EESchema, EISchema, EMSchema, FASchema, FLSchema, FMSchema, HISchema, HPToClientSchema, HPToServerSchema, IDToClientSchema, IDToServerSchema, JDSchema, KBSchema, KKSchema, LESchema, MASchema, MCToClientSchema, MCToServerSchema, MSToClientSchema, MSToServerSchema, PESchema, PNSchema, PRSchema, PUSchema, PVSchema, RCSchema, RDSchema, RMSchema, RMCSchema, RTToClientSchema, RTToServerSchema, SCSchema, SISchema, SMSchema, SPSchema, TISchema, ZZToClientSchema, ZZToServerSchema, askchaaSchema, decryptorSchema } from "./schemas";

export { ARUPSchema, ASSSchema, AUTHSchema, BBSchema, BDSchema, BNSchema, CCSchema, CHSchema, CHECKSchema, CISchema, CTToClientSchema, CTToServerSchema, CharsCheckSchema, DESchema, DONESchema, EESchema, EISchema, EMSchema, FASchema, FLSchema, FMSchema, HISchema, HPToClientSchema, HPToServerSchema, IDToClientSchema, IDToServerSchema, JDSchema, KBSchema, KKSchema, LESchema, MASchema, MCToClientSchema, MCToServerSchema, MSToClientSchema, MSToServerSchema, PESchema, PNSchema, PRSchema, PUSchema, PVSchema, RCSchema, RDSchema, RMSchema, RMCSchema, RTToClientSchema, RTToServerSchema, SCSchema, SISchema, SMSchema, SPSchema, TISchema, ZZToClientSchema, ZZToServerSchema, askchaaSchema, decryptorSchema } from "./schemas";


export const enumSchemas = [AreaUpdateTypeEnumSchema, AuthStateEnumSchema, CharAvailabilityEnumSchema, DeskModifierEnumSchema, EmoteModifierEnumSchema, FlipEnumSchema, JudgeStateEnumSchema, MusicChannelEnumSchema, PenaltyBarEnumSchema, PlayerDataTypeEnumSchema, PlayerListUpdateEnumSchema, RTAnimationEnumSchema, ShoutModifierEnumSchema, SideEnumSchema, TextColorEnumSchema, TimerCommandEnumSchema];

export const typeSchemas = [EffectTypeSchema, MusicEffectsTypeSchema, OffsetTypeSchema];


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
  auth_state: AuthState;
}

export interface AUTHInit {
  auth_state: AuthState;
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
  batch_index: number;
  entries: {
    index: number;
    data: string;
  }[];
}

export interface CIInit {
  batch_index: number;
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
  taken: CharAvailability[];
}

export interface CharsCheckInit {
  taken: CharAvailability[];
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
  batch_index: number;
  entries: {
    index: number;
    name: string;
  }[];
}

export interface EMInit {
  batch_index: number;
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
  bar: PenaltyBar;
  value: number;
}

export interface HPToClientInit {
  bar: PenaltyBar;
  value: number;
}


export interface HPToServer extends Packet {
  $header: "HP";
  bar: PenaltyBar;
  value: number;
}

export interface HPToServerInit {
  bar: PenaltyBar;
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
  player_id: number;
  duration_minutes: number;
  reason: string;
}

export interface MAInit {
  player_id: number;
  duration_minutes: number;
  reason: string;
}


export interface MCToClient extends Packet {
  $header: "MC";
  name: string;
  char_id: number;
  showname: string;
  looping: boolean;
  channel: MusicChannel;
  effects: MusicEffects;
}

export interface MCToClientInit {
  name: string;
  char_id: number;
  showname?: string;
  looping?: boolean;
  channel?: MusicChannel;
  effects?: MusicEffects;
}


export interface MCToServer extends Packet {
  $header: "MC";
  name: string;
  char_id: number;
  showname: string;
  effects: MusicEffects;
}

export interface MCToServerInit {
  name: string;
  char_id: number;
  showname?: string;
  effects?: MusicEffects;
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
  effect: Effect;
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
  effect?: Effect;
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
  effect: Effect;
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
  effect?: Effect;
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
  type: PlayerListUpdate;
}

export interface PRInit {
  id: number;
  type: PlayerListUpdate;
}


export interface PU extends Packet {
  $header: "PU";
  id: number;
  type: PlayerDataType;
  data: string;
}

export interface PUInit {
  id: number;
  type: PlayerDataType;
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
  to_time: string;
}

export interface RMCInit {
  to_time: string;
}


export interface RTToClient extends Packet {
  $header: "RT";
  animation: RTAnimation;
  name: string;
}

export interface RTToClientInit {
  animation: RTAnimation;
  name?: string;
}


export interface RTToServer extends Packet {
  $header: "RT";
  animation: RTAnimation;
  name: string;
}

export interface RTToServerInit {
  animation: RTAnimation;
  name?: string;
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
  command: TimerCommand;
  time: number;
}

export interface TIInit {
  timer_id: number;
  command: TimerCommand;
  time?: number;
}


export interface ZZToClient extends Packet {
  $header: "ZZ";
  reason: string;
}

export interface ZZToClientInit {
  reason: string;
}


export interface ZZToServer extends Packet {
  $header: "ZZ";
  reason: string;
  reported_player_id: number;
}

export interface ZZToServerInit {
  reason?: string;
  reported_player_id?: number;
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
