import aolib


def test_public_surface_exports() -> None:
    for name in [
        "server",
        "client",
        "SessionConfig",
        "register_packet",
        "PacketOptions",
        "parse_char_ini",
        "ms_to_ticks",
        "ticks_to_ms",
        "new_packet",
        "packet_to_string",
        "escape_fanta",
        "unescape_fanta",
        "is_full_view",
        "AolibError",
        "ValidationError",
    ]:
        assert hasattr(aolib, name), name
    assert aolib.__version__ == "2.6.1"


def test_enums_are_str_subclass() -> None:
    assert aolib.Side.def_ == "def"
    assert aolib.Side.pro == "pro"
    assert isinstance(aolib.Side.wit, str)


def test_is_full_view() -> None:
    assert aolib.is_full_view("def") and aolib.is_full_view("pro") and aolib.is_full_view("wit")
    assert not aolib.is_full_view("jud") and not aolib.is_full_view("hld")
