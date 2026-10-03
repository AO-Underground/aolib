#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN
#include "doctest/doctest.h"

#include "aolib/aolib.hpp"

TEST_CASE("aolib-cpp reports its version") {
    CHECK(std::string(aolib::version()) == std::string("2.6.1"));
}
