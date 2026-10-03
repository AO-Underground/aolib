#pragma once

#include <string>
#include <utility>
#include <vector>

namespace aolib {

// Escape the chat-format metacharacters on encode.
std::string escape_fanta(const std::string& s);

// Invert escape_fanta on decode.
std::string unescape_fanta(const std::string& s);

// Encode a boolean as "1"/"0".
std::string bool_to_wire(bool b);

// Decode a "1"/"0" token to a boolean (lenient: anything else is false).
bool wire_to_bool(const std::string& s);

// Strict scalar decoders, mirroring the TS walker: present-but-malformed
// tokens throw an Error naming the field.
int parse_wire_int(const std::string& token, const std::string& name);
bool parse_wire_bool(const std::string& token, const std::string& name);

// Split an object slot into at most n subfields on '&'. Escaped ampersands
// survive as "<and>" and are not separators.
std::vector<std::string> split_amp(const std::string& s, int n);

// Join already-encoded subfields with '&'.
std::string join_amp(const std::vector<std::string>& parts);

// Split a slot carrying an optional "^order" suffix into base + suffix.
std::pair<std::string, std::string> split_caret(const std::string& s);

}  // namespace aolib
