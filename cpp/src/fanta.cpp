#include "aolib/fanta.hpp"
#include "aolib/error.hpp"

#include <cctype>

namespace aolib {

namespace {

void replace_all(std::string& s, const std::string& from, const std::string& to) {
    std::size_t pos = 0;
    while ((pos = s.find(from, pos)) != std::string::npos) {
        s.replace(pos, from.size(), to);
        pos += to.size();
    }
}

bool is_integer(const std::string& s) {
    if (s.empty()) return false;
    std::size_t i = 0;
    if (s[0] == '+' || s[0] == '-') i = 1;
    if (i == s.size()) return false;
    for (; i < s.size(); ++i) {
        if (!std::isdigit(static_cast<unsigned char>(s[i]))) return false;
    }
    return true;
}

}  // namespace

std::string escape_fanta(const std::string& s) {
    std::string out = s;
    replace_all(out, "#", "<num>");
    replace_all(out, "&", "<and>");
    replace_all(out, "%", "<percent>");
    replace_all(out, "$", "<dollar>");
    return out;
}

std::string unescape_fanta(const std::string& s) {
    std::string out = s;
    replace_all(out, "<num>", "#");
    replace_all(out, "<and>", "&");
    replace_all(out, "<percent>", "%");
    replace_all(out, "<dollar>", "$");
    return out;
}

std::string bool_to_wire(bool b) { return b ? "1" : "0"; }

bool wire_to_bool(const std::string& s) { return s == "1"; }

int parse_wire_int(const std::string& token, const std::string& name) {
    if (token.empty()) {
        throw Error("Invalid number for field '" + name + "': empty token");
    }
    if (!is_integer(token)) {
        throw Error("Invalid number for field '" + name + "': " + token);
    }
    return std::stoi(token);
}

bool parse_wire_bool(const std::string& token, const std::string& name) {
    if (token != "0" && token != "1") {
        throw Error("Invalid boolean for field '" + name +
                    "': expected \"0\" or \"1\", got " + token);
    }
    return token == "1";
}

std::vector<std::string> split_amp(const std::string& s, int n) {
    std::vector<std::string> out;
    std::size_t start = 0;
    while (out.size() + 1 < static_cast<std::size_t>(n)) {
        std::size_t pos = s.find('&', start);
        if (pos == std::string::npos) break;
        out.push_back(s.substr(start, pos - start));
        start = pos + 1;
    }
    out.push_back(s.substr(start));
    return out;
}

std::string join_amp(const std::vector<std::string>& parts) {
    std::string out;
    for (std::size_t i = 0; i < parts.size(); ++i) {
        if (i) out += '&';
        out += parts[i];
    }
    return out;
}

std::pair<std::string, std::string> split_caret(const std::string& s) {
    std::size_t i = s.find('^');
    if (i == std::string::npos) return {s, ""};
    return {s.substr(0, i), s.substr(i + 1)};
}

}  // namespace aolib
