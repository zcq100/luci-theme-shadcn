# 开发

## 目录结构

```
luci-theme-shadcn/
├── Makefile                              # LuCI feed 布局（feeds/luci/themes/...）
├── Makefile.sdk                          # 独立 SDK 布局（package/luci-theme-shadcn）
├── scripts/build-apk.sh                  # 生成 dist/*.apk
├── dist/                                 # 构建产物（apk 与签名公钥）
├── htdocs/luci-static/shadcn/
│   ├── cascade.css                       # 全部样式（token + 组件 + 响应式）
│   └── logo.svg                          # 品牌角标 / favicon
├── htdocs/luci-static/resources/
│   └── menu-shadcn.js                    # 侧边栏、标签页、移动端抽屉、明暗切换
├── ucode/template/themes/shadcn/
│   ├── header.ut                         # 页面骨架（侧栏 + 顶栏 + 内容容器）
│   ├── footer.ut                         # 关闭容器、版本信息、加载菜单
│   └── sysauth.ut                        # 登录页
├── root/etc/uci-defaults/30_luci-theme-shadcn
├── preview/index.html                    # 纯静态设计预览（不依赖 LuCI）
└── docs/                                 # 文档与预览截图
```

## 本地预览

`preview/index.html` 复刻了 LuCI 的真实 DOM 结构，直接用浏览器打开即可，不需要路由器：

```sh
xdg-open preview/index.html          # 浅色
xdg-open 'preview/index.html#dark'   # 深色
```

预览包含表单、下拉、动态列表、表格、接口徽章、配置差异和吸底操作栏。它只是静态还原，不包含 LuCI 的 JS 行为。

预览截图：[浅色](preview-light.png) · [深色](preview-dark.png) · [登录页](preview-login.png)

## 检查

```sh
# 模板语法（SDK 或安装有 ucode 的环境）
ucode -T ucode/template/themes/shadcn/*.ut

# JS 语法
node --check htdocs/luci-static/resources/menu-shadcn.js

# 构建并验证 apk
APK=/path/to/sdk/staging_dir/host/bin/apk ./scripts/build-apk.sh
apk verify dist/luci-theme-shadcn-*.apk
```

## 已知限制

- 只包含 ucode 模板，适用于 OpenWrt 24.10+ / LuCI master。
- shadcn 的交互组件（Radix Dialog、Dropdown）没有移植；下拉与模态框沿用 LuCI 自带实现，仅做视觉重绘。
- 侧边栏布局与官方 Bootstrap 的顶栏布局差异较大。若第三方插件写死了 `header .nav` 之类的选择器，可能需要单独适配。
- `preview/` 仅用于开发预览，不会被打进安装包。
- 截图来自仓库内的 `preview/` 静态预览页，不是真实路由器截图。
