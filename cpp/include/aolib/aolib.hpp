// aolib-cpp: the Attorney Online 2 protocol in C++.
//
// This is a 1:1 port of aolib-ts / aolib-go, generated from the canonical
// spec/ schemas. The public surface mirrors the Go library: packet types,
// enums, Encode/Decode/Validate, the role-typed session surface, custom
// packets, and the char.ini parser.
#pragma once

#define AOLIB_CPP_VERSION "2.6.1"

#include "aolib/error.hpp"
#include "aolib/fanta.hpp"
#include "aolib/aopacket.hpp"
#include "aolib/ticks.hpp"
#include "aolib/outgoing.hpp"

namespace aolib {
// Library version string.
const char* version();
}  // namespace aolib


