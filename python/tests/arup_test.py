from aolib.decode import decode
from aolib.encode import encode
from aolib.wire import s2c_schemas

ARUP = s2c_schemas["ARUP"]


def test_arup_player_count() -> None:
    wire = encode(ARUP, {"update_type": "player_count", "update_data": [1, 2, 3]}, "fanta")
    assert wire == "ARUP#0#1#2#3#%"
    back = decode(ARUP, wire)
    assert back["update_type"] == "player_count"
    assert back["update_data"] == [1, 2, 3]


def test_arup_status_strings() -> None:
    wire = encode(ARUP, {"update_type": "status", "update_data": ["FREE", "LOCKED"]}, "fanta")
    assert wire == "ARUP#1#FREE#LOCKED#%"
    back = decode(ARUP, wire)
    assert back["update_data"] == ["FREE", "LOCKED"]


def test_arup_json_round_trip() -> None:
    js = encode(ARUP, {"update_type": "player_count", "update_data": [5]}, "json")
    assert js == '{"$header":"ARUP","update_type":"player_count","update_data":[5]}'
    back = decode(ARUP, js)
    assert back["update_data"] == [5]
