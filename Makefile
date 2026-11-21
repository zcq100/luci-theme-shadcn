#
# Copyright (C) 2026 luci-theme-shadcn contributors
#
# This is free software, licensed under the Apache License, Version 2.0.
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=shadcn Theme (responsive, light and dark mode)
LUCI_DEPENDS:=+luci-base
LUCI_PKGARCH:=all

PKG_VERSION:=1.0.7
PKG_RELEASE:=1
PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE
PKG_MAINTAINER:=luci-theme-shadcn <luci-theme-shadcn@example.invalid>

define Package/luci-theme-shadcn/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	if [ -x /etc/uci-defaults/30_luci-theme-shadcn ]; then
		sh /etc/uci-defaults/30_luci-theme-shadcn
		rm -f /etc/uci-defaults/30_luci-theme-shadcn
	fi

	rm -f /tmp/luci-indexcache.*
	rm -rf /tmp/luci-modulecache/
	/etc/init.d/rpcd reload 2>/dev/null
	exit 0
}
endef

define Package/luci-theme-shadcn/postrm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	uci -q delete luci.themes.SHADCN

	if [ "$$(uci -q get luci.main.mediaurlbase)" = "/luci-static/shadcn" ]; then
		uci -q set luci.main.mediaurlbase="/luci-static/bootstrap"
	fi

	uci commit luci
}
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
