#
# Copyright (C) 2026 luci-theme-r1a contributors
#
# This is free software, licensed under the Apache License, Version 2.0.
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=r1a Theme (shadcn-inspired, responsive, dark mode)
LUCI_DEPENDS:=+luci-base
LUCI_PKGARCH:=all

PKG_VERSION:=1.0.6
PKG_RELEASE:=1
PKG_LICENSE:=Apache-2.0
PKG_LICENSE_FILES:=LICENSE
PKG_MAINTAINER:=r1a <r1a@example.invalid>

define Package/luci-theme-r1a/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	if [ -x /etc/uci-defaults/30_luci-theme-r1a ]; then
		sh /etc/uci-defaults/30_luci-theme-r1a
		rm -f /etc/uci-defaults/30_luci-theme-r1a
	fi

	rm -f /tmp/luci-indexcache.*
	rm -rf /tmp/luci-modulecache/
	/etc/init.d/rpcd reload 2>/dev/null
	exit 0
}
endef

define Package/luci-theme-r1a/postrm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	uci -q delete luci.themes.R1A

	if [ "$$(uci -q get luci.main.mediaurlbase)" = "/luci-static/r1a" ]; then
		uci -q set luci.main.mediaurlbase="/luci-static/bootstrap"
	fi

	uci commit luci
}
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
