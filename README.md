# luci-theme-shadcn

shadcn/ui 风格的 OpenWrt LuCI 主题：响应式布局、明暗双主题、纯静态资源。

[![License](https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square)](LICENSE)
[![OpenWrt](https://img.shields.io/badge/OpenWrt-24.10%2B-00B5E2?style=flat-square)](https://openwrt.org)
[![Release](https://img.shields.io/github/v/release/zcq100/luci-theme-shadcn?style=flat-square&label=release)](https://github.com/zcq100/luci-theme-shadcn/releases/latest)

<p align="center">
  <img src="docs/preview-light.png" width="49%" alt="浅色主题">
  <img src="docs/preview-dark.png" width="49%" alt="深色主题">
</p>

## 特性

- **shadcn/ui 设计语言**：中性色板、CSS 变量 token、统一的焦点环与圆角
- **明暗双主题**：跟随系统，也可手动切换并记住选择
- **响应式布局**：桌面侧边栏，移动端抽屉；窄屏表格自动堆叠为卡片
- **完整控件覆盖**：表单、表格、下拉、标签页、动态列表、模态框、配置差异
- **零运行时依赖**：纯静态 CSS + ucode 模板，无外部字体或网络请求

## 安装

在路由器上直接下载最新 Release 安装（OpenWrt snapshot / 25.12+，apk-tools 3）：

```sh
# 导入签名公钥
uclient-fetch -O /etc/apk/keys/shadcn.ec.pub \
  https://github.com/zcq100/luci-theme-shadcn/releases/latest/download/shadcn.ec.pub

# 下载并安装最新版本
uclient-fetch -O /tmp/luci-theme-shadcn.apk \
  https://github.com/zcq100/luci-theme-shadcn/releases/latest/download/luci-theme-shadcn.apk
apk add /tmp/luci-theme-shadcn.apk
```

OpenWrt 24.10 及更早使用 opkg，需要从源码编译；SDK 编译、手动部署、卸载与回退见 **[安装文档](docs/INSTALL.md)**。

## 自定义

修改 `htdocs/luci-static/shadcn/cascade.css` 顶部的 `--primary` 与 `--ring` 即可换主题色。配色、图标、菜单与明暗模式的完整说明见 **[配置文档](docs/CONFIGURATION.md)**。

## 文档

| 文档 | 内容 |
|---|---|
| [安装](docs/INSTALL.md) | apk、SDK 编译、手动部署、卸载与回退 |
| [配置](docs/CONFIGURATION.md) | 配色、图标、菜单、明暗模式 |
| [设计与实现](docs/DESIGN.md) | shadcn 设计系统如何映射到 LuCI |
| [开发](docs/DEVELOPMENT.md) | 目录结构、本地预览、检查命令、已知限制 |
| [更新记录](docs/CHANGELOG.md) | 版本历史 |

## 兼容性

- OpenWrt **24.10 及以后** / LuCI master（ucode 模板）
- 架构无关（`noarch`）
- 不包含 23.05 及更早版本所需的 Lua 模板

## 许可证

[Apache-2.0](LICENSE)。页面骨架与部分兼容代码参考自 [LuCI](https://github.com/openwrt/luci)（Apache-2.0），图标风格来自 [Lucide](https://lucide.dev)。
