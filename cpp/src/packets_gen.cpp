// AUTO-GENERATED from spec/packets/schemas. Do not edit; run aolib-gen.
#include "aolib/packets_gen.hpp"

#include "aolib/fanta.hpp"

namespace aolib {

std::string CIEntriesItem::wire_fields() const {
    return join_amp({std::to_string(index), escape_fanta(data)});
}

CIEntriesItem CIEntriesItem::parse_item(const std::string& s) {
    auto parts = split_amp(s, 2);
    CIEntriesItem it;
    if (parts.size() > 0) it.index = parse_wire_int(parts[0], "CIEntriesItem.index");
    if (parts.size() > 1) it.data = unescape_fanta(parts[1]);
    return it;
}

nlohmann::ordered_json CIEntriesItem::to_json_object() const {
    nlohmann::ordered_json j;
    j["index"] = index;
    j["data"] = data;
    return j;
}

CIEntriesItem CIEntriesItem::from_json_object(const nlohmann::ordered_json& j) {
    CIEntriesItem o;
    if (j.contains("index")) o.index = j["index"].get<int>();
    if (j.contains("data")) o.data = j["data"].get<std::string>();
    return o;
}

std::string EIDetails::wire_fields() const {
    return join_amp({escape_fanta(name), escape_fanta(description), escape_fanta(type), escape_fanta(image)});
}

EIDetails EIDetails::parse_item(const std::string& s) {
    auto parts = split_amp(s, 4);
    EIDetails it;
    if (parts.size() > 0) it.name = unescape_fanta(parts[0]);
    if (parts.size() > 1) it.description = unescape_fanta(parts[1]);
    if (parts.size() > 2) it.type = unescape_fanta(parts[2]);
    if (parts.size() > 3) it.image = unescape_fanta(parts[3]);
    return it;
}

nlohmann::ordered_json EIDetails::to_json_object() const {
    nlohmann::ordered_json j;
    j["name"] = name;
    j["description"] = description;
    j["type"] = type;
    j["image"] = image;
    return j;
}

EIDetails EIDetails::from_json_object(const nlohmann::ordered_json& j) {
    EIDetails o;
    if (j.contains("name")) o.name = j["name"].get<std::string>();
    if (j.contains("description")) o.description = j["description"].get<std::string>();
    if (j.contains("type")) o.type = j["type"].get<std::string>();
    if (j.contains("image")) o.image = j["image"].get<std::string>();
    return o;
}

std::string EMEntriesItem::wire_fields() const {
    return join_amp({std::to_string(index), escape_fanta(name)});
}

EMEntriesItem EMEntriesItem::parse_item(const std::string& s) {
    auto parts = split_amp(s, 2);
    EMEntriesItem it;
    if (parts.size() > 0) it.index = parse_wire_int(parts[0], "EMEntriesItem.index");
    if (parts.size() > 1) it.name = unescape_fanta(parts[1]);
    return it;
}

nlohmann::ordered_json EMEntriesItem::to_json_object() const {
    nlohmann::ordered_json j;
    j["index"] = index;
    j["name"] = name;
    return j;
}

EMEntriesItem EMEntriesItem::from_json_object(const nlohmann::ordered_json& j) {
    EMEntriesItem o;
    if (j.contains("index")) o.index = j["index"].get<int>();
    if (j.contains("name")) o.name = j["name"].get<std::string>();
    return o;
}

std::string FMMusicListItem::wire_fields() const {
    return join_amp({escape_fanta(name)});
}

FMMusicListItem FMMusicListItem::parse_item(const std::string& s) {
    auto parts = split_amp(s, 1);
    FMMusicListItem it;
    if (parts.size() > 0) it.name = unescape_fanta(parts[0]);
    return it;
}

nlohmann::ordered_json FMMusicListItem::to_json_object() const {
    nlohmann::ordered_json j;
    j["name"] = name;
    return j;
}

FMMusicListItem FMMusicListItem::from_json_object(const nlohmann::ordered_json& j) {
    FMMusicListItem o;
    if (j.contains("name")) o.name = j["name"].get<std::string>();
    return o;
}

std::string LEEvidenceItem::wire_fields() const {
    return join_amp({escape_fanta(name), escape_fanta(description), escape_fanta(image)});
}

LEEvidenceItem LEEvidenceItem::parse_item(const std::string& s) {
    auto parts = split_amp(s, 3);
    LEEvidenceItem it;
    if (parts.size() > 0) it.name = unescape_fanta(parts[0]);
    if (parts.size() > 1) it.description = unescape_fanta(parts[1]);
    if (parts.size() > 2) it.image = unescape_fanta(parts[2]);
    return it;
}

nlohmann::ordered_json LEEvidenceItem::to_json_object() const {
    nlohmann::ordered_json j;
    j["name"] = name;
    j["description"] = description;
    j["image"] = image;
    return j;
}

LEEvidenceItem LEEvidenceItem::from_json_object(const nlohmann::ordered_json& j) {
    LEEvidenceItem o;
    if (j.contains("name")) o.name = j["name"].get<std::string>();
    if (j.contains("description")) o.description = j["description"].get<std::string>();
    if (j.contains("image")) o.image = j["image"].get<std::string>();
    return o;
}

std::string SCCharDataItem::wire_fields() const {
    return join_amp({escape_fanta(name), escape_fanta(desc), escape_fanta(evidence)});
}

SCCharDataItem SCCharDataItem::parse_item(const std::string& s) {
    auto parts = split_amp(s, 3);
    SCCharDataItem it;
    if (parts.size() > 0) it.name = unescape_fanta(parts[0]);
    if (parts.size() > 1) it.desc = unescape_fanta(parts[1]);
    if (parts.size() > 2) it.evidence = unescape_fanta(parts[2]);
    return it;
}

nlohmann::ordered_json SCCharDataItem::to_json_object() const {
    nlohmann::ordered_json j;
    j["name"] = name;
    j["desc"] = desc;
    j["evidence"] = evidence;
    return j;
}

SCCharDataItem SCCharDataItem::from_json_object(const nlohmann::ordered_json& j) {
    SCCharDataItem o;
    if (j.contains("name")) o.name = j["name"].get<std::string>();
    if (j.contains("desc")) o.desc = j["desc"].get<std::string>();
    if (j.contains("evidence")) o.evidence = j["evidence"].get<std::string>();
    return o;
}

std::string SMMusicListItem::wire_fields() const {
    return join_amp({escape_fanta(name)});
}

SMMusicListItem SMMusicListItem::parse_item(const std::string& s) {
    auto parts = split_amp(s, 1);
    SMMusicListItem it;
    if (parts.size() > 0) it.name = unescape_fanta(parts[0]);
    return it;
}

nlohmann::ordered_json SMMusicListItem::to_json_object() const {
    nlohmann::ordered_json j;
    j["name"] = name;
    return j;
}

SMMusicListItem SMMusicListItem::from_json_object(const nlohmann::ordered_json& j) {
    SMMusicListItem o;
    if (j.contains("name")) o.name = j["name"].get<std::string>();
    return o;
}

std::vector<std::string> ARUP::json_order() const {
    return {"update_type", "update_data"};
}

std::map<std::string, std::string> ARUP::json_consts() const {
    return {};
}

std::vector<std::string> ASS::json_order() const {
    return {"asset_url"};
}

std::map<std::string, std::string> ASS::json_consts() const {
    return {};
}

std::vector<std::string> ASS::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(asset_url));
    return args;
}

ASS ASS::parse(const std::vector<std::string>& body) {
    ASS p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.asset_url = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json ASS::to_json_object() const {
    nlohmann::ordered_json j;
    j["asset_url"] = asset_url;
    return j;
}

void ASS::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("asset_url")) asset_url = j["asset_url"].get<std::string>();
}

std::vector<std::string> AUTH::json_order() const {
    return {"auth_state"};
}

std::map<std::string, std::string> AUTH::json_consts() const {
    return {};
}

std::vector<std::string> AUTH::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(auth_state_to_wire(auth_state)));
    return args;
}

AUTH AUTH::parse(const std::vector<std::string>& body) {
    AUTH p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.auth_state = auth_state_from_wire(parse_wire_int(body[cursor], "auth_state"));
    cursor++;
    return p;
}

nlohmann::ordered_json AUTH::to_json_object() const {
    nlohmann::ordered_json j;
    j["auth_state"] = auth_state_to_string(auth_state);
    return j;
}

void AUTH::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("auth_state")) auth_state = auth_state_from_string(j["auth_state"].get<std::string>());
}

std::vector<std::string> BB::json_order() const {
    return {"message"};
}

std::map<std::string, std::string> BB::json_consts() const {
    return {};
}

std::vector<std::string> BB::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(message));
    return args;
}

BB BB::parse(const std::vector<std::string>& body) {
    BB p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.message = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json BB::to_json_object() const {
    nlohmann::ordered_json j;
    j["message"] = message;
    return j;
}

void BB::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("message")) message = j["message"].get<std::string>();
}

std::vector<std::string> BD::json_order() const {
    return {"reason"};
}

std::map<std::string, std::string> BD::json_consts() const {
    return {};
}

std::vector<std::string> BD::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(reason));
    return args;
}

BD BD::parse(const std::vector<std::string>& body) {
    BD p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.reason = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json BD::to_json_object() const {
    nlohmann::ordered_json j;
    j["reason"] = reason;
    return j;
}

void BD::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("reason")) reason = j["reason"].get<std::string>();
}

std::vector<std::string> BN::json_order() const {
    return {"background", "position"};
}

std::map<std::string, std::string> BN::json_consts() const {
    return {};
}

std::vector<std::string> BN::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(background));
    args.push_back(escape_fanta(position));
    return args;
}

BN BN::parse(const std::vector<std::string>& body) {
    BN p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.background = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.position = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json BN::to_json_object() const {
    nlohmann::ordered_json j;
    j["background"] = background;
    j["position"] = position;
    return j;
}

void BN::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("background")) background = j["background"].get<std::string>();
    if (j.contains("position")) position = j["position"].get<std::string>();
}

std::vector<std::string> CASEAToClient::json_order() const {
    return {"message", "need_def", "need_pro", "need_judge", "need_jury", "need_steno", "_legacy"};
}

std::map<std::string, std::string> CASEAToClient::json_consts() const {
    return {{"_legacy", "1"}};
}

std::vector<std::string> CASEAToClient::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(message));
    args.push_back(bool_to_wire(need_def));
    args.push_back(bool_to_wire(need_pro));
    args.push_back(bool_to_wire(need_judge));
    args.push_back(bool_to_wire(need_jury));
    args.push_back(bool_to_wire(need_steno));
    args.push_back("1");
    return args;
}

CASEAToClient CASEAToClient::parse(const std::vector<std::string>& body) {
    CASEAToClient p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.message = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.need_def = parse_wire_bool(body[cursor], "need_def");
    cursor++;
    if (cursor < body.size()) p.need_pro = parse_wire_bool(body[cursor], "need_pro");
    cursor++;
    if (cursor < body.size()) p.need_judge = parse_wire_bool(body[cursor], "need_judge");
    cursor++;
    if (cursor < body.size()) p.need_jury = parse_wire_bool(body[cursor], "need_jury");
    cursor++;
    if (cursor < body.size()) p.need_steno = parse_wire_bool(body[cursor], "need_steno");
    cursor++;
    cursor++;
    return p;
}

nlohmann::ordered_json CASEAToClient::to_json_object() const {
    nlohmann::ordered_json j;
    j["message"] = message;
    j["need_def"] = need_def;
    j["need_pro"] = need_pro;
    j["need_judge"] = need_judge;
    j["need_jury"] = need_jury;
    j["need_steno"] = need_steno;
    return j;
}

void CASEAToClient::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("message")) message = j["message"].get<std::string>();
    if (j.contains("need_def")) need_def = j["need_def"].get<bool>();
    if (j.contains("need_pro")) need_pro = j["need_pro"].get<bool>();
    if (j.contains("need_judge")) need_judge = j["need_judge"].get<bool>();
    if (j.contains("need_jury")) need_jury = j["need_jury"].get<bool>();
    if (j.contains("need_steno")) need_steno = j["need_steno"].get<bool>();
}

std::vector<std::string> CASEAToServer::json_order() const {
    return {"title", "need_def", "need_pro", "need_judge", "need_jury", "need_steno"};
}

std::map<std::string, std::string> CASEAToServer::json_consts() const {
    return {};
}

std::vector<std::string> CASEAToServer::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(title));
    args.push_back(bool_to_wire(need_def));
    args.push_back(bool_to_wire(need_pro));
    args.push_back(bool_to_wire(need_judge));
    args.push_back(bool_to_wire(need_jury));
    args.push_back(bool_to_wire(need_steno));
    return args;
}

CASEAToServer CASEAToServer::parse(const std::vector<std::string>& body) {
    CASEAToServer p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.title = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.need_def = parse_wire_bool(body[cursor], "need_def");
    cursor++;
    if (cursor < body.size()) p.need_pro = parse_wire_bool(body[cursor], "need_pro");
    cursor++;
    if (cursor < body.size()) p.need_judge = parse_wire_bool(body[cursor], "need_judge");
    cursor++;
    if (cursor < body.size()) p.need_jury = parse_wire_bool(body[cursor], "need_jury");
    cursor++;
    if (cursor < body.size()) p.need_steno = parse_wire_bool(body[cursor], "need_steno");
    cursor++;
    return p;
}

nlohmann::ordered_json CASEAToServer::to_json_object() const {
    nlohmann::ordered_json j;
    j["title"] = title;
    j["need_def"] = need_def;
    j["need_pro"] = need_pro;
    j["need_judge"] = need_judge;
    j["need_jury"] = need_jury;
    j["need_steno"] = need_steno;
    return j;
}

void CASEAToServer::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("title")) title = j["title"].get<std::string>();
    if (j.contains("need_def")) need_def = j["need_def"].get<bool>();
    if (j.contains("need_pro")) need_pro = j["need_pro"].get<bool>();
    if (j.contains("need_judge")) need_judge = j["need_judge"].get<bool>();
    if (j.contains("need_jury")) need_jury = j["need_jury"].get<bool>();
    if (j.contains("need_steno")) need_steno = j["need_steno"].get<bool>();
}

std::vector<std::string> CC::json_order() const {
    return {"player_id", "char_id", "char_password"};
}

std::map<std::string, std::string> CC::json_consts() const {
    return {};
}

std::vector<std::string> CC::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(player_id));
    args.push_back(std::to_string(char_id));
    args.push_back(escape_fanta(char_password));
    return args;
}

CC CC::parse(const std::vector<std::string>& body) {
    CC p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.player_id = parse_wire_int(body[cursor], "player_id");
    cursor++;
    if (cursor < body.size()) p.char_id = parse_wire_int(body[cursor], "char_id");
    cursor++;
    if (cursor < body.size()) p.char_password = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json CC::to_json_object() const {
    nlohmann::ordered_json j;
    j["player_id"] = player_id;
    j["char_id"] = char_id;
    j["char_password"] = char_password;
    return j;
}

void CC::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("player_id")) player_id = j["player_id"].get<int>();
    if (j.contains("char_id")) char_id = j["char_id"].get<int>();
    if (j.contains("char_password")) char_password = j["char_password"].get<std::string>();
}

std::vector<std::string> CH::json_order() const {
    return {"char_id"};
}

std::map<std::string, std::string> CH::json_consts() const {
    return {};
}

std::vector<std::string> CH::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(char_id));
    return args;
}

CH CH::parse(const std::vector<std::string>& body) {
    CH p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.char_id = parse_wire_int(body[cursor], "char_id");
    cursor++;
    return p;
}

nlohmann::ordered_json CH::to_json_object() const {
    nlohmann::ordered_json j;
    j["char_id"] = char_id;
    return j;
}

void CH::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("char_id")) char_id = j["char_id"].get<int>();
}

std::vector<std::string> CHECK::json_order() const {
    return {};
}

std::map<std::string, std::string> CHECK::json_consts() const {
    return {};
}

std::vector<std::string> CHECK::args() const {
    std::vector<std::string> args;
    return args;
}

CHECK CHECK::parse(const std::vector<std::string>& body) {
    CHECK p;
    std::size_t cursor = 0;
    return p;
}

nlohmann::ordered_json CHECK::to_json_object() const {
    nlohmann::ordered_json j;
    return j;
}

void CHECK::from_json_object(const nlohmann::ordered_json& j) {
}

std::vector<std::string> CI::json_order() const {
    return {"batch_index", "entries"};
}

std::map<std::string, std::string> CI::json_consts() const {
    return {};
}

std::vector<std::string> CI::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(batch_index));
    for (const auto& v : entries) args.push_back(v.wire_fields());
    return args;
}

CI CI::parse(const std::vector<std::string>& body) {
    CI p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.batch_index = parse_wire_int(body[cursor], "batch_index");
    cursor++;
    for (std::size_t i = cursor; i < body.size(); ++i) p.entries.push_back(CIEntriesItem::parse_item(body[i]));
    cursor = body.size();
    return p;
}

nlohmann::ordered_json CI::to_json_object() const {
    nlohmann::ordered_json j;
    j["batch_index"] = batch_index;
    {
        nlohmann::ordered_json a = nlohmann::ordered_json::array();
        for (const auto& v : entries) a.push_back(v.to_json_object());
        j["entries"] = a;
    }
    return j;
}

void CI::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("batch_index")) batch_index = j["batch_index"].get<int>();
    if (j.contains("entries")) { entries.clear(); for (const auto& v : j["entries"]) entries.push_back(CIEntriesItem::from_json_object(v)); }
}

std::vector<std::string> CTToClient::json_order() const {
    return {"name", "message", "is_from_server"};
}

std::map<std::string, std::string> CTToClient::json_consts() const {
    return {};
}

std::vector<std::string> CTToClient::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(name));
    args.push_back(escape_fanta(message));
    args.push_back(bool_to_wire(is_from_server));
    return args;
}

CTToClient CTToClient::parse(const std::vector<std::string>& body) {
    CTToClient p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.name = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.message = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.is_from_server = parse_wire_bool(body[cursor], "is_from_server");
    cursor++;
    return p;
}

nlohmann::ordered_json CTToClient::to_json_object() const {
    nlohmann::ordered_json j;
    j["name"] = name;
    j["message"] = message;
    j["is_from_server"] = is_from_server;
    return j;
}

void CTToClient::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("name")) name = j["name"].get<std::string>();
    if (j.contains("message")) message = j["message"].get<std::string>();
    if (j.contains("is_from_server")) is_from_server = j["is_from_server"].get<bool>();
}

std::vector<std::string> CTToServer::json_order() const {
    return {"name", "message"};
}

std::map<std::string, std::string> CTToServer::json_consts() const {
    return {};
}

std::vector<std::string> CTToServer::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(name));
    args.push_back(escape_fanta(message));
    return args;
}

CTToServer CTToServer::parse(const std::vector<std::string>& body) {
    CTToServer p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.name = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.message = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json CTToServer::to_json_object() const {
    nlohmann::ordered_json j;
    j["name"] = name;
    j["message"] = message;
    return j;
}

void CTToServer::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("name")) name = j["name"].get<std::string>();
    if (j.contains("message")) message = j["message"].get<std::string>();
}

std::vector<std::string> CharsCheck::json_order() const {
    return {"taken"};
}

std::map<std::string, std::string> CharsCheck::json_consts() const {
    return {};
}

std::vector<std::string> CharsCheck::args() const {
    std::vector<std::string> args;
    for (const auto& v : taken) args.push_back(std::to_string(char_availability_to_wire(v)));
    return args;
}

CharsCheck CharsCheck::parse(const std::vector<std::string>& body) {
    CharsCheck p;
    std::size_t cursor = 0;
    for (std::size_t i = cursor; i < body.size(); ++i) p.taken.push_back(char_availability_from_wire(parse_wire_int(body[i], "taken[i]")));
    cursor = body.size();
    return p;
}

nlohmann::ordered_json CharsCheck::to_json_object() const {
    nlohmann::ordered_json j;
    {
        nlohmann::ordered_json a = nlohmann::ordered_json::array();
        for (const auto& v : taken) a.push_back(char_availability_to_string(v));
        j["taken"] = a;
    }
    return j;
}

void CharsCheck::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("taken")) { taken.clear(); for (const auto& v : j["taken"]) taken.push_back(char_availability_from_string(v.get<std::string>())); }
}

std::vector<std::string> DE::json_order() const {
    return {"id"};
}

std::map<std::string, std::string> DE::json_consts() const {
    return {};
}

std::vector<std::string> DE::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(id));
    return args;
}

DE DE::parse(const std::vector<std::string>& body) {
    DE p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.id = parse_wire_int(body[cursor], "id");
    cursor++;
    return p;
}

nlohmann::ordered_json DE::to_json_object() const {
    nlohmann::ordered_json j;
    j["id"] = id;
    return j;
}

void DE::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("id")) id = j["id"].get<int>();
}

std::vector<std::string> DONE::json_order() const {
    return {};
}

std::map<std::string, std::string> DONE::json_consts() const {
    return {};
}

std::vector<std::string> DONE::args() const {
    std::vector<std::string> args;
    return args;
}

DONE DONE::parse(const std::vector<std::string>& body) {
    DONE p;
    std::size_t cursor = 0;
    return p;
}

nlohmann::ordered_json DONE::to_json_object() const {
    nlohmann::ordered_json j;
    return j;
}

void DONE::from_json_object(const nlohmann::ordered_json& j) {
}

std::vector<std::string> EE::json_order() const {
    return {"id", "name", "description", "image"};
}

std::map<std::string, std::string> EE::json_consts() const {
    return {};
}

std::vector<std::string> EE::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(id));
    args.push_back(escape_fanta(name));
    args.push_back(escape_fanta(description));
    args.push_back(escape_fanta(image));
    return args;
}

EE EE::parse(const std::vector<std::string>& body) {
    EE p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.id = parse_wire_int(body[cursor], "id");
    cursor++;
    if (cursor < body.size()) p.name = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.description = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.image = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json EE::to_json_object() const {
    nlohmann::ordered_json j;
    j["id"] = id;
    j["name"] = name;
    j["description"] = description;
    j["image"] = image;
    return j;
}

void EE::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("id")) id = j["id"].get<int>();
    if (j.contains("name")) name = j["name"].get<std::string>();
    if (j.contains("description")) description = j["description"].get<std::string>();
    if (j.contains("image")) image = j["image"].get<std::string>();
}

std::vector<std::string> EI::json_order() const {
    return {"id", "details"};
}

std::map<std::string, std::string> EI::json_consts() const {
    return {};
}

std::vector<std::string> EI::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(id));
    args.push_back(details.wire_fields());
    return args;
}

EI EI::parse(const std::vector<std::string>& body) {
    EI p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.id = parse_wire_int(body[cursor], "id");
    cursor++;
    if (cursor < body.size()) p.details = EIDetails::parse_item(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json EI::to_json_object() const {
    nlohmann::ordered_json j;
    j["id"] = id;
    j["details"] = details.to_json_object();
    return j;
}

void EI::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("id")) id = j["id"].get<int>();
    if (j.contains("details")) details = EIDetails::from_json_object(j["details"]);
}

std::vector<std::string> EM::json_order() const {
    return {"batch_index", "entries"};
}

std::map<std::string, std::string> EM::json_consts() const {
    return {};
}

std::vector<std::string> EM::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(batch_index));
    for (const auto& v : entries) args.push_back(v.wire_fields());
    return args;
}

EM EM::parse(const std::vector<std::string>& body) {
    EM p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.batch_index = parse_wire_int(body[cursor], "batch_index");
    cursor++;
    for (std::size_t i = cursor; i < body.size(); ++i) p.entries.push_back(EMEntriesItem::parse_item(body[i]));
    cursor = body.size();
    return p;
}

nlohmann::ordered_json EM::to_json_object() const {
    nlohmann::ordered_json j;
    j["batch_index"] = batch_index;
    {
        nlohmann::ordered_json a = nlohmann::ordered_json::array();
        for (const auto& v : entries) a.push_back(v.to_json_object());
        j["entries"] = a;
    }
    return j;
}

void EM::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("batch_index")) batch_index = j["batch_index"].get<int>();
    if (j.contains("entries")) { entries.clear(); for (const auto& v : j["entries"]) entries.push_back(EMEntriesItem::from_json_object(v)); }
}

std::vector<std::string> FA::json_order() const {
    return {"areas"};
}

std::map<std::string, std::string> FA::json_consts() const {
    return {};
}

std::vector<std::string> FA::args() const {
    std::vector<std::string> args;
    for (const auto& v : areas) args.push_back(escape_fanta(v));
    return args;
}

FA FA::parse(const std::vector<std::string>& body) {
    FA p;
    std::size_t cursor = 0;
    for (std::size_t i = cursor; i < body.size(); ++i) p.areas.push_back(unescape_fanta(body[i]));
    cursor = body.size();
    return p;
}

nlohmann::ordered_json FA::to_json_object() const {
    nlohmann::ordered_json j;
    {
        nlohmann::ordered_json a = nlohmann::ordered_json::array();
        for (const auto& v : areas) a.push_back(v);
        j["areas"] = a;
    }
    return j;
}

void FA::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("areas")) areas = j["areas"].get<std::vector<std::string>>();
}

std::vector<std::string> FL::json_order() const {
    return {"features"};
}

std::map<std::string, std::string> FL::json_consts() const {
    return {};
}

std::vector<std::string> FL::args() const {
    std::vector<std::string> args;
    for (const auto& v : features) args.push_back(escape_fanta(v));
    return args;
}

FL FL::parse(const std::vector<std::string>& body) {
    FL p;
    std::size_t cursor = 0;
    for (std::size_t i = cursor; i < body.size(); ++i) p.features.push_back(unescape_fanta(body[i]));
    cursor = body.size();
    return p;
}

nlohmann::ordered_json FL::to_json_object() const {
    nlohmann::ordered_json j;
    {
        nlohmann::ordered_json a = nlohmann::ordered_json::array();
        for (const auto& v : features) a.push_back(v);
        j["features"] = a;
    }
    return j;
}

void FL::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("features")) features = j["features"].get<std::vector<std::string>>();
}

std::vector<std::string> FM::json_order() const {
    return {"music_list"};
}

std::map<std::string, std::string> FM::json_consts() const {
    return {};
}

std::vector<std::string> FM::args() const {
    std::vector<std::string> args;
    for (const auto& v : music_list) args.push_back(v.wire_fields());
    return args;
}

FM FM::parse(const std::vector<std::string>& body) {
    FM p;
    std::size_t cursor = 0;
    for (std::size_t i = cursor; i < body.size(); ++i) p.music_list.push_back(FMMusicListItem::parse_item(body[i]));
    cursor = body.size();
    return p;
}

nlohmann::ordered_json FM::to_json_object() const {
    nlohmann::ordered_json j;
    {
        nlohmann::ordered_json a = nlohmann::ordered_json::array();
        for (const auto& v : music_list) a.push_back(v.to_json_object());
        j["music_list"] = a;
    }
    return j;
}

void FM::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("music_list")) { music_list.clear(); for (const auto& v : j["music_list"]) music_list.push_back(FMMusicListItem::from_json_object(v)); }
}

std::vector<std::string> HI::json_order() const {
    return {"hdid"};
}

std::map<std::string, std::string> HI::json_consts() const {
    return {};
}

std::vector<std::string> HI::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(hdid));
    return args;
}

HI HI::parse(const std::vector<std::string>& body) {
    HI p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.hdid = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json HI::to_json_object() const {
    nlohmann::ordered_json j;
    j["hdid"] = hdid;
    return j;
}

void HI::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("hdid")) hdid = j["hdid"].get<std::string>();
}

std::vector<std::string> HPToClient::json_order() const {
    return {"bar", "value"};
}

std::map<std::string, std::string> HPToClient::json_consts() const {
    return {};
}

std::vector<std::string> HPToClient::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(penalty_bar_to_wire(bar)));
    args.push_back(std::to_string(value));
    return args;
}

HPToClient HPToClient::parse(const std::vector<std::string>& body) {
    HPToClient p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.bar = penalty_bar_from_wire(parse_wire_int(body[cursor], "bar"));
    cursor++;
    if (cursor < body.size()) p.value = parse_wire_int(body[cursor], "value");
    cursor++;
    return p;
}

nlohmann::ordered_json HPToClient::to_json_object() const {
    nlohmann::ordered_json j;
    j["bar"] = penalty_bar_to_string(bar);
    j["value"] = value;
    return j;
}

void HPToClient::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("bar")) bar = penalty_bar_from_string(j["bar"].get<std::string>());
    if (j.contains("value")) value = j["value"].get<int>();
}

std::vector<std::string> HPToServer::json_order() const {
    return {"bar", "value"};
}

std::map<std::string, std::string> HPToServer::json_consts() const {
    return {};
}

std::vector<std::string> HPToServer::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(penalty_bar_to_wire(bar)));
    args.push_back(std::to_string(value));
    return args;
}

HPToServer HPToServer::parse(const std::vector<std::string>& body) {
    HPToServer p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.bar = penalty_bar_from_wire(parse_wire_int(body[cursor], "bar"));
    cursor++;
    if (cursor < body.size()) p.value = parse_wire_int(body[cursor], "value");
    cursor++;
    return p;
}

nlohmann::ordered_json HPToServer::to_json_object() const {
    nlohmann::ordered_json j;
    j["bar"] = penalty_bar_to_string(bar);
    j["value"] = value;
    return j;
}

void HPToServer::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("bar")) bar = penalty_bar_from_string(j["bar"].get<std::string>());
    if (j.contains("value")) value = j["value"].get<int>();
}

std::vector<std::string> IDToClient::json_order() const {
    return {"player_id", "software", "version"};
}

std::map<std::string, std::string> IDToClient::json_consts() const {
    return {};
}

std::vector<std::string> IDToClient::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(player_id));
    args.push_back(escape_fanta(software));
    args.push_back(escape_fanta(version));
    return args;
}

IDToClient IDToClient::parse(const std::vector<std::string>& body) {
    IDToClient p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.player_id = parse_wire_int(body[cursor], "player_id");
    cursor++;
    if (cursor < body.size()) p.software = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.version = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json IDToClient::to_json_object() const {
    nlohmann::ordered_json j;
    j["player_id"] = player_id;
    j["software"] = software;
    j["version"] = version;
    return j;
}

void IDToClient::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("player_id")) player_id = j["player_id"].get<int>();
    if (j.contains("software")) software = j["software"].get<std::string>();
    if (j.contains("version")) version = j["version"].get<std::string>();
}

std::vector<std::string> IDToServer::json_order() const {
    return {"software", "version"};
}

std::map<std::string, std::string> IDToServer::json_consts() const {
    return {};
}

std::vector<std::string> IDToServer::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(software));
    args.push_back(escape_fanta(version));
    return args;
}

IDToServer IDToServer::parse(const std::vector<std::string>& body) {
    IDToServer p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.software = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.version = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json IDToServer::to_json_object() const {
    nlohmann::ordered_json j;
    j["software"] = software;
    j["version"] = version;
    return j;
}

void IDToServer::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("software")) software = j["software"].get<std::string>();
    if (j.contains("version")) version = j["version"].get<std::string>();
}

std::vector<std::string> JD::json_order() const {
    return {"state"};
}

std::map<std::string, std::string> JD::json_consts() const {
    return {};
}

std::vector<std::string> JD::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(judge_state_to_wire(state)));
    return args;
}

JD JD::parse(const std::vector<std::string>& body) {
    JD p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.state = judge_state_from_wire(parse_wire_int(body[cursor], "state"));
    cursor++;
    return p;
}

nlohmann::ordered_json JD::to_json_object() const {
    nlohmann::ordered_json j;
    j["state"] = judge_state_to_string(state);
    return j;
}

void JD::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("state")) state = judge_state_from_string(j["state"].get<std::string>());
}

std::vector<std::string> KB::json_order() const {
    return {"reason"};
}

std::map<std::string, std::string> KB::json_consts() const {
    return {};
}

std::vector<std::string> KB::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(reason));
    return args;
}

KB KB::parse(const std::vector<std::string>& body) {
    KB p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.reason = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json KB::to_json_object() const {
    nlohmann::ordered_json j;
    j["reason"] = reason;
    return j;
}

void KB::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("reason")) reason = j["reason"].get<std::string>();
}

std::vector<std::string> KK::json_order() const {
    return {"reason"};
}

std::map<std::string, std::string> KK::json_consts() const {
    return {};
}

std::vector<std::string> KK::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(reason));
    return args;
}

KK KK::parse(const std::vector<std::string>& body) {
    KK p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.reason = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json KK::to_json_object() const {
    nlohmann::ordered_json j;
    j["reason"] = reason;
    return j;
}

void KK::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("reason")) reason = j["reason"].get<std::string>();
}

std::vector<std::string> LE::json_order() const {
    return {"evidence"};
}

std::map<std::string, std::string> LE::json_consts() const {
    return {};
}

std::vector<std::string> LE::args() const {
    std::vector<std::string> args;
    for (const auto& v : evidence) args.push_back(v.wire_fields());
    return args;
}

LE LE::parse(const std::vector<std::string>& body) {
    LE p;
    std::size_t cursor = 0;
    for (std::size_t i = cursor; i < body.size(); ++i) p.evidence.push_back(LEEvidenceItem::parse_item(body[i]));
    cursor = body.size();
    return p;
}

nlohmann::ordered_json LE::to_json_object() const {
    nlohmann::ordered_json j;
    {
        nlohmann::ordered_json a = nlohmann::ordered_json::array();
        for (const auto& v : evidence) a.push_back(v.to_json_object());
        j["evidence"] = a;
    }
    return j;
}

void LE::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("evidence")) { evidence.clear(); for (const auto& v : j["evidence"]) evidence.push_back(LEEvidenceItem::from_json_object(v)); }
}

std::vector<std::string> MA::json_order() const {
    return {"player_id", "duration_minutes", "reason"};
}

std::map<std::string, std::string> MA::json_consts() const {
    return {};
}

std::vector<std::string> MA::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(player_id));
    args.push_back(std::to_string(duration_minutes));
    args.push_back(escape_fanta(reason));
    return args;
}

MA MA::parse(const std::vector<std::string>& body) {
    MA p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.player_id = parse_wire_int(body[cursor], "player_id");
    cursor++;
    if (cursor < body.size()) p.duration_minutes = parse_wire_int(body[cursor], "duration_minutes");
    cursor++;
    if (cursor < body.size()) p.reason = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json MA::to_json_object() const {
    nlohmann::ordered_json j;
    j["player_id"] = player_id;
    j["duration_minutes"] = duration_minutes;
    j["reason"] = reason;
    return j;
}

void MA::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("player_id")) player_id = j["player_id"].get<int>();
    if (j.contains("duration_minutes")) duration_minutes = j["duration_minutes"].get<int>();
    if (j.contains("reason")) reason = j["reason"].get<std::string>();
}

std::vector<std::string> MCToClient::json_order() const {
    return {"name", "char_id", "showname", "looping", "channel", "effects"};
}

std::map<std::string, std::string> MCToClient::json_consts() const {
    return {};
}

std::vector<std::string> MCToClient::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(name));
    args.push_back(std::to_string(char_id));
    args.push_back(escape_fanta(showname));
    args.push_back(bool_to_wire(looping));
    args.push_back(std::to_string(music_channel_to_wire(channel)));
    args.push_back(music_effects_to_wire(effects));
    return args;
}

MCToClient MCToClient::parse(const std::vector<std::string>& body) {
    MCToClient p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.name = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.char_id = parse_wire_int(body[cursor], "char_id");
    cursor++;
    if (cursor < body.size()) p.showname = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.looping = parse_wire_bool(body[cursor], "looping");
    cursor++;
    if (cursor < body.size()) p.channel = music_channel_from_wire(parse_wire_int(body[cursor], "channel"));
    cursor++;
    if (cursor < body.size() && !body[cursor].empty()) p.effects = music_effects_from_wire(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json MCToClient::to_json_object() const {
    nlohmann::ordered_json j;
    j["name"] = name;
    j["char_id"] = char_id;
    j["showname"] = showname;
    j["looping"] = looping;
    j["channel"] = music_channel_to_string(channel);
    j["effects"] = effects.to_json_object();
    return j;
}

void MCToClient::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("name")) name = j["name"].get<std::string>();
    if (j.contains("char_id")) char_id = j["char_id"].get<int>();
    if (j.contains("showname")) showname = j["showname"].get<std::string>();
    if (j.contains("looping")) looping = j["looping"].get<bool>();
    if (j.contains("channel")) channel = music_channel_from_string(j["channel"].get<std::string>());
    if (j.contains("effects")) effects = MusicEffects::from_json_object(j["effects"]);
}

std::vector<std::string> MCToServer::json_order() const {
    return {"name", "char_id", "showname", "effects"};
}

std::map<std::string, std::string> MCToServer::json_consts() const {
    return {};
}

std::vector<std::string> MCToServer::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(name));
    args.push_back(std::to_string(char_id));
    args.push_back(escape_fanta(showname));
    args.push_back(music_effects_to_wire(effects));
    return args;
}

MCToServer MCToServer::parse(const std::vector<std::string>& body) {
    MCToServer p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.name = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.char_id = parse_wire_int(body[cursor], "char_id");
    cursor++;
    if (cursor < body.size()) p.showname = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size() && !body[cursor].empty()) p.effects = music_effects_from_wire(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json MCToServer::to_json_object() const {
    nlohmann::ordered_json j;
    j["name"] = name;
    j["char_id"] = char_id;
    j["showname"] = showname;
    j["effects"] = effects.to_json_object();
    return j;
}

void MCToServer::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("name")) name = j["name"].get<std::string>();
    if (j.contains("char_id")) char_id = j["char_id"].get<int>();
    if (j.contains("showname")) showname = j["showname"].get<std::string>();
    if (j.contains("effects")) effects = MusicEffects::from_json_object(j["effects"]);
}

std::vector<std::string> MSToClient::json_order() const {
    return {"desk_modifier", "preanim", "character", "emote", "message", "side", "sfx_name", "emote_modifier", "char_id", "sfx_delay", "shout_modifier", "evidence_id", "flip", "realization", "text_color", "showname", "paired_charid", "paired_order", "paired_name", "paired_emote", "offset", "paired_offset", "paired_flip", "noninterrupting_preanim", "sfx_looping", "screenshake", "frames_shake", "frames_realization", "frames_sfx", "additive", "effect"};
}

std::map<std::string, std::string> MSToClient::json_consts() const {
    return {};
}

std::vector<std::string> MSToClient::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(desk_modifier_to_wire(desk_modifier)));
    args.push_back(escape_fanta(preanim));
    args.push_back(escape_fanta(character));
    args.push_back(escape_fanta(emote));
    args.push_back(escape_fanta(message));
    args.push_back(side_to_string(side));
    args.push_back(escape_fanta(sfx_name));
    args.push_back(std::to_string(emote_modifier_to_wire(emote_modifier)));
    args.push_back(std::to_string(char_id));
    args.push_back(std::to_string(sfx_delay));
    args.push_back(std::to_string(shout_modifier_to_wire(shout_modifier)));
    args.push_back(std::to_string(evidence_id));
    args.push_back(std::to_string(flip_to_wire(flip)));
    args.push_back(bool_to_wire(realization));
    args.push_back(std::to_string(text_color_to_wire(text_color)));
    args.push_back(escape_fanta(showname));
    auto tok = std::to_string(paired_charid);
    if (paired_charid != -1 && paired_order != 0) tok += "^" + std::to_string(paired_order);
    args.push_back(tok);
    args.push_back(escape_fanta(paired_name));
    args.push_back(escape_fanta(paired_emote));
    args.push_back(offset_to_wire(offset));
    args.push_back(offset_to_wire(paired_offset));
    args.push_back(std::to_string(flip_to_wire(paired_flip)));
    args.push_back(bool_to_wire(noninterrupting_preanim));
    args.push_back(bool_to_wire(sfx_looping));
    args.push_back(bool_to_wire(screenshake));
    args.push_back(escape_fanta(frames_shake));
    args.push_back(escape_fanta(frames_realization));
    args.push_back(escape_fanta(frames_sfx));
    args.push_back(bool_to_wire(additive));
    args.push_back(effect_to_wire(effect));
    return args;
}

MSToClient MSToClient::parse(const std::vector<std::string>& body) {
    MSToClient p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.desk_modifier = desk_modifier_from_wire(parse_wire_int(body[cursor], "desk_modifier"));
    cursor++;
    if (cursor < body.size()) p.preanim = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.character = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.emote = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.message = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.side = side_from_string(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.sfx_name = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.emote_modifier = emote_modifier_from_wire(parse_wire_int(body[cursor], "emote_modifier"));
    cursor++;
    if (cursor < body.size()) p.char_id = parse_wire_int(body[cursor], "char_id");
    cursor++;
    if (cursor < body.size()) p.sfx_delay = parse_wire_int(body[cursor], "sfx_delay");
    cursor++;
    if (cursor < body.size()) p.shout_modifier = shout_modifier_from_wire(parse_wire_int(body[cursor], "shout_modifier"));
    cursor++;
    if (cursor < body.size()) p.evidence_id = parse_wire_int(body[cursor], "evidence_id");
    cursor++;
    if (cursor < body.size()) p.flip = flip_from_wire(parse_wire_int(body[cursor], "flip"));
    cursor++;
    if (cursor < body.size()) p.realization = parse_wire_bool(body[cursor], "realization");
    cursor++;
    if (cursor < body.size()) p.text_color = text_color_from_wire(parse_wire_int(body[cursor], "text_color"));
    cursor++;
    if (cursor < body.size()) p.showname = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) {
        auto parts = split_caret(body[cursor]);
        p.paired_charid = parse_wire_int(parts.first, "paired_charid");
        if (parts.second.empty()) { p.paired_order = 0; } else { p.paired_order = parse_wire_int(parts.second, "paired_order"); }
    }
    cursor++;
    if (cursor < body.size()) p.paired_name = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.paired_emote = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size() && !body[cursor].empty()) p.offset = offset_from_wire(body[cursor]);
    cursor++;
    if (cursor < body.size() && !body[cursor].empty()) p.paired_offset = offset_from_wire(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.paired_flip = flip_from_wire(parse_wire_int(body[cursor], "paired_flip"));
    cursor++;
    if (cursor < body.size()) p.noninterrupting_preanim = parse_wire_bool(body[cursor], "noninterrupting_preanim");
    cursor++;
    if (cursor < body.size()) p.sfx_looping = parse_wire_bool(body[cursor], "sfx_looping");
    cursor++;
    if (cursor < body.size()) p.screenshake = parse_wire_bool(body[cursor], "screenshake");
    cursor++;
    if (cursor < body.size()) p.frames_shake = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.frames_realization = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.frames_sfx = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.additive = parse_wire_bool(body[cursor], "additive");
    cursor++;
    if (cursor < body.size() && !body[cursor].empty()) p.effect = effect_from_wire(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json MSToClient::to_json_object() const {
    nlohmann::ordered_json j;
    j["desk_modifier"] = desk_modifier_to_string(desk_modifier);
    j["preanim"] = preanim;
    j["character"] = character;
    j["emote"] = emote;
    j["message"] = message;
    j["side"] = side_to_string(side);
    j["sfx_name"] = sfx_name;
    j["emote_modifier"] = emote_modifier_to_string(emote_modifier);
    j["char_id"] = char_id;
    j["sfx_delay"] = sfx_delay;
    j["shout_modifier"] = shout_modifier_to_string(shout_modifier);
    j["evidence_id"] = evidence_id;
    j["flip"] = flip_to_string(flip);
    j["realization"] = realization;
    j["text_color"] = text_color_to_string(text_color);
    j["showname"] = showname;
    j["paired_charid"] = paired_charid;
    j["paired_order"] = paired_order;
    j["paired_name"] = paired_name;
    j["paired_emote"] = paired_emote;
    j["offset"] = offset.to_json_object();
    j["paired_offset"] = paired_offset.to_json_object();
    j["paired_flip"] = flip_to_string(paired_flip);
    j["noninterrupting_preanim"] = noninterrupting_preanim;
    j["sfx_looping"] = sfx_looping;
    j["screenshake"] = screenshake;
    j["frames_shake"] = frames_shake;
    j["frames_realization"] = frames_realization;
    j["frames_sfx"] = frames_sfx;
    j["additive"] = additive;
    j["effect"] = effect.to_json_object();
    return j;
}

void MSToClient::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("desk_modifier")) desk_modifier = desk_modifier_from_string(j["desk_modifier"].get<std::string>());
    if (j.contains("preanim")) preanim = j["preanim"].get<std::string>();
    if (j.contains("character")) character = j["character"].get<std::string>();
    if (j.contains("emote")) emote = j["emote"].get<std::string>();
    if (j.contains("message")) message = j["message"].get<std::string>();
    if (j.contains("side")) side = side_from_string(j["side"].get<std::string>());
    if (j.contains("sfx_name")) sfx_name = j["sfx_name"].get<std::string>();
    if (j.contains("emote_modifier")) emote_modifier = emote_modifier_from_string(j["emote_modifier"].get<std::string>());
    if (j.contains("char_id")) char_id = j["char_id"].get<int>();
    if (j.contains("sfx_delay")) sfx_delay = j["sfx_delay"].get<int>();
    if (j.contains("shout_modifier")) shout_modifier = shout_modifier_from_string(j["shout_modifier"].get<std::string>());
    if (j.contains("evidence_id")) evidence_id = j["evidence_id"].get<int>();
    if (j.contains("flip")) flip = flip_from_string(j["flip"].get<std::string>());
    if (j.contains("realization")) realization = j["realization"].get<bool>();
    if (j.contains("text_color")) text_color = text_color_from_string(j["text_color"].get<std::string>());
    if (j.contains("showname")) showname = j["showname"].get<std::string>();
    if (j.contains("paired_charid")) paired_charid = j["paired_charid"].get<int>();
    if (j.contains("paired_order")) paired_order = j["paired_order"].get<int>();
    if (j.contains("paired_name")) paired_name = j["paired_name"].get<std::string>();
    if (j.contains("paired_emote")) paired_emote = j["paired_emote"].get<std::string>();
    if (j.contains("offset")) offset = Offset::from_json_object(j["offset"]);
    if (j.contains("paired_offset")) paired_offset = Offset::from_json_object(j["paired_offset"]);
    if (j.contains("paired_flip")) paired_flip = flip_from_string(j["paired_flip"].get<std::string>());
    if (j.contains("noninterrupting_preanim")) noninterrupting_preanim = j["noninterrupting_preanim"].get<bool>();
    if (j.contains("sfx_looping")) sfx_looping = j["sfx_looping"].get<bool>();
    if (j.contains("screenshake")) screenshake = j["screenshake"].get<bool>();
    if (j.contains("frames_shake")) frames_shake = j["frames_shake"].get<std::string>();
    if (j.contains("frames_realization")) frames_realization = j["frames_realization"].get<std::string>();
    if (j.contains("frames_sfx")) frames_sfx = j["frames_sfx"].get<std::string>();
    if (j.contains("additive")) additive = j["additive"].get<bool>();
    if (j.contains("effect")) effect = Effect::from_json_object(j["effect"]);
}

std::vector<std::string> MSToServer::json_order() const {
    return {"desk_modifier", "preanim", "character", "emote", "message", "side", "sfx_name", "emote_modifier", "char_id", "sfx_delay", "shout_modifier", "evidence_id", "flip", "realization", "text_color", "showname", "paired_charid", "paired_order", "offset", "noninterrupting_preanim", "sfx_looping", "screenshake", "frames_shake", "frames_realization", "frames_sfx", "additive", "effect"};
}

std::map<std::string, std::string> MSToServer::json_consts() const {
    return {};
}

std::vector<std::string> MSToServer::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(desk_modifier_to_wire(desk_modifier)));
    args.push_back(escape_fanta(preanim));
    args.push_back(escape_fanta(character));
    args.push_back(escape_fanta(emote));
    args.push_back(escape_fanta(message));
    args.push_back(side_to_string(side));
    args.push_back(escape_fanta(sfx_name));
    args.push_back(std::to_string(emote_modifier_to_wire(emote_modifier)));
    args.push_back(std::to_string(char_id));
    args.push_back(std::to_string(sfx_delay));
    args.push_back(std::to_string(shout_modifier_to_wire(shout_modifier)));
    args.push_back(std::to_string(evidence_id));
    args.push_back(std::to_string(flip_to_wire(flip)));
    args.push_back(bool_to_wire(realization));
    args.push_back(std::to_string(text_color_to_wire(text_color)));
    args.push_back(escape_fanta(showname));
    auto tok = std::to_string(paired_charid);
    if (paired_charid != -1 && paired_order != 0) tok += "^" + std::to_string(paired_order);
    args.push_back(tok);
    args.push_back(offset_to_wire(offset));
    args.push_back(bool_to_wire(noninterrupting_preanim));
    args.push_back(bool_to_wire(sfx_looping));
    args.push_back(bool_to_wire(screenshake));
    args.push_back(escape_fanta(frames_shake));
    args.push_back(escape_fanta(frames_realization));
    args.push_back(escape_fanta(frames_sfx));
    args.push_back(bool_to_wire(additive));
    args.push_back(effect_to_wire(effect));
    return args;
}

MSToServer MSToServer::parse(const std::vector<std::string>& body) {
    MSToServer p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.desk_modifier = desk_modifier_from_wire(parse_wire_int(body[cursor], "desk_modifier"));
    cursor++;
    if (cursor < body.size()) p.preanim = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.character = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.emote = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.message = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.side = side_from_string(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.sfx_name = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.emote_modifier = emote_modifier_from_wire(parse_wire_int(body[cursor], "emote_modifier"));
    cursor++;
    if (cursor < body.size()) p.char_id = parse_wire_int(body[cursor], "char_id");
    cursor++;
    if (cursor < body.size()) p.sfx_delay = parse_wire_int(body[cursor], "sfx_delay");
    cursor++;
    if (cursor < body.size()) p.shout_modifier = shout_modifier_from_wire(parse_wire_int(body[cursor], "shout_modifier"));
    cursor++;
    if (cursor < body.size()) p.evidence_id = parse_wire_int(body[cursor], "evidence_id");
    cursor++;
    if (cursor < body.size()) p.flip = flip_from_wire(parse_wire_int(body[cursor], "flip"));
    cursor++;
    if (cursor < body.size()) p.realization = parse_wire_bool(body[cursor], "realization");
    cursor++;
    if (cursor < body.size()) p.text_color = text_color_from_wire(parse_wire_int(body[cursor], "text_color"));
    cursor++;
    if (cursor < body.size()) p.showname = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) {
        auto parts = split_caret(body[cursor]);
        p.paired_charid = parse_wire_int(parts.first, "paired_charid");
        if (parts.second.empty()) { p.paired_order = 0; } else { p.paired_order = parse_wire_int(parts.second, "paired_order"); }
    }
    cursor++;
    if (cursor < body.size() && !body[cursor].empty()) p.offset = offset_from_wire(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.noninterrupting_preanim = parse_wire_bool(body[cursor], "noninterrupting_preanim");
    cursor++;
    if (cursor < body.size()) p.sfx_looping = parse_wire_bool(body[cursor], "sfx_looping");
    cursor++;
    if (cursor < body.size()) p.screenshake = parse_wire_bool(body[cursor], "screenshake");
    cursor++;
    if (cursor < body.size()) p.frames_shake = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.frames_realization = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.frames_sfx = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.additive = parse_wire_bool(body[cursor], "additive");
    cursor++;
    if (cursor < body.size() && !body[cursor].empty()) p.effect = effect_from_wire(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json MSToServer::to_json_object() const {
    nlohmann::ordered_json j;
    j["desk_modifier"] = desk_modifier_to_string(desk_modifier);
    j["preanim"] = preanim;
    j["character"] = character;
    j["emote"] = emote;
    j["message"] = message;
    j["side"] = side_to_string(side);
    j["sfx_name"] = sfx_name;
    j["emote_modifier"] = emote_modifier_to_string(emote_modifier);
    j["char_id"] = char_id;
    j["sfx_delay"] = sfx_delay;
    j["shout_modifier"] = shout_modifier_to_string(shout_modifier);
    j["evidence_id"] = evidence_id;
    j["flip"] = flip_to_string(flip);
    j["realization"] = realization;
    j["text_color"] = text_color_to_string(text_color);
    j["showname"] = showname;
    j["paired_charid"] = paired_charid;
    j["paired_order"] = paired_order;
    j["offset"] = offset.to_json_object();
    j["noninterrupting_preanim"] = noninterrupting_preanim;
    j["sfx_looping"] = sfx_looping;
    j["screenshake"] = screenshake;
    j["frames_shake"] = frames_shake;
    j["frames_realization"] = frames_realization;
    j["frames_sfx"] = frames_sfx;
    j["additive"] = additive;
    j["effect"] = effect.to_json_object();
    return j;
}

void MSToServer::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("desk_modifier")) desk_modifier = desk_modifier_from_string(j["desk_modifier"].get<std::string>());
    if (j.contains("preanim")) preanim = j["preanim"].get<std::string>();
    if (j.contains("character")) character = j["character"].get<std::string>();
    if (j.contains("emote")) emote = j["emote"].get<std::string>();
    if (j.contains("message")) message = j["message"].get<std::string>();
    if (j.contains("side")) side = side_from_string(j["side"].get<std::string>());
    if (j.contains("sfx_name")) sfx_name = j["sfx_name"].get<std::string>();
    if (j.contains("emote_modifier")) emote_modifier = emote_modifier_from_string(j["emote_modifier"].get<std::string>());
    if (j.contains("char_id")) char_id = j["char_id"].get<int>();
    if (j.contains("sfx_delay")) sfx_delay = j["sfx_delay"].get<int>();
    if (j.contains("shout_modifier")) shout_modifier = shout_modifier_from_string(j["shout_modifier"].get<std::string>());
    if (j.contains("evidence_id")) evidence_id = j["evidence_id"].get<int>();
    if (j.contains("flip")) flip = flip_from_string(j["flip"].get<std::string>());
    if (j.contains("realization")) realization = j["realization"].get<bool>();
    if (j.contains("text_color")) text_color = text_color_from_string(j["text_color"].get<std::string>());
    if (j.contains("showname")) showname = j["showname"].get<std::string>();
    if (j.contains("paired_charid")) paired_charid = j["paired_charid"].get<int>();
    if (j.contains("paired_order")) paired_order = j["paired_order"].get<int>();
    if (j.contains("offset")) offset = Offset::from_json_object(j["offset"]);
    if (j.contains("noninterrupting_preanim")) noninterrupting_preanim = j["noninterrupting_preanim"].get<bool>();
    if (j.contains("sfx_looping")) sfx_looping = j["sfx_looping"].get<bool>();
    if (j.contains("screenshake")) screenshake = j["screenshake"].get<bool>();
    if (j.contains("frames_shake")) frames_shake = j["frames_shake"].get<std::string>();
    if (j.contains("frames_realization")) frames_realization = j["frames_realization"].get<std::string>();
    if (j.contains("frames_sfx")) frames_sfx = j["frames_sfx"].get<std::string>();
    if (j.contains("additive")) additive = j["additive"].get<bool>();
    if (j.contains("effect")) effect = Effect::from_json_object(j["effect"]);
}

std::vector<std::string> PE::json_order() const {
    return {"name", "description", "image"};
}

std::map<std::string, std::string> PE::json_consts() const {
    return {};
}

std::vector<std::string> PE::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(name));
    args.push_back(escape_fanta(description));
    args.push_back(escape_fanta(image));
    return args;
}

PE PE::parse(const std::vector<std::string>& body) {
    PE p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.name = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.description = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.image = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json PE::to_json_object() const {
    nlohmann::ordered_json j;
    j["name"] = name;
    j["description"] = description;
    j["image"] = image;
    return j;
}

void PE::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("name")) name = j["name"].get<std::string>();
    if (j.contains("description")) description = j["description"].get<std::string>();
    if (j.contains("image")) image = j["image"].get<std::string>();
}

std::vector<std::string> PN::json_order() const {
    return {"player_count", "max_players", "server_description"};
}

std::map<std::string, std::string> PN::json_consts() const {
    return {};
}

std::vector<std::string> PN::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(player_count));
    args.push_back(std::to_string(max_players));
    args.push_back(escape_fanta(server_description));
    return args;
}

PN PN::parse(const std::vector<std::string>& body) {
    PN p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.player_count = parse_wire_int(body[cursor], "player_count");
    cursor++;
    if (cursor < body.size()) p.max_players = parse_wire_int(body[cursor], "max_players");
    cursor++;
    if (cursor < body.size()) p.server_description = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json PN::to_json_object() const {
    nlohmann::ordered_json j;
    j["player_count"] = player_count;
    j["max_players"] = max_players;
    j["server_description"] = server_description;
    return j;
}

void PN::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("player_count")) player_count = j["player_count"].get<int>();
    if (j.contains("max_players")) max_players = j["max_players"].get<int>();
    if (j.contains("server_description")) server_description = j["server_description"].get<std::string>();
}

std::vector<std::string> PR::json_order() const {
    return {"id", "type"};
}

std::map<std::string, std::string> PR::json_consts() const {
    return {};
}

std::vector<std::string> PR::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(id));
    args.push_back(std::to_string(player_list_update_to_wire(type)));
    return args;
}

PR PR::parse(const std::vector<std::string>& body) {
    PR p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.id = parse_wire_int(body[cursor], "id");
    cursor++;
    if (cursor < body.size()) p.type = player_list_update_from_wire(parse_wire_int(body[cursor], "type"));
    cursor++;
    return p;
}

nlohmann::ordered_json PR::to_json_object() const {
    nlohmann::ordered_json j;
    j["id"] = id;
    j["type"] = player_list_update_to_string(type);
    return j;
}

void PR::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("id")) id = j["id"].get<int>();
    if (j.contains("type")) type = player_list_update_from_string(j["type"].get<std::string>());
}

std::vector<std::string> PU::json_order() const {
    return {"id", "type", "data"};
}

std::map<std::string, std::string> PU::json_consts() const {
    return {};
}

std::vector<std::string> PU::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(id));
    args.push_back(std::to_string(player_data_type_to_wire(type)));
    args.push_back(escape_fanta(data));
    return args;
}

PU PU::parse(const std::vector<std::string>& body) {
    PU p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.id = parse_wire_int(body[cursor], "id");
    cursor++;
    if (cursor < body.size()) p.type = player_data_type_from_wire(parse_wire_int(body[cursor], "type"));
    cursor++;
    if (cursor < body.size()) p.data = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json PU::to_json_object() const {
    nlohmann::ordered_json j;
    j["id"] = id;
    j["type"] = player_data_type_to_string(type);
    j["data"] = data;
    return j;
}

void PU::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("id")) id = j["id"].get<int>();
    if (j.contains("type")) type = player_data_type_from_string(j["type"].get<std::string>());
    if (j.contains("data")) data = j["data"].get<std::string>();
}

std::vector<std::string> PV::json_order() const {
    return {"player_id", "_cid", "char_id"};
}

std::map<std::string, std::string> PV::json_consts() const {
    return {{"_cid", "CID"}};
}

std::vector<std::string> PV::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(player_id));
    args.push_back("CID");
    args.push_back(std::to_string(char_id));
    return args;
}

PV PV::parse(const std::vector<std::string>& body) {
    PV p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.player_id = parse_wire_int(body[cursor], "player_id");
    cursor++;
    cursor++;
    if (cursor < body.size()) p.char_id = parse_wire_int(body[cursor], "char_id");
    cursor++;
    return p;
}

nlohmann::ordered_json PV::to_json_object() const {
    nlohmann::ordered_json j;
    j["player_id"] = player_id;
    j["char_id"] = char_id;
    return j;
}

void PV::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("player_id")) player_id = j["player_id"].get<int>();
    if (j.contains("char_id")) char_id = j["char_id"].get<int>();
}

std::vector<std::string> RC::json_order() const {
    return {};
}

std::map<std::string, std::string> RC::json_consts() const {
    return {};
}

std::vector<std::string> RC::args() const {
    std::vector<std::string> args;
    return args;
}

RC RC::parse(const std::vector<std::string>& body) {
    RC p;
    std::size_t cursor = 0;
    return p;
}

nlohmann::ordered_json RC::to_json_object() const {
    nlohmann::ordered_json j;
    return j;
}

void RC::from_json_object(const nlohmann::ordered_json& j) {
}

std::vector<std::string> RD::json_order() const {
    return {};
}

std::map<std::string, std::string> RD::json_consts() const {
    return {};
}

std::vector<std::string> RD::args() const {
    std::vector<std::string> args;
    return args;
}

RD RD::parse(const std::vector<std::string>& body) {
    RD p;
    std::size_t cursor = 0;
    return p;
}

nlohmann::ordered_json RD::to_json_object() const {
    nlohmann::ordered_json j;
    return j;
}

void RD::from_json_object(const nlohmann::ordered_json& j) {
}

std::vector<std::string> RM::json_order() const {
    return {};
}

std::map<std::string, std::string> RM::json_consts() const {
    return {};
}

std::vector<std::string> RM::args() const {
    std::vector<std::string> args;
    return args;
}

RM RM::parse(const std::vector<std::string>& body) {
    RM p;
    std::size_t cursor = 0;
    return p;
}

nlohmann::ordered_json RM::to_json_object() const {
    nlohmann::ordered_json j;
    return j;
}

void RM::from_json_object(const nlohmann::ordered_json& j) {
}

std::vector<std::string> RMC::json_order() const {
    return {"to_time"};
}

std::map<std::string, std::string> RMC::json_consts() const {
    return {};
}

std::vector<std::string> RMC::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(to_time));
    return args;
}

RMC RMC::parse(const std::vector<std::string>& body) {
    RMC p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.to_time = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json RMC::to_json_object() const {
    nlohmann::ordered_json j;
    j["to_time"] = to_time;
    return j;
}

void RMC::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("to_time")) to_time = j["to_time"].get<std::string>();
}

std::vector<std::string> RTToClient::json_order() const {
    return {"animation", "name"};
}

std::map<std::string, std::string> RTToClient::json_consts() const {
    return {};
}

nlohmann::ordered_json RTToClient::to_json_object() const {
    nlohmann::ordered_json j;
    j["animation"] = r_t_animation_to_string(animation);
    j["name"] = name;
    return j;
}

void RTToClient::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("animation")) animation = r_t_animation_from_string(j["animation"].get<std::string>());
    if (j.contains("name")) name = j["name"].get<std::string>();
}

std::vector<std::string> RTToServer::json_order() const {
    return {"animation", "name"};
}

std::map<std::string, std::string> RTToServer::json_consts() const {
    return {};
}

nlohmann::ordered_json RTToServer::to_json_object() const {
    nlohmann::ordered_json j;
    j["animation"] = r_t_animation_to_string(animation);
    j["name"] = name;
    return j;
}

void RTToServer::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("animation")) animation = r_t_animation_from_string(j["animation"].get<std::string>());
    if (j.contains("name")) name = j["name"].get<std::string>();
}

std::vector<std::string> SC::json_order() const {
    return {"char_data"};
}

std::map<std::string, std::string> SC::json_consts() const {
    return {};
}

std::vector<std::string> SC::args() const {
    std::vector<std::string> args;
    for (const auto& v : char_data) args.push_back(v.wire_fields());
    return args;
}

SC SC::parse(const std::vector<std::string>& body) {
    SC p;
    std::size_t cursor = 0;
    for (std::size_t i = cursor; i < body.size(); ++i) p.char_data.push_back(SCCharDataItem::parse_item(body[i]));
    cursor = body.size();
    return p;
}

nlohmann::ordered_json SC::to_json_object() const {
    nlohmann::ordered_json j;
    {
        nlohmann::ordered_json a = nlohmann::ordered_json::array();
        for (const auto& v : char_data) a.push_back(v.to_json_object());
        j["char_data"] = a;
    }
    return j;
}

void SC::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("char_data")) { char_data.clear(); for (const auto& v : j["char_data"]) char_data.push_back(SCCharDataItem::from_json_object(v)); }
}

std::vector<std::string> SETCASE::json_order() const {
    return {"cases", "will_cm", "will_def", "will_pro", "will_judge", "will_jury", "will_steno"};
}

std::map<std::string, std::string> SETCASE::json_consts() const {
    return {};
}

std::vector<std::string> SETCASE::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(cases));
    args.push_back(bool_to_wire(will_cm));
    args.push_back(bool_to_wire(will_def));
    args.push_back(bool_to_wire(will_pro));
    args.push_back(bool_to_wire(will_judge));
    args.push_back(bool_to_wire(will_jury));
    args.push_back(bool_to_wire(will_steno));
    return args;
}

SETCASE SETCASE::parse(const std::vector<std::string>& body) {
    SETCASE p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.cases = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.will_cm = parse_wire_bool(body[cursor], "will_cm");
    cursor++;
    if (cursor < body.size()) p.will_def = parse_wire_bool(body[cursor], "will_def");
    cursor++;
    if (cursor < body.size()) p.will_pro = parse_wire_bool(body[cursor], "will_pro");
    cursor++;
    if (cursor < body.size()) p.will_judge = parse_wire_bool(body[cursor], "will_judge");
    cursor++;
    if (cursor < body.size()) p.will_jury = parse_wire_bool(body[cursor], "will_jury");
    cursor++;
    if (cursor < body.size()) p.will_steno = parse_wire_bool(body[cursor], "will_steno");
    cursor++;
    return p;
}

nlohmann::ordered_json SETCASE::to_json_object() const {
    nlohmann::ordered_json j;
    j["cases"] = cases;
    j["will_cm"] = will_cm;
    j["will_def"] = will_def;
    j["will_pro"] = will_pro;
    j["will_judge"] = will_judge;
    j["will_jury"] = will_jury;
    j["will_steno"] = will_steno;
    return j;
}

void SETCASE::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("cases")) cases = j["cases"].get<std::string>();
    if (j.contains("will_cm")) will_cm = j["will_cm"].get<bool>();
    if (j.contains("will_def")) will_def = j["will_def"].get<bool>();
    if (j.contains("will_pro")) will_pro = j["will_pro"].get<bool>();
    if (j.contains("will_judge")) will_judge = j["will_judge"].get<bool>();
    if (j.contains("will_jury")) will_jury = j["will_jury"].get<bool>();
    if (j.contains("will_steno")) will_steno = j["will_steno"].get<bool>();
}

std::vector<std::string> SI::json_order() const {
    return {"char_count", "evi_count", "mus_count"};
}

std::map<std::string, std::string> SI::json_consts() const {
    return {};
}

std::vector<std::string> SI::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(char_count));
    args.push_back(std::to_string(evi_count));
    args.push_back(std::to_string(mus_count));
    return args;
}

SI SI::parse(const std::vector<std::string>& body) {
    SI p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.char_count = parse_wire_int(body[cursor], "char_count");
    cursor++;
    if (cursor < body.size()) p.evi_count = parse_wire_int(body[cursor], "evi_count");
    cursor++;
    if (cursor < body.size()) p.mus_count = parse_wire_int(body[cursor], "mus_count");
    cursor++;
    return p;
}

nlohmann::ordered_json SI::to_json_object() const {
    nlohmann::ordered_json j;
    j["char_count"] = char_count;
    j["evi_count"] = evi_count;
    j["mus_count"] = mus_count;
    return j;
}

void SI::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("char_count")) char_count = j["char_count"].get<int>();
    if (j.contains("evi_count")) evi_count = j["evi_count"].get<int>();
    if (j.contains("mus_count")) mus_count = j["mus_count"].get<int>();
}

std::vector<std::string> SM::json_order() const {
    return {"music_list"};
}

std::map<std::string, std::string> SM::json_consts() const {
    return {};
}

std::vector<std::string> SM::args() const {
    std::vector<std::string> args;
    for (const auto& v : music_list) args.push_back(v.wire_fields());
    return args;
}

SM SM::parse(const std::vector<std::string>& body) {
    SM p;
    std::size_t cursor = 0;
    for (std::size_t i = cursor; i < body.size(); ++i) p.music_list.push_back(SMMusicListItem::parse_item(body[i]));
    cursor = body.size();
    return p;
}

nlohmann::ordered_json SM::to_json_object() const {
    nlohmann::ordered_json j;
    {
        nlohmann::ordered_json a = nlohmann::ordered_json::array();
        for (const auto& v : music_list) a.push_back(v.to_json_object());
        j["music_list"] = a;
    }
    return j;
}

void SM::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("music_list")) { music_list.clear(); for (const auto& v : j["music_list"]) music_list.push_back(SMMusicListItem::from_json_object(v)); }
}

std::vector<std::string> SP::json_order() const {
    return {"side"};
}

std::map<std::string, std::string> SP::json_consts() const {
    return {};
}

std::vector<std::string> SP::args() const {
    std::vector<std::string> args;
    args.push_back(side_to_string(side));
    return args;
}

SP SP::parse(const std::vector<std::string>& body) {
    SP p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.side = side_from_string(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json SP::to_json_object() const {
    nlohmann::ordered_json j;
    j["side"] = side_to_string(side);
    return j;
}

void SP::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("side")) side = side_from_string(j["side"].get<std::string>());
}

std::vector<std::string> ST::json_order() const {
    return {"subtheme", "reload"};
}

std::map<std::string, std::string> ST::json_consts() const {
    return {};
}

std::vector<std::string> ST::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(subtheme));
    args.push_back(bool_to_wire(reload));
    return args;
}

ST ST::parse(const std::vector<std::string>& body) {
    ST p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.subtheme = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.reload = parse_wire_bool(body[cursor], "reload");
    cursor++;
    return p;
}

nlohmann::ordered_json ST::to_json_object() const {
    nlohmann::ordered_json j;
    j["subtheme"] = subtheme;
    j["reload"] = reload;
    return j;
}

void ST::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("subtheme")) subtheme = j["subtheme"].get<std::string>();
    if (j.contains("reload")) reload = j["reload"].get<bool>();
}

std::vector<std::string> TI::json_order() const {
    return {"timer_id", "command", "time"};
}

std::map<std::string, std::string> TI::json_consts() const {
    return {};
}

std::vector<std::string> TI::args() const {
    std::vector<std::string> args;
    args.push_back(std::to_string(timer_id));
    args.push_back(std::to_string(timer_command_to_wire(command)));
    args.push_back(std::to_string(time));
    return args;
}

TI TI::parse(const std::vector<std::string>& body) {
    TI p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.timer_id = parse_wire_int(body[cursor], "timer_id");
    cursor++;
    if (cursor < body.size()) p.command = timer_command_from_wire(parse_wire_int(body[cursor], "command"));
    cursor++;
    if (cursor < body.size()) p.time = parse_wire_int(body[cursor], "time");
    cursor++;
    return p;
}

nlohmann::ordered_json TI::to_json_object() const {
    nlohmann::ordered_json j;
    j["timer_id"] = timer_id;
    j["command"] = timer_command_to_string(command);
    j["time"] = time;
    return j;
}

void TI::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("timer_id")) timer_id = j["timer_id"].get<int>();
    if (j.contains("command")) command = timer_command_from_string(j["command"].get<std::string>());
    if (j.contains("time")) time = j["time"].get<int>();
}

std::vector<std::string> ZZToClient::json_order() const {
    return {"reason"};
}

std::map<std::string, std::string> ZZToClient::json_consts() const {
    return {};
}

std::vector<std::string> ZZToClient::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(reason));
    return args;
}

ZZToClient ZZToClient::parse(const std::vector<std::string>& body) {
    ZZToClient p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.reason = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json ZZToClient::to_json_object() const {
    nlohmann::ordered_json j;
    j["reason"] = reason;
    return j;
}

void ZZToClient::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("reason")) reason = j["reason"].get<std::string>();
}

std::vector<std::string> ZZToServer::json_order() const {
    return {"reason", "reported_player_id"};
}

std::map<std::string, std::string> ZZToServer::json_consts() const {
    return {};
}

std::vector<std::string> ZZToServer::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(reason));
    args.push_back(std::to_string(reported_player_id));
    return args;
}

ZZToServer ZZToServer::parse(const std::vector<std::string>& body) {
    ZZToServer p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.reason = unescape_fanta(body[cursor]);
    cursor++;
    if (cursor < body.size()) p.reported_player_id = parse_wire_int(body[cursor], "reported_player_id");
    cursor++;
    return p;
}

nlohmann::ordered_json ZZToServer::to_json_object() const {
    nlohmann::ordered_json j;
    j["reason"] = reason;
    j["reported_player_id"] = reported_player_id;
    return j;
}

void ZZToServer::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("reason")) reason = j["reason"].get<std::string>();
    if (j.contains("reported_player_id")) reported_player_id = j["reported_player_id"].get<int>();
}

std::vector<std::string> askchaa::json_order() const {
    return {};
}

std::map<std::string, std::string> askchaa::json_consts() const {
    return {};
}

std::vector<std::string> askchaa::args() const {
    std::vector<std::string> args;
    return args;
}

askchaa askchaa::parse(const std::vector<std::string>& body) {
    askchaa p;
    std::size_t cursor = 0;
    return p;
}

nlohmann::ordered_json askchaa::to_json_object() const {
    nlohmann::ordered_json j;
    return j;
}

void askchaa::from_json_object(const nlohmann::ordered_json& j) {
}

std::vector<std::string> decryptor::json_order() const {
    return {"value"};
}

std::map<std::string, std::string> decryptor::json_consts() const {
    return {};
}

std::vector<std::string> decryptor::args() const {
    std::vector<std::string> args;
    args.push_back(escape_fanta(value));
    return args;
}

decryptor decryptor::parse(const std::vector<std::string>& body) {
    decryptor p;
    std::size_t cursor = 0;
    if (cursor < body.size()) p.value = unescape_fanta(body[cursor]);
    cursor++;
    return p;
}

nlohmann::ordered_json decryptor::to_json_object() const {
    nlohmann::ordered_json j;
    j["value"] = value;
    return j;
}

void decryptor::from_json_object(const nlohmann::ordered_json& j) {
    if (j.contains("value")) value = j["value"].get<std::string>();
}

}  // namespace aolib
