cmake_minimum_required(VERSION 3.16)

project(aolib_cpp
    VERSION 2.6.1
    DESCRIPTION "Attorney Online 2 protocol in C++ (aolib-cpp)"
    LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

# ---------------------------------------------------------------------------
# Dependencies (vendored under third_party/).
# ---------------------------------------------------------------------------

# nlohmann/json (header-only).
add_library(nlohmann_json INTERFACE)
target_include_directories(nlohmann_json INTERFACE
    ${CMAKE_CURRENT_SOURCE_DIR}/third_party)

# pboettch/json-schema-validator (draft-07, built from vendored sources).
add_library(nlohmann_json_schema STATIC
    third_party/json-schema-validator/json-validator.cpp
    third_party/json-schema-validator/json-uri.cpp
    third_party/json-schema-validator/json-schema-draft7.json.cpp
    third_party/json-schema-validator/json-patch.cpp
    third_party/json-schema-validator/smtp-address-validator.cpp
    third_party/json-schema-validator/string-format-check.cpp)
target_include_directories(nlohmann_json_schema PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/third_party/json-schema-validator)
target_link_libraries(nlohmann_json_schema PUBLIC nlohmann_json)
set_target_properties(nlohmann_json_schema PROPERTIES POSITION_INDEPENDENT_CODE ON)

# ---------------------------------------------------------------------------
# aolib-cpp library.
# ---------------------------------------------------------------------------

file(GLOB AOLIB_SOURCES CONFIGURE_DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp)

add_library(aolib-cpp STATIC ${AOLIB_SOURCES})
target_include_directories(aolib-cpp PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
target_link_libraries(aolib-cpp PUBLIC nlohmann_json_schema)
set_target_properties(aolib-cpp PROPERTIES POSITION_INDEPENDENT_CODE ON)

# ---------------------------------------------------------------------------
# aolib-gen: code generator, reads ../spec and emits generated sources.
# ---------------------------------------------------------------------------

add_executable(aolib-gen ${CMAKE_CURRENT_SOURCE_DIR}/aolib-gen/main.cpp)
target_include_directories(aolib-gen PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/third_party)
target_link_libraries(aolib-gen PRIVATE nlohmann_json)

# ---------------------------------------------------------------------------
# Tests.
# ---------------------------------------------------------------------------

enable_testing()
file(GLOB AOLIB_TEST_SOURCES CONFIGURE_DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/tests/*.cpp)
add_executable(aolib-tests ${AOLIB_TEST_SOURCES})
target_include_directories(aolib-tests PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/third_party)
target_link_libraries(aolib-tests PRIVATE aolib-cpp)
add_test(NAME aolib-tests COMMAND aolib-tests)
