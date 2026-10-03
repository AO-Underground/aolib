#pragma once

#include <stdexcept>
#include <string>

namespace aolib {

// Base error type for every aolib failure (decode/encode/validation/usage).
class Error : public std::runtime_error {
public:
    using std::runtime_error::runtime_error;
};

// A packet that does not satisfy its spec/ JSON Schema.
class ValidationError : public Error {
public:
    ValidationError(std::string header, std::string detail);
    std::string header;
    std::string detail;
};

}  // namespace aolib
