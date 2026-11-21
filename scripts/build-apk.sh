#!/bin/sh
# Build dist/luci-theme-shadcn-<version>.apk from the repo tree.
#
# Requires an apk-tools 3 binary (the one shipped in the OpenWrt SDK works):
#   APK=/path/to/sdk/staging_dir/host/bin/apk ./scripts/build-apk.sh
#
# If not running as root, the script re-executes itself in a user namespace
# so the packaged files end up owned by root:root.

set -eu

TOP=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
APK=${APK:-apk}

if [ "$(id -u)" != 0 ]; then
	if command -v unshare >/dev/null 2>&1 && unshare -r true 2>/dev/null; then
		exec unshare -r --map-root-user "$0" "$@"
	fi

	echo "error: need root or unshare (util-linux) to set root:root ownership" >&2
	exit 1
fi

if ! "$APK" --version 2>/dev/null | grep -q 'apk-tools 3'; then
	echo "error: '$APK' is not apk-tools 3 (mkpkg required)" >&2
	exit 1
fi

VERSION=$(sed -n 's/^PKG_VERSION:=//p' "$TOP/Makefile.sdk" | head -n1)
RELEASE=$(sed -n 's/^PKG_RELEASE:=//p' "$TOP/Makefile.sdk" | head -n1)
VERSION=${VERSION:-1.0.0}
RELEASE=${RELEASE:-1}
FULLVERSION="$VERSION-r$RELEASE"

STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT INT TERM

ROOT="$STAGE/root"
SCRIPTS="$STAGE/scripts"

install -d "$ROOT/www/luci-static/resources" \
	"$ROOT/usr/share/ucode/luci/template/themes" \
	"$ROOT/etc/uci-defaults" \
	"$SCRIPTS" \
	"$TOP/dist"

cp -a "$TOP/htdocs/luci-static/shadcn" "$ROOT/www/luci-static/"
cp "$TOP/htdocs/luci-static/resources/menu-shadcn.js" "$ROOT/www/luci-static/resources/"
cp -a "$TOP/ucode/template/themes/shadcn" "$ROOT/usr/share/ucode/luci/template/themes/"
cp -a "$TOP/root/etc/uci-defaults/30_luci-theme-shadcn" "$ROOT/etc/uci-defaults/"

cat > "$SCRIPTS/post-install" <<'EOF'
#!/bin/sh
[ -n "$IPKG_INSTROOT" ] || {
	if [ -x /etc/uci-defaults/30_luci-theme-shadcn ]; then
		sh /etc/uci-defaults/30_luci-theme-shadcn
		rm -f /etc/uci-defaults/30_luci-theme-shadcn
	fi

	rm -f /tmp/luci-indexcache.*
	rm -rf /tmp/luci-modulecache/
	/etc/init.d/rpcd reload 2>/dev/null
	exit 0
}
EOF

cat > "$SCRIPTS/post-deinstall" <<'EOF'
#!/bin/sh
[ -n "$IPKG_INSTROOT" ] || {
	uci -q delete luci.themes.SHADCN

	if [ "$(uci -q get luci.main.mediaurlbase)" = "/luci-static/shadcn" ]; then
		uci -q set luci.main.mediaurlbase="/luci-static/bootstrap"
	fi

	uci commit luci
}
EOF

chown -R 0:0 "$ROOT" "$SCRIPTS"

OUT="$TOP/dist/luci-theme-shadcn-$FULLVERSION.apk"

SIGN_KEY=${SIGN_KEY:-}
if [ -z "$SIGN_KEY" ] && [ -f "$TOP/.signing/shadcn.ec.key" ]; then
	SIGN_KEY="$TOP/.signing/shadcn.ec.key"
fi

set -- \
	--info "name:luci-theme-shadcn" \
	--info "version:$FULLVERSION" \
	--info "description:A shadcn-inspired responsive LuCI theme with light and dark modes." \
	--info "arch:noarch" \
	--info "license:Apache-2.0" \
	--info "origin:luci" \
	--info "url:https://github.com/openwrt/luci" \
	--info "maintainer:luci-theme-shadcn <luci-theme-shadcn@example.invalid>" \
	--info "depends:luci-base" \
	--script "post-install:$SCRIPTS/post-install" \
	--script "post-deinstall:$SCRIPTS/post-deinstall" \
	--files "$ROOT" \
	--output "$OUT"

if [ -n "$SIGN_KEY" ]; then
	set -- "$@" --sign-key "$SIGN_KEY"

	if command -v openssl >/dev/null 2>&1; then
		openssl ec -in "$SIGN_KEY" -pubout -out "$TOP/dist/shadcn.ec.pub" 2>/dev/null || true
	fi
fi

SOURCE_DATE_EPOCH=0 "$APK" mkpkg "$@"

echo "built $OUT"
