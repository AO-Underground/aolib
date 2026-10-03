# AUTO-GENERATED from spec/. Do not edit; run `python scripts/codegen.py`.

from typing import Any, Dict, List, TypedDict

from .enums import AreaUpdateType, AuthState, CharAvailability, DeskModifier, EmoteModifier, Flip, JudgeState, MusicChannel, PenaltyBar, PlayerDataType, PlayerListUpdate, RTAnimation, ShoutModifier, Side, TextColor, TimerCommand
from .types import Effect, MusicEffects, Offset
from .schemas import ARUPSchema, ASSSchema, AUTHSchema, AreaUpdateTypeEnumSchema, AuthStateEnumSchema, BBSchema, BDSchema, BNSchema, CASEAToClientSchema, CASEAToServerSchema, CCSchema, CHECKSchema, CHSchema, CISchema, CTToClientSchema, CTToServerSchema, CharAvailabilityEnumSchema, CharsCheckSchema, DESchema, DONESchema, DeskModifierEnumSchema, EESchema, EISchema, EMSchema, EffectTypeSchema, EmoteModifierEnumSchema, FASchema, FLSchema, FMSchema, FlipEnumSchema, HISchema, HPToClientSchema, HPToServerSchema, IDToClientSchema, IDToServerSchema, JDSchema, JudgeStateEnumSchema, KBSchema, KKSchema, LESchema, MASchema, MCToClientSchema, MCToServerSchema, MSToClientSchema, MSToServerSchema, MusicChannelEnumSchema, MusicEffectsTypeSchema, OffsetTypeSchema, PESchema, PNSchema, PRSchema, PUSchema, PVSchema, PenaltyBarEnumSchema, PlayerDataTypeEnumSchema, PlayerListUpdateEnumSchema, RCSchema, RDSchema, RMCSchema, RMSchema, RTAnimationEnumSchema, RTToClientSchema, RTToServerSchema, SCSchema, SETCASESchema, SISchema, SMSchema, SPSchema, STSchema, ShoutModifierEnumSchema, SideEnumSchema, TISchema, TextColorEnumSchema, TimerCommandEnumSchema, ZZToClientSchema, ZZToServerSchema, askchaaSchema, decryptorSchema


Packet = TypedDict("Packet", {"$header": str, "$extras": Dict[str, Any]}, total=False)

enum_schemas = [AreaUpdateTypeEnumSchema, AuthStateEnumSchema, CharAvailabilityEnumSchema, DeskModifierEnumSchema, EmoteModifierEnumSchema, FlipEnumSchema, JudgeStateEnumSchema, MusicChannelEnumSchema, PenaltyBarEnumSchema, PlayerDataTypeEnumSchema, PlayerListUpdateEnumSchema, RTAnimationEnumSchema, ShoutModifierEnumSchema, SideEnumSchema, TextColorEnumSchema, TimerCommandEnumSchema]
type_schemas = [EffectTypeSchema, MusicEffectsTypeSchema, OffsetTypeSchema]

c2s_schemas: Dict[str, Dict[str, Any]] = {
    'CASEA': CASEAToServerSchema,
    'CC': CCSchema,
    'CH': CHSchema,
    'CT': CTToServerSchema,
    'DE': DESchema,
    'EE': EESchema,
    'HI': HISchema,
    'HP': HPToServerSchema,
    'ID': IDToServerSchema,
    'MA': MASchema,
    'MC': MCToServerSchema,
    'MS': MSToServerSchema,
    'PE': PESchema,
    'RC': RCSchema,
    'RD': RDSchema,
    'RM': RMSchema,
    'RT': RTToServerSchema,
    'SETCASE': SETCASESchema,
    'ZZ': ZZToServerSchema,
    'askchaa': askchaaSchema,
}

s2c_schemas: Dict[str, Dict[str, Any]] = {
    'ARUP': ARUPSchema,
    'ASS': ASSSchema,
    'AUTH': AUTHSchema,
    'BB': BBSchema,
    'BD': BDSchema,
    'BN': BNSchema,
    'CASEA': CASEAToClientSchema,
    'CHECK': CHECKSchema,
    'CI': CISchema,
    'CT': CTToClientSchema,
    'CharsCheck': CharsCheckSchema,
    'DONE': DONESchema,
    'EI': EISchema,
    'EM': EMSchema,
    'FA': FASchema,
    'FL': FLSchema,
    'FM': FMSchema,
    'HP': HPToClientSchema,
    'ID': IDToClientSchema,
    'JD': JDSchema,
    'KB': KBSchema,
    'KK': KKSchema,
    'LE': LESchema,
    'MC': MCToClientSchema,
    'MS': MSToClientSchema,
    'PN': PNSchema,
    'PR': PRSchema,
    'PU': PUSchema,
    'PV': PVSchema,
    'RMC': RMCSchema,
    'RT': RTToClientSchema,
    'SC': SCSchema,
    'SI': SISchema,
    'SM': SMSchema,
    'SP': SPSchema,
    'ST': STSchema,
    'TI': TISchema,
    'ZZ': ZZToClientSchema,
    'decryptor': decryptorSchema,
}

class ARUP(Packet, total=False):
    """Refreshes one column of the area list (player counts, status, case managers or lock state). Wire form in CODECS.md."""
    update_type: AreaUpdateType
    update_data: List[Any]

class ASS(Packet, total=False):
    """Base URL the client downloads missing assets from."""
    asset_url: str

class AUTH(Packet, total=False):
    """Result of a moderator login or logout."""
    auth_state: AuthState

class BB(Packet, total=False):
    """Server notice shown to the client in a popup."""
    message: str

class BD(Packet, total=False):
    """Tells a connecting client it is banned."""
    reason: str

class BN(Packet, total=False):
    """Changes the area background, optionally moving the client to a position."""
    background: str
    position: str

class CASEAToClient(Packet, total=False):
    """Case announcement relayed by the server to clients whose SETCASE preferences match."""
    message: str
    need_def: bool
    need_pro: bool
    need_judge: bool
    need_jury: bool
    need_steno: bool

class CASEAToServer(Packet, total=False):
    """Announces a case, naming the roles it needs; the server alerts clients whose SETCASE preferences match."""
    title: str
    need_def: bool
    need_pro: bool
    need_judge: bool
    need_jury: bool
    need_steno: bool

class CC(Packet, total=False):
    """Character selection request; the server confirms with PV."""
    player_id: float
    char_id: float
    char_password: str

class CH(Packet, total=False):
    """Keepalive sent periodically from the courtroom; the server answers with CHECK."""
    char_id: float

class CHECK(Packet, total=False):
    """Keepalive reply to CH; the client uses the round trip as its latency."""

class CI(Packet, total=False):
    """Legacy batched character list from before SC; webAO's old loader only."""
    batch_index: float
    entries: List[Dict[str, Any]]

class CTToClient(Packet, total=False):
    """Out-of-character chat message."""
    name: str
    message: str
    is_from_server: bool

class CTToServer(Packet, total=False):
    """Out-of-character chat message; servers treat a leading `/` as a command."""
    name: str
    message: str

class CharsCheck(Packet, total=False):
    """Which characters are taken."""
    taken: List[CharAvailability]

class DE(Packet, total=False):
    """Deletes an evidence item from the current area."""
    id: float

class DONE(Packet, total=False):
    """Ends the loading handshake; the client leaves the lobby and enters the courtroom."""

class EE(Packet, total=False):
    """Replaces an evidence item in the current area."""
    id: float
    name: str
    description: str
    image: str

class EI(Packet, total=False):
    """Legacy single evidence item sent during loading, from before LE; webAO's old loader only."""
    id: float
    details: Dict[str, Any]

class EM(Packet, total=False):
    """Legacy batched area and music list from before SM; webAO's old loader only."""
    batch_index: float
    entries: List[Dict[str, Any]]

class FA(Packet, total=False):
    """Full area list; replaces the client's areas."""
    areas: List[str]

class FL(Packet, total=False):
    """Optional protocol features the server supports."""
    features: List[str]

class FM(Packet, total=False):
    """Full music list; replaces the client's music list."""
    music_list: List[Dict[str, Any]]

class HI(Packet, total=False):
    """Client hardware ID, sent in reply to decryptor; servers use it for bans."""
    hdid: str

class HPToClient(Packet, total=False):
    """Sets a penalty bar."""
    bar: PenaltyBar
    value: int

class HPToServer(Packet, total=False):
    """Requests a penalty bar change."""
    bar: PenaltyBar
    value: int

class IDToClient(Packet, total=False):
    """Server identification, sent after HI; the client replies with its own ID."""
    player_id: float
    software: str
    version: str

class IDToServer(Packet, total=False):
    """Client identification, sent in reply to IDToClient."""
    software: str
    version: str

class JD(Packet, total=False):
    """Shows or hides the judge controls for this client."""
    state: JudgeState

class KB(Packet, total=False):
    """Tells the client it was banned; the client returns to the lobby."""
    reason: str

class KK(Packet, total=False):
    """Tells the client it was kicked; the client returns to the lobby."""
    reason: str

class LE(Packet, total=False):
    """Full evidence list for the current area."""
    evidence: List[Dict[str, Any]]

class MA(Packet, total=False):
    """Moderator action: kicks or bans a player."""
    player_id: float
    duration_minutes: int
    reason: str

class MCToClient(Packet, total=False):
    """Plays a track on a music channel."""
    name: str
    char_id: float
    showname: str
    looping: bool
    channel: MusicChannel
    effects: MusicEffects

class MCToServer(Packet, total=False):
    """Requests a track, or an area change when `name` is an area name."""
    name: str
    char_id: float
    showname: str
    effects: MusicEffects

class MSToClient(Packet, total=False):
    """In-character message as broadcast by the server, with the pair's data filled in."""
    desk_modifier: DeskModifier
    preanim: str
    character: str
    emote: str
    message: str
    side: Side
    sfx_name: str
    emote_modifier: EmoteModifier
    char_id: float
    sfx_delay: float
    shout_modifier: ShoutModifier
    evidence_id: float
    flip: Flip
    realization: bool
    text_color: TextColor
    showname: str
    paired_charid: float
    paired_order: int
    paired_name: str
    paired_emote: str
    offset: Offset
    paired_offset: Offset
    paired_flip: Flip
    noninterrupting_preanim: bool
    sfx_looping: bool
    screenshake: bool
    frames_shake: str
    frames_realization: str
    frames_sfx: str
    additive: bool
    effect: Effect

class MSToServer(Packet, total=False):
    """In-character message sent by the speaker."""
    desk_modifier: DeskModifier
    preanim: str
    character: str
    emote: str
    message: str
    side: Side
    sfx_name: str
    emote_modifier: EmoteModifier
    char_id: float
    sfx_delay: float
    shout_modifier: ShoutModifier
    evidence_id: float
    flip: Flip
    realization: bool
    text_color: TextColor
    showname: str
    paired_charid: float
    paired_order: int
    offset: Offset
    noninterrupting_preanim: bool
    sfx_looping: bool
    screenshake: bool
    frames_shake: str
    frames_realization: str
    frames_sfx: str
    additive: bool
    effect: Effect

class PE(Packet, total=False):
    """Adds an evidence item to the current area."""
    name: str
    description: str
    image: str

class PN(Packet, total=False):
    """Player count and server description, shown in the lobby."""
    player_count: float
    max_players: float
    server_description: str

class PR(Packet, total=False):
    """Adds or removes a player-list entry."""
    id: float
    type: PlayerListUpdate

class PU(Packet, total=False):
    """Updates one field of a player-list entry."""
    id: float
    type: PlayerDataType
    data: str

class PV(Packet, total=False):
    """Confirms a character selection (reply to CC)."""
    player_id: float
    char_id: float

class RC(Packet, total=False):
    """Requests the character list; the server replies with SC."""

class RD(Packet, total=False):
    """Tells the server the client has loaded its lists; the server sends area state and DONE."""

class RM(Packet, total=False):
    """Requests the music list; the server replies with SM."""

class RMC(Packet, total=False):
    """Seeks the currently playing track to an offset. Only webAO handles it; AO2-Client ignores it."""
    to_time: str

class RTToClient(Packet, total=False):
    """Plays a testimony or verdict animation."""
    animation: RTAnimation
    name: str

class RTToServer(Packet, total=False):
    """Requests a testimony or verdict animation."""
    animation: RTAnimation
    name: str

class SC(Packet, total=False):
    """Character list, sent in reply to RC."""
    char_data: List[Dict[str, Any]]

class SETCASE(Packet, total=False):
    """Sets which roles the client wants case announcements (CASEA) for."""
    cases: str
    will_cm: bool
    will_def: bool
    will_pro: bool
    will_judge: bool
    will_jury: bool
    will_steno: bool

class SI(Packet, total=False):
    """List sizes, sent in reply to askchaa; the client then requests SC with RC."""
    char_count: float
    evi_count: float
    mus_count: float

class SM(Packet, total=False):
    """Legacy combined area and music list, sent in reply to RM; the client replies with RD."""
    music_list: List[Dict[str, Any]]

class SP(Packet, total=False):
    """Moves the client to a position."""
    side: Side

class ST(Packet, total=False):
    """Sets the client's theme subtheme; akashi sends it for /subtheme."""
    subtheme: str
    reload: bool

class TI(Packet, total=False):
    """Controls a countdown clock."""
    timer_id: float
    command: TimerCommand
    time: float

class ZZToClient(Packet, total=False):
    """Mod call notice delivered to moderators."""
    reason: str

class ZZToServer(Packet, total=False):
    """Calls a moderator."""
    reason: str
    reported_player_id: float

class askchaa(Packet, total=False):
    """Asks for the list sizes to start loading; the server replies with SI."""

class decryptor(Packet, total=False):
    """First packet from the server; the client replies with HI."""
    value: str

