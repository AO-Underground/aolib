#!/usr/bin/env bash
# Release spec/, ts/ (npm aolib-ts) and go/ (Go module) together at one version.
#
#   ./release.sh X.Y.Z   set the version, run every CI check, commit, and tag
#                        vX.Y.Z and go/vX.Y.Z locally (pushing is left to you)
#   ./release.sh --check fail if go/go.mod's major suffix disagrees with
#                        ts/package.json (run in CI)
set -euo pipefail
cd "$(dirname "$0")"

module_base=github.com/AO-Underground/aolib/go

die() {
	echo "release: $*" >&2
	exit 1
}

ts_version() {
	sed -nE 's/^  "version": "([^"]+)",?$/\1/p' ts/package.json | head -n 1
}

go_module() {
	awk '$1 == "module" { print $2; exit }' go/go.mod
}

# Go puts majors >= 2 in the import path (semantic import versioning).
module_for() {
	if [ "$1" -le 1 ]; then echo "$module_base"; else echo "$module_base/v$1"; fi
}

check_versions() {
	local v want have
	v=$(ts_version)
	[ -n "$v" ] || die "no version in ts/package.json"
	want=$(module_for "${v%%.*}")
	have=$(go_module)
	[ "$have" = "$want" ] || die "go/go.mod is $have but ts/package.json is $v, which needs $want"
	echo "versions ok: $v, $have"
}

# semver_gt A B: true when A > B (X.Y.Z only).
semver_gt() {
	local a1 a2 a3 b1 b2 b3
	IFS=. read -r a1 a2 a3 <<<"$1"
	IFS=. read -r b1 b2 b3 <<<"$2"
	[ "$a1" -ne "$b1" ] && { [ "$a1" -gt "$b1" ]; return; }
	[ "$a2" -ne "$b2" ] && { [ "$a2" -gt "$b2" ]; return; }
	[ "$a3" -gt "$b3" ]
}

latest_tag() {
	local best="" t v
	for t in $(git tag -l 'v[0-9]*.[0-9]*.[0-9]*'); do
		v=${t#v}
		[[ $v =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || continue
		if [ -z "$best" ] || semver_gt "$v" "$best"; then best=$v; fi
	done
	echo "$best"
}

# sed -i with a backup suffix behaves the same on GNU and BSD sed.
sed_inplace() {
	local f=$1
	shift
	sed -i.bak -E "$@" "$f" && rm "$f.bak"
}

tree_state() {
	{ git status --porcelain; git diff; } | git hash-object --stdin
}

# Every CI step; fails if formatting or codegen would change any file.
run_checks() {
	local before
	before=$(tree_state)
	(cd spec && ./validate.sh && ./format.sh >/dev/null)
	(
		cd go
		[ -z "$(gofmt -l .)" ] || die "gofmt reports unformatted files"
		go vet ./...
		go build ./...
		go test ./...
		rm -f ./*_gen.go
		go run ./cmd/aolib-gen -meta ../spec -out . >/dev/null
		gofmt -w ./*_gen.go
	)
	(
		cd ts
		bun install --frozen-lockfile
		bun run typecheck
		bun run lint
		bun test
		bun run codegen >/dev/null
		./scripts/pack-smoke.sh
	)
	[ "$(tree_state)" = "$before" ] || die "formatting or codegen changed files; regenerate and commit them first"
	check_versions
}

# Rewrite the Go module path (go.mod, imports, docs) when the major changes.
set_go_module() {
	local old new f
	old=$(go_module)
	new=$1
	[ "$old" = "$new" ] && return
	for f in $(git ls-files 'go/*.go' go/go.mod 'go/*.md' README.md); do
		sed_inplace "$f" -e "s#${old//./\\.}([\"\`[:space:]]|\$)#$new\\1#g"
	done
	(cd go && go mod tidy)
}

release() {
	local version=$1 latest
	[[ $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "version must be X.Y.Z, got $version"
	[ "$(git rev-parse --abbrev-ref HEAD)" = main ] || die "release from main"
	[ -z "$(git status --porcelain)" ] || die "working tree is not clean"
	git fetch -q origin main
	[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || die "main is not in sync with origin/main"
	for t in "v$version" "go/v$version"; do
		! git rev-parse -q --verify "refs/tags/$t" >/dev/null || die "tag $t already exists"
	done
	latest=$(latest_tag)
	[ -z "$latest" ] || semver_gt "$version" "$latest" || die "$version is not newer than v$latest"

	released=0
	trap 'if [ "$released" = 0 ]; then echo "release: failed; restoring tracked files" >&2; git checkout -- .; fi' EXIT
	sed_inplace ts/package.json -e "s/^  \"version\": \"[^\"]+\"/  \"version\": \"$version\"/"
	set_go_module "$(module_for "${version%%.*}")"
	run_checks

	git add -A
	git commit -q -m "Release $version"
	git tag -a "v$version" -m "aolib $version"
	git tag -a "go/v$version" -m "aolib Go module $version"
	released=1

	cat <<EOF
Tagged v$version and go/v$version on $(git rev-parse --short HEAD). To publish:

  git push origin main v$version go/v$version
  (cd ts && npm publish)

Then write the release notes on the GitHub release for v$version.
EOF
}

case "${1:-}" in
--check) check_versions ;;
[0-9]*) release "$1" ;;
*) die "usage: ./release.sh X.Y.Z | --check" ;;
esac
