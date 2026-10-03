// AUTO-GENERATED from spec. Do not edit; run aolib-gen.
#pragma once

#include <any>
#include <functional>
#include <map>
#include <string>
#include <vector>

namespace aolib {

using FantaDecoder = std::function<std::any(const std::vector<std::string>&)>;
using JsonDecoder = std::function<std::any(const std::string&)>;
using PacketConstructor = std::function<std::any()>;

extern const std::map<std::string, FantaDecoder> c2s_decoders;
extern const std::map<std::string, FantaDecoder> s2c_decoders;
extern const std::map<std::string, JsonDecoder> c2s_json;
extern const std::map<std::string, JsonDecoder> s2c_json;
extern const std::map<std::string, PacketConstructor> packet_constructors;

}  // namespace aolib
