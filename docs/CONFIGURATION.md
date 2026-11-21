# 自定义

## 配色与圆角

所有可调项都在 `htdocs/luci-static/shadcn/cascade.css` 顶部的 `:root`：

```css
:root {
	--background: 0 0% 100%;      /* HSL 三段值，不带 hsl() */
	--foreground: 240 10% 3.9%;
	--primary: 240 5.9% 10%;      /* 主按钮、选中项 */
	--muted-foreground: 240 3.8% 46.1%;
	--border: 240 5.9% 90%;
	--ring: 240 6% 32%;           /* 焦点环 */
	--radius: 0.75rem;
	--sidebar-width: 264px;
	--font-sans: ui-sans-serif, system-ui, ...;
}
```

深色主题是同一组变量，定义在 `html[data-darkmode="true"]` 下。换主题色只需修改 `--primary` 与 `--ring`；保持中性灰即可维持 shadcn 的观感，不建议叠加渐变。

改完后记得同步提升 `header.ut` 中 `cascade.css?v=` 的版本号，避免浏览器使用旧缓存。

## 品牌图标

替换 `htdocs/luci-static/shadcn/logo.svg`，favicon 与侧栏共用同一个文件。

## 菜单图标

编辑 `htdocs/luci-static/resources/menu-shadcn.js` 顶部的 `ICONS` 表。key 是 LuCI 菜单节点名（`status`、`system`、`network`、`services`、`vpn`、`nas`、`docker` 等），未命中时回退到 `default`。

图标为内联 SVG，不依赖图标字体或网络请求。

## 网络区域颜色

LuCI 的 `ifacebox-head`、`zonebadge` 等元素带有内联背景色，主题保留这些内联样式，以便继续用颜色区分网络区域。

## 明暗模式

- 首次访问跟随系统 `prefers-color-scheme`；
- 手动切换后写入 `localStorage` 的 `shadcn-theme` 键；
- 首屏渲染前由 `header.ut` 内联脚本应用，避免闪烁。
