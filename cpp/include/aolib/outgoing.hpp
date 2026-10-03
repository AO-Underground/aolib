#pragma once

#include <map>
#include <string>
#include <vector>

#include <nlohmann/json.hpp>

namespace aolib {

// Wire format.
enum class WireMode { fanta, json };

// Common interface implemented by every packet type.
//
// The generated packet structs satisfy this: the wire layer needs only this
// type-erased surface to encode/decode/validate any packet, exactly like
// aolib-go's Outgoing plus the optional interfaces it type-asserts.
class Outgoing {
public:
    virtual ~Outgoing() = default;

    // FantaCode: header and positional args (no header, no trailing '%').
    virtual std::string header() const = 0;
    virtual std::vector<std::string> args() const = 0;

    // JSON envelope metadata.
    virtual std::vector<std::string> json_order() const = 0;              // schema field order (consts included)
    virtual std::map<std::string, std::string> json_consts() const = 0;   // const-only slots (e.g. PV _cid)
    virtual std::string schema_path() const = 0;                          // /packets/schemas/X.schema.json

    // Typed JSON conversion (non-const fields, schema key order).
    virtual nlohmann::ordered_json to_json_object() const = 0;
    virtual void from_json_object(const nlohmann::ordered_json& fields) = 0;

    // JSON keys the schema does not define (null when none).
    virtual nlohmann::json* extras_ptr() = 0;
    virtual const nlohmann::json* extras_ptr() const = 0;
};

}  // namespace aolib
