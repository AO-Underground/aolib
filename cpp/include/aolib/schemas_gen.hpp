// AUTO-GENERATED from spec. Do not edit; run aolib-gen.
#pragma once

#include <map>
#include <string>

#include <nlohmann/json.hpp>

namespace aolib {

// Every spec schema (packets + types) keyed by its $id.
const std::map<std::string, nlohmann::ordered_json>& spec_schemas();

}  // namespace aolib
