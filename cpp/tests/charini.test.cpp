#include "doctest/doctest.h"

#include <string>

#include "aolib/aolib.hpp"

TEST_CASE("char.ini legacy bank parsing") {
    std::string ini = R"([options]
name = Phoenix
showname = P.Wright
side = def
blips = male

[emotions]
number = 2
1 = normal#-#normal#0#0
2 = objection#-#objection#0#0

[soundn]
1 = objection

[soundt]
1 = 30
)";
    aolib::CharIni c = aolib::parse_char_ini(ini);
    CHECK(c.options.name == "Phoenix");
    CHECK(c.options.side == "def");
    REQUIRE(c.emotes.size() == 2);
    CHECK(c.emotes[0].key == "1");
    CHECK(c.emotes[0].anim == "normal");
    CHECK(c.emotes[1].key == "2");
    CHECK(c.emotes[1].name == "objection");
}

TEST_CASE("char.ini block parsing") {
    std::string ini = R"([options]
name = Phoenix
side = def

[emote normal]
name = Normal
anim = normal(a).gif
modifier = no_preanim
sound = normal.wav
)";
    aolib::CharIni c = aolib::parse_char_ini(ini);
    REQUIRE(c.emotes.size() == 1);
    CHECK(c.emotes[0].key == "normal");
    CHECK(c.emotes[0].anim == "normal(a).gif");
    CHECK(c.emotes[0].modifier == aolib::EmoteModifier::no_preanim);
    CHECK(c.emotes[0].sound.value() == "normal.wav");
}

TEST_CASE("char.ini requires options and name") {
    CHECK_THROWS_AS(aolib::parse_char_ini("[emotions]\nnumber=1\n1=x#-a#0#0\n"), aolib::Error);
    CHECK_THROWS_AS(aolib::parse_char_ini("[options]\nside=def\n"), aolib::Error);
}
