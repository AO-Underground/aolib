from aolib import parse_char_ini

BLOCK_INI = """[options]
name = Fenomeno3D
model = model.pmx ; 3D
side = def

[emote objection]
anim      = objection.gif
preanim   = point.gif
postanim  = bow.gif
camera    = objection_cam.vmd
sound     = objection.opus
sounddelayms = 500
modifier  = zoom
deskmod   = shown

[emote think]
anim = think_loop.gif
"""

LEGACY_INI = """[options]
name = Legacy
blips = female

[emotions]
number = 2
1 = normal#-#normal#1
2 = point#point#point#5

[soundn]
1 = 0
2 = shocked

[soundt]
2 = 8
"""


def test_block_emotes() -> None:
    parsed = parse_char_ini(BLOCK_INI)
    assert parsed["options"]["name"] == "Fenomeno3D"
    assert parsed["options"]["side"] == "def"
    assert parsed["options"]["model"] == "model.pmx"

    assert len(parsed["emotes"]) == 2
    e = parsed["emotes"][0]
    assert e["key"] == "objection"
    assert e["anim"] == "objection.gif"
    assert e["preanim"] == "point.gif"
    assert e["postanim"] == "bow.gif"
    assert e["camera"] == "objection_cam.vmd"
    assert e["sound"] == "objection.opus"
    assert e["modifier"] == "zoom"
    assert e["deskmod"] == "shown"
    assert e["sounddelayms"] == 500
    assert e["sounddelayticks"] == 13  # 500 ms rounds half up to 13 ticks


def test_legacy_emotes() -> None:
    parsed = parse_char_ini(LEGACY_INI)
    assert parsed["options"]["blips"] == "female"

    assert len(parsed["emotes"]) == 2
    e = parsed["emotes"][1]
    assert e["key"] == "2"
    assert e["name"] == "point"
    assert e["preanim"] == "point"
    assert e["anim"] == "point"
    assert e["modifier"] == "zoom"  # wire int 5 -> zoom
    assert e["sound"] == "shocked"
    assert e["sounddelayticks"] == 8
    assert e["sounddelayms"] == 320


def test_options_defaults() -> None:
    parsed = parse_char_ini("[options]\nname = X\n\n[emotions]\nnumber = 1\n1 = a#-#b\n")
    opts = parsed["options"]
    assert opts["side"] == "wit"
    assert opts["blips"] == "male"
    assert opts["scaling"] == "auto"
    assert opts["stretch"] is False
    assert opts["chat"] is None
