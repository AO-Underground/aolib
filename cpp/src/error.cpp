#include "aolib/error.hpp"

namespace aolib {

ValidationError::ValidationError(std::string header, std::string detail)
    : Error("aolib: invalid " + header + " packet: " + detail),
      header(std::move(header)),
      detail(std::move(detail)) {}

}  // namespace aolib
