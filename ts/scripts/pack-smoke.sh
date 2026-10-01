#!/usr/bin/env bash
# Pack the npm tarball, install it into an empty project, and import it.
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
npm pack --silent --pack-destination "$tmp" >/dev/null
cd "$tmp"
echo '{"name":"pack-smoke","private":true}' >package.json
bun add --silent ./aolib-ts-*.tgz
bun -e 'const m = await import("aolib-ts"); await import("aolib-ts/wire"); if (!Object.keys(m).length) throw new Error("empty exports")'
echo "pack smoke ok"
