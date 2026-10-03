// AUTO-GENERATED from spec/packets/schemas. Do not edit; run aolib-gen.
#pragma once

#include <map>
#include <string>
#include <vector>

#include <nlohmann/json.hpp>

#include "aolib/outgoing.hpp"
#include "aolib/enums_gen.hpp"
#include "aolib/types_gen.hpp"

namespace aolib {

struct CIEntriesItem {
    int index{0};
    std::string data{};

    std::string wire_fields() const;
    static CIEntriesItem parse_item(const std::string& s);
    nlohmann::ordered_json to_json_object() const;
    static CIEntriesItem from_json_object(const nlohmann::ordered_json& j);
};

struct EMEntriesItem {
    int index{0};
    std::string name{};

    std::string wire_fields() const;
    static EMEntriesItem parse_item(const std::string& s);
    nlohmann::ordered_json to_json_object() const;
    static EMEntriesItem from_json_object(const nlohmann::ordered_json& j);
};

struct FMMusicListItem {
    std::string name{};

    std::string wire_fields() const;
    static FMMusicListItem parse_item(const std::string& s);
    nlohmann::ordered_json to_json_object() const;
    static FMMusicListItem from_json_object(const nlohmann::ordered_json& j);
};

struct LEEvidenceItem {
    std::string name{};
    std::string description{};
    std::string image{};

    std::string wire_fields() const;
    static LEEvidenceItem parse_item(const std::string& s);
    nlohmann::ordered_json to_json_object() const;
    static LEEvidenceItem from_json_object(const nlohmann::ordered_json& j);
};

struct SCCharDataItem {
    std::string name{};
    std::string desc{};
    std::string evidence{};

    std::string wire_fields() const;
    static SCCharDataItem parse_item(const std::string& s);
    nlohmann::ordered_json to_json_object() const;
    static SCCharDataItem from_json_object(const nlohmann::ordered_json& j);
};

struct SMMusicListItem {
    std::string name{};

    std::string wire_fields() const;
    static SMMusicListItem parse_item(const std::string& s);
    nlohmann::ordered_json to_json_object() const;
    static SMMusicListItem from_json_object(const nlohmann::ordered_json& j);
};

struct ARUP : Outgoing {
    AreaUpdateType update_type{AreaUpdateType::player_count};
    std::vector<std::string> update_data{};
    nlohmann::json extras;

    std::string header() const override { return "ARUP"; }
    std::string schema_path() const override { return "/packets/schemas/ARUP.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static ARUP parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct ASS : Outgoing {
    std::string asset_url{};
    nlohmann::json extras;

    std::string header() const override { return "ASS"; }
    std::string schema_path() const override { return "/packets/schemas/ASS.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static ASS parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct AUTH : Outgoing {
    AuthState auth_state{AuthState::logout};
    nlohmann::json extras;

    std::string header() const override { return "AUTH"; }
    std::string schema_path() const override { return "/packets/schemas/AUTH.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static AUTH parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct BB : Outgoing {
    std::string message{};
    nlohmann::json extras;

    std::string header() const override { return "BB"; }
    std::string schema_path() const override { return "/packets/schemas/BB.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static BB parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct BD : Outgoing {
    std::string reason{};
    nlohmann::json extras;

    std::string header() const override { return "BD"; }
    std::string schema_path() const override { return "/packets/schemas/BD.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static BD parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct BN : Outgoing {
    std::string background{};
    std::string position{};
    nlohmann::json extras;

    std::string header() const override { return "BN"; }
    std::string schema_path() const override { return "/packets/schemas/BN.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static BN parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct CASEAToClient : Outgoing {
    std::string message{};
    bool need_def{false};
    bool need_pro{false};
    bool need_judge{false};
    bool need_jury{false};
    bool need_steno{false};
    nlohmann::json extras;

    std::string header() const override { return "CASEA"; }
    std::string schema_path() const override { return "/packets/schemas/CASEAToClient.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static CASEAToClient parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct CASEAToServer : Outgoing {
    std::string title{};
    bool need_def{false};
    bool need_pro{false};
    bool need_judge{false};
    bool need_jury{false};
    bool need_steno{false};
    nlohmann::json extras;

    std::string header() const override { return "CASEA"; }
    std::string schema_path() const override { return "/packets/schemas/CASEAToServer.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static CASEAToServer parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct CC : Outgoing {
    int player_id{0};
    int char_id{0};
    std::string char_password{};
    nlohmann::json extras;

    std::string header() const override { return "CC"; }
    std::string schema_path() const override { return "/packets/schemas/CC.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static CC parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct CH : Outgoing {
    int char_id{0};
    nlohmann::json extras;

    std::string header() const override { return "CH"; }
    std::string schema_path() const override { return "/packets/schemas/CH.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static CH parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct CHECK : Outgoing {
    nlohmann::json extras;

    std::string header() const override { return "CHECK"; }
    std::string schema_path() const override { return "/packets/schemas/CHECK.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static CHECK parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct CI : Outgoing {
    int batch_index{0};
    std::vector<CIEntriesItem> entries{};
    nlohmann::json extras;

    std::string header() const override { return "CI"; }
    std::string schema_path() const override { return "/packets/schemas/CI.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static CI parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct CTToClient : Outgoing {
    std::string name{};
    std::string message{};
    bool is_from_server{false};
    nlohmann::json extras;

    std::string header() const override { return "CT"; }
    std::string schema_path() const override { return "/packets/schemas/CTToClient.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static CTToClient parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct CTToServer : Outgoing {
    std::string name{};
    std::string message{};
    nlohmann::json extras;

    std::string header() const override { return "CT"; }
    std::string schema_path() const override { return "/packets/schemas/CTToServer.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static CTToServer parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct CharsCheck : Outgoing {
    std::vector<CharAvailability> taken{};
    nlohmann::json extras;

    std::string header() const override { return "CharsCheck"; }
    std::string schema_path() const override { return "/packets/schemas/CharsCheck.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static CharsCheck parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct DE : Outgoing {
    int id{0};
    nlohmann::json extras;

    std::string header() const override { return "DE"; }
    std::string schema_path() const override { return "/packets/schemas/DE.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static DE parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct DONE : Outgoing {
    nlohmann::json extras;

    std::string header() const override { return "DONE"; }
    std::string schema_path() const override { return "/packets/schemas/DONE.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static DONE parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct EE : Outgoing {
    int id{0};
    std::string name{};
    std::string description{};
    std::string image{};
    nlohmann::json extras;

    std::string header() const override { return "EE"; }
    std::string schema_path() const override { return "/packets/schemas/EE.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static EE parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct EI : Outgoing {
    int id{0};
    std::string details{};
    nlohmann::json extras;

    std::string header() const override { return "EI"; }
    std::string schema_path() const override { return "/packets/schemas/EI.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static EI parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct EM : Outgoing {
    int batch_index{0};
    std::vector<EMEntriesItem> entries{};
    nlohmann::json extras;

    std::string header() const override { return "EM"; }
    std::string schema_path() const override { return "/packets/schemas/EM.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static EM parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct FA : Outgoing {
    std::vector<std::string> areas{};
    nlohmann::json extras;

    std::string header() const override { return "FA"; }
    std::string schema_path() const override { return "/packets/schemas/FA.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static FA parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct FL : Outgoing {
    std::vector<std::string> features{};
    nlohmann::json extras;

    std::string header() const override { return "FL"; }
    std::string schema_path() const override { return "/packets/schemas/FL.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static FL parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct FM : Outgoing {
    std::vector<FMMusicListItem> music_list{};
    nlohmann::json extras;

    std::string header() const override { return "FM"; }
    std::string schema_path() const override { return "/packets/schemas/FM.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static FM parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct HI : Outgoing {
    std::string hdid{};
    nlohmann::json extras;

    std::string header() const override { return "HI"; }
    std::string schema_path() const override { return "/packets/schemas/HI.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static HI parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct HPToClient : Outgoing {
    PenaltyBar bar{PenaltyBar::defense};
    int value{0};
    nlohmann::json extras;

    std::string header() const override { return "HP"; }
    std::string schema_path() const override { return "/packets/schemas/HPToClient.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static HPToClient parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct HPToServer : Outgoing {
    PenaltyBar bar{PenaltyBar::defense};
    int value{0};
    nlohmann::json extras;

    std::string header() const override { return "HP"; }
    std::string schema_path() const override { return "/packets/schemas/HPToServer.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static HPToServer parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct IDToClient : Outgoing {
    int player_id{0};
    std::string software{};
    std::string version{};
    nlohmann::json extras;

    std::string header() const override { return "ID"; }
    std::string schema_path() const override { return "/packets/schemas/IDToClient.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static IDToClient parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct IDToServer : Outgoing {
    std::string software{};
    std::string version{};
    nlohmann::json extras;

    std::string header() const override { return "ID"; }
    std::string schema_path() const override { return "/packets/schemas/IDToServer.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static IDToServer parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct JD : Outgoing {
    JudgeState state{JudgeState::by_position};
    nlohmann::json extras;

    std::string header() const override { return "JD"; }
    std::string schema_path() const override { return "/packets/schemas/JD.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static JD parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct KB : Outgoing {
    std::string reason{};
    nlohmann::json extras;

    std::string header() const override { return "KB"; }
    std::string schema_path() const override { return "/packets/schemas/KB.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static KB parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct KK : Outgoing {
    std::string reason{};
    nlohmann::json extras;

    std::string header() const override { return "KK"; }
    std::string schema_path() const override { return "/packets/schemas/KK.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static KK parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct LE : Outgoing {
    std::vector<LEEvidenceItem> evidence{};
    nlohmann::json extras;

    std::string header() const override { return "LE"; }
    std::string schema_path() const override { return "/packets/schemas/LE.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static LE parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct MA : Outgoing {
    int player_id{0};
    int duration_minutes{0};
    std::string reason{};
    nlohmann::json extras;

    std::string header() const override { return "MA"; }
    std::string schema_path() const override { return "/packets/schemas/MA.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static MA parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct MCToClient : Outgoing {
    std::string name{};
    int char_id{0};
    std::string showname{};
    bool looping{false};
    MusicChannel channel{MusicChannel::music};
    MusicEffects effects{};
    nlohmann::json extras;

    std::string header() const override { return "MC"; }
    std::string schema_path() const override { return "/packets/schemas/MCToClient.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static MCToClient parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct MCToServer : Outgoing {
    std::string name{};
    int char_id{0};
    std::string showname{};
    MusicEffects effects{};
    nlohmann::json extras;

    std::string header() const override { return "MC"; }
    std::string schema_path() const override { return "/packets/schemas/MCToServer.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static MCToServer parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct MSToClient : Outgoing {
    DeskModifier desk_modifier{DeskModifier::shown};
    std::string preanim{};
    std::string character{};
    std::string emote{};
    std::string message{};
    Side side{Side::def};
    std::string sfx_name{};
    EmoteModifier emote_modifier{EmoteModifier::no_preanim};
    int char_id{0};
    int sfx_delay{0};
    ShoutModifier shout_modifier{ShoutModifier::none};
    int evidence_id{0};
    Flip flip{Flip::none};
    bool realization{false};
    TextColor text_color{TextColor::white};
    std::string showname{};
    int paired_charid{-1};
    int paired_order{0};
    std::string paired_name{};
    std::string paired_emote{};
    Offset offset{};
    Offset paired_offset{};
    Flip paired_flip{Flip::none};
    bool noninterrupting_preanim{false};
    bool sfx_looping{false};
    bool screenshake{false};
    std::string frames_shake{};
    std::string frames_realization{};
    std::string frames_sfx{};
    bool additive{false};
    Effect effect{};
    nlohmann::json extras;

    std::string header() const override { return "MS"; }
    std::string schema_path() const override { return "/packets/schemas/MSToClient.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static MSToClient parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct MSToServer : Outgoing {
    DeskModifier desk_modifier{DeskModifier::shown};
    std::string preanim{};
    std::string character{};
    std::string emote{};
    std::string message{};
    Side side{Side::def};
    std::string sfx_name{};
    EmoteModifier emote_modifier{EmoteModifier::no_preanim};
    int char_id{0};
    int sfx_delay{0};
    ShoutModifier shout_modifier{ShoutModifier::none};
    int evidence_id{0};
    Flip flip{Flip::none};
    bool realization{false};
    TextColor text_color{TextColor::white};
    std::string showname{};
    int paired_charid{-1};
    int paired_order{0};
    Offset offset{};
    bool noninterrupting_preanim{false};
    bool sfx_looping{false};
    bool screenshake{false};
    std::string frames_shake{};
    std::string frames_realization{};
    std::string frames_sfx{};
    bool additive{false};
    Effect effect{};
    nlohmann::json extras;

    std::string header() const override { return "MS"; }
    std::string schema_path() const override { return "/packets/schemas/MSToServer.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static MSToServer parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct PE : Outgoing {
    std::string name{};
    std::string description{};
    std::string image{};
    nlohmann::json extras;

    std::string header() const override { return "PE"; }
    std::string schema_path() const override { return "/packets/schemas/PE.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static PE parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct PN : Outgoing {
    int player_count{0};
    int max_players{0};
    std::string server_description{};
    nlohmann::json extras;

    std::string header() const override { return "PN"; }
    std::string schema_path() const override { return "/packets/schemas/PN.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static PN parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct PR : Outgoing {
    int id{0};
    PlayerListUpdate type{PlayerListUpdate::add};
    nlohmann::json extras;

    std::string header() const override { return "PR"; }
    std::string schema_path() const override { return "/packets/schemas/PR.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static PR parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct PU : Outgoing {
    int id{0};
    PlayerDataType type{PlayerDataType::ooc_name};
    std::string data{};
    nlohmann::json extras;

    std::string header() const override { return "PU"; }
    std::string schema_path() const override { return "/packets/schemas/PU.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static PU parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct PV : Outgoing {
    int player_id{0};
    int char_id{0};
    nlohmann::json extras;

    std::string header() const override { return "PV"; }
    std::string schema_path() const override { return "/packets/schemas/PV.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static PV parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct RC : Outgoing {
    nlohmann::json extras;

    std::string header() const override { return "RC"; }
    std::string schema_path() const override { return "/packets/schemas/RC.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static RC parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct RD : Outgoing {
    nlohmann::json extras;

    std::string header() const override { return "RD"; }
    std::string schema_path() const override { return "/packets/schemas/RD.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static RD parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct RM : Outgoing {
    nlohmann::json extras;

    std::string header() const override { return "RM"; }
    std::string schema_path() const override { return "/packets/schemas/RM.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static RM parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct RMC : Outgoing {
    std::string to_time{};
    nlohmann::json extras;

    std::string header() const override { return "RMC"; }
    std::string schema_path() const override { return "/packets/schemas/RMC.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static RMC parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct RTToClient : Outgoing {
    RTAnimation animation{RTAnimation::witness_testimony};
    std::string name{};
    nlohmann::json extras;

    std::string header() const override { return "RT"; }
    std::string schema_path() const override { return "/packets/schemas/RTToClient.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static RTToClient parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct RTToServer : Outgoing {
    RTAnimation animation{RTAnimation::witness_testimony};
    std::string name{};
    nlohmann::json extras;

    std::string header() const override { return "RT"; }
    std::string schema_path() const override { return "/packets/schemas/RTToServer.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static RTToServer parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct SC : Outgoing {
    std::vector<SCCharDataItem> char_data{};
    nlohmann::json extras;

    std::string header() const override { return "SC"; }
    std::string schema_path() const override { return "/packets/schemas/SC.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static SC parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct SETCASE : Outgoing {
    std::string cases{};
    bool will_cm{false};
    bool will_def{false};
    bool will_pro{false};
    bool will_judge{false};
    bool will_jury{false};
    bool will_steno{false};
    nlohmann::json extras;

    std::string header() const override { return "SETCASE"; }
    std::string schema_path() const override { return "/packets/schemas/SETCASE.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static SETCASE parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct SI : Outgoing {
    int char_count{0};
    int evi_count{0};
    int mus_count{0};
    nlohmann::json extras;

    std::string header() const override { return "SI"; }
    std::string schema_path() const override { return "/packets/schemas/SI.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static SI parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct SM : Outgoing {
    std::vector<SMMusicListItem> music_list{};
    nlohmann::json extras;

    std::string header() const override { return "SM"; }
    std::string schema_path() const override { return "/packets/schemas/SM.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static SM parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct SP : Outgoing {
    Side side{Side::def};
    nlohmann::json extras;

    std::string header() const override { return "SP"; }
    std::string schema_path() const override { return "/packets/schemas/SP.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static SP parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct ST : Outgoing {
    std::string subtheme{};
    bool reload{false};
    nlohmann::json extras;

    std::string header() const override { return "ST"; }
    std::string schema_path() const override { return "/packets/schemas/ST.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static ST parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct TI : Outgoing {
    int timer_id{0};
    TimerCommand command{TimerCommand::start};
    int time{0};
    nlohmann::json extras;

    std::string header() const override { return "TI"; }
    std::string schema_path() const override { return "/packets/schemas/TI.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static TI parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct ZZToClient : Outgoing {
    std::string reason{};
    nlohmann::json extras;

    std::string header() const override { return "ZZ"; }
    std::string schema_path() const override { return "/packets/schemas/ZZToClient.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static ZZToClient parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct ZZToServer : Outgoing {
    std::string reason{};
    int reported_player_id{-1};
    nlohmann::json extras;

    std::string header() const override { return "ZZ"; }
    std::string schema_path() const override { return "/packets/schemas/ZZToServer.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static ZZToServer parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct askchaa : Outgoing {
    nlohmann::json extras;

    std::string header() const override { return "askchaa"; }
    std::string schema_path() const override { return "/packets/schemas/askchaa.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static askchaa parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

struct decryptor : Outgoing {
    std::string value{};
    nlohmann::json extras;

    std::string header() const override { return "decryptor"; }
    std::string schema_path() const override { return "/packets/schemas/decryptor.schema.json"; }
    nlohmann::json* extras_ptr() override { return &extras; }
    const nlohmann::json* extras_ptr() const override { return &extras; }

    std::vector<std::string> json_order() const override;
    std::map<std::string, std::string> json_consts() const override;
    std::vector<std::string> args() const override;
    static decryptor parse(const std::vector<std::string>& body);
    nlohmann::ordered_json to_json_object() const override;
    void from_json_object(const nlohmann::ordered_json& fields) override;
};

}  // namespace aolib
