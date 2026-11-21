# luci-theme-shadcn

A shadcn/ui-inspired theme for OpenWrt LuCI: responsive layout, light and dark modes, and no runtime dependencies.

[![License](https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square)](LICENSE)
[![OpenWrt](https://img.shields.io/badge/OpenWrt-24.10%2B-00B5E2?style=flat-square)](https://openwrt.org)
[![Release](https://img.shields.io/github/v/release/zcq100/luci-theme-shadcn?style=flat-square&label=release)](https://github.com/zcq100/luci-theme-shadcn/releases/latest)

**English** | [简体中文](README.zh-CN.md)

<p align="center">
  <img src="docs/preview-light.png" width="49%" alt="Light theme">
  <img src="docs/preview-dark.png" width="49%" alt="Dark theme">
</p>

## Features

- **shadcn/ui design language** — neutral palette, CSS variable tokens, consistent focus rings and radii
- **Light and dark modes** — follows the system preference or can be toggled manually
- **Responsive layout** — sidebar on desktop, drawer on mobile; tables stack into cards on narrow screens
- **Complete control coverage** — forms, tables, dropdowns, tabs, dynamic lists, modals and configuration diffs
- **Zero runtime dependencies** — plain static CSS and ucode templates, no external fonts or network requests

## Installation

Install the latest release directly on the router (OpenWrt snapshot / 25.12+, apk-tools 3):

```sh
# Import the signing key
uclient-fetch -O /etc/apk/keys/shadcn.ec.pub \
  https://github.com/zcq100/luci-theme-shadcn/releases/latest/download/shadcn.ec.pub

# Download and install the latest version
uclient-fetch -O /tmp/luci-theme-shadcn.apk \
  https://github.com/zcq100/luci-theme-shadcn/releases/latest/download/luci-theme-shadcn.apk
apk add /tmp/luci-theme-shadcn.apk
```

OpenWrt 24.10 and earlier use opkg and require building from source. See the [installation guide](docs/INSTALL.md) for SDK builds, manual deployment, removal and rollback.

## Customization

Change `--primary` and `--ring` at the top of `htdocs/luci-static/shadcn/cascade.css` to recolor the theme. See the [configuration guide](docs/CONFIGURATION.md) for the full palette, icons, menu and dark mode options.

## Documentation

| Document | Contents |
|---|---|
| [Installation](docs/INSTALL.md) | Release install, SDK builds, manual deployment, removal and rollback |
| [Configuration](docs/CONFIGURATION.md) | Palette, icons, menu and dark mode |
| [Design and implementation](docs/DESIGN.md) | How the shadcn design system maps to LuCI |
| [Development](docs/DEVELOPMENT.md) | Layout, local preview, checks and known limitations |
| [Changelog](docs/CHANGELOG.md) | Version history |

Documents are written in Simplified Chinese.

## Compatibility

- OpenWrt **24.10 or later** / LuCI master (ucode templates)
- Architecture-independent (`noarch`)
- Lua templates required by 23.05 and earlier are not included

## License

[Apache-2.0](LICENSE). Page scaffolding and some compatibility code are based on [LuCI](https://github.com/openwrt/luci) (Apache-2.0). Icon style inspired by [Lucide](https://lucide.dev).
