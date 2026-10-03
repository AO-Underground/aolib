# AUTO-GENERATED from spec/. Do not edit; run `python scripts/codegen.py`.

from enum import Enum

class AreaUpdateType(str, Enum):
    """Discriminator for ARUP payloads: 0 = player counts (numbers), 1/2/3 = area metadata strings."""
    player_count = 'player_count'
    status = 'status'
    case_manager = 'case_manager'
    locked = 'locked'

class AuthState(str, Enum):
    """Moderator authentication state (AUTH packet)."""
    logout = 'logout'
    failed = 'failed'
    success = 'success'

class CharAvailability(str, Enum):
    """Per-character availability in a CharsCheck list."""
    free = 'free'
    taken = 'taken'

class DeskModifier(str, Enum):
    """Desk visibility behavior."""
    hidden = 'hidden'
    shown = 'shown'
    hide_during_preanim = 'hide_during_preanim'
    show_during_preanim = 'show_during_preanim'
    hide_and_center_during_preanim = 'hide_and_center_during_preanim'
    show_during_preanim_then_center = 'show_during_preanim_then_center'

class EmoteModifier(str, Enum):
    """Emote behavior selector. Wire values 3 and 4 have no defined behavior and are carried as-is."""
    no_preanim = 'no_preanim'
    preanim = 'preanim'
    preanim_and_objection = 'preanim_and_objection'
    unused_3 = 'unused_3'
    unused_4 = 'unused_4'
    zoom = 'zoom'
    objection_zoom = 'objection_zoom'

class Flip(str, Enum):
    """Sprite mirroring."""
    none = 'none'
    horizontal = 'horizontal'
    vertical = 'vertical'
    horizontal_and_vertical = 'horizontal_and_vertical'

class JudgeState(str, Enum):
    """Judge-control visibility carried by the JD packet."""
    by_position = 'by_position'
    hidden = 'hidden'
    shown = 'shown'

class MusicChannel(str, Enum):
    """MC audio channel."""
    music = 'music'
    ambience = 'ambience'

class PenaltyBar(str, Enum):
    """Which penalty (health) bar an HP packet updates."""
    defense = 'defense'
    prosecution = 'prosecution'

class PlayerDataType(str, Enum):
    """PU packet field selector: which playerlist datum the packet updates."""
    ooc_name = 'ooc_name'
    char_name = 'char_name'
    showname = 'showname'
    area_id = 'area_id'

class PlayerListUpdate(str, Enum):
    """PR packet update type: add or remove a player from the playerlist."""
    add = 'add'
    remove = 'remove'

class RTAnimation(str, Enum):
    """Judge-control overlay animation played by RT."""
    witness_testimony = 'witness_testimony'
    cross_examination = 'cross_examination'
    not_guilty = 'not_guilty'
    guilty = 'guilty'
    end_animation = 'end_animation'
    custom = 'custom'

class ShoutModifier(str, Enum):
    """Shout / objection selector."""
    none = 'none'
    hold_it = 'hold_it'
    objection = 'objection'
    take_that = 'take_that'
    custom = 'custom'

class Side(str, Enum):
    """Character position. Wire values are the lowercase 3-letter codes."""
    def_ = 'def'
    pro = 'pro'
    hld = 'hld'
    hlp = 'hlp'
    wit = 'wit'
    jud = 'jud'
    jur = 'jur'
    sea = 'sea'

class TextColor(str, Enum):
    """Chat message text color. `blue` also disables the talking animation."""
    white = 'white'
    green = 'green'
    red = 'red'
    orange = 'orange'
    blue = 'blue'
    yellow = 'yellow'
    pink = 'pink'
    cyan = 'cyan'
    grey = 'grey'
    rainbow = 'rainbow'

class TimerCommand(str, Enum):
    """TI packet command: how to manipulate a timer."""
    start = 'start'
    pause = 'pause'
    show = 'show'
    hide = 'hide'

