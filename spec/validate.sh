#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

fail=0
err() { echo "FAIL: $*" >&2; fail=1; }

while IFS= read -r -d '' f; do
    jq empty "$f" 2>/dev/null || err "$f: invalid JSON"
done < <(find ./packets ./types ./assets -name '*.json' -print0)

for f in packets/schemas/*.schema.json; do
    h=$(jq -r '.properties["$header"].const // empty' "$f")
    [ -n "$h" ] || err "$f: missing \$header const"

    r=$(jq -r '.["x-receiver"] // empty' "$f")
    case "$r" in client|server) ;; *) err "$f: x-receiver must be client|server (got '$r')" ;; esac

    t=$(jq -r '.title // empty' "$f")
    [ "$t" = "$h" ] || err "$f: title '$t' != header '$h'"

    while IFS= read -r ref; do
        [ -f "packets/schemas/$ref" ] || err "$f: \$ref '$ref' does not resolve"
    done < <(jq -r '[.. | objects | .["$ref"]? // empty] | .[] | select(startswith("#") | not)' "$f")

    c=$(jq -r '.["x-fanta-codec"] // empty' "$f")
    if [ -n "$c" ]; then
        grep -q "\`$c\`" packets/CODECS.md || err "$f: codec '$c' not documented in packets/CODECS.md"
    fi
done

for f in types/*.schema.json; do
    en=$(jq '(.enum // []) | length' "$f")
    if [ "$en" -gt 0 ]; then
        if [ "$(jq 'has("x-enum-description")' "$f")" = "true" ]; then
            nm=$(jq '(.["x-enum-description"]) | length' "$f")
            [ "$en" = "$nm" ] || err "$f: x-enum-description length $nm != enum length $en"
        fi

        wi=$(jq '(.["x-wire-ints"] // []) | length' "$f")
        if [ "$wi" -gt 0 ]; then
            [ "$en" = "$wi" ] || err "$f: enum length $en != x-wire-ints length $wi"
            [ "$(jq -r '.type' "$f")" = "string" ] || err "$f: x-wire-ints requires type string"
            [ "$(jq '[.["x-wire-ints"][] | floor == .] | all' "$f")" = "true" ] || err "$f: x-wire-ints must be all integers"
        fi
    fi
done

if [ "$fail" -ne 0 ]; then
    echo "validation failed" >&2
    exit 1
fi
echo "all schemas valid"
