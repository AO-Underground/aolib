#pragma once

#include "aolib/enums_gen.hpp"

namespace aolib {

// True for sides whose layout uses the full-view pan-camera (def/pro/wit).
inline bool is_full_view(Side s) {
    return s == Side::def || s == Side::pro || s == Side::wit;
}

}  // namespace aolib
