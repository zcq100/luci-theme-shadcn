# 设计与实现

## shadcn 能直接用吗？

**组件不能，设计系统可以。**

| | shadcn/ui | LuCI |
|---|---|---|
| 渲染 | React + Radix | 原生 JS（`luci.js` / `ui.js` / `cbi.js`）生成 DOM |
| 样式 | Tailwind 工具类 | 主题只提供 CSS，类名由 LuCI 决定 |
| 主题机制 | `<ThemeProvider>` + `.dark` 类 | `luci.main.mediaurlbase` + `html[data-darkmode]` |

shadcn 的按钮、Dialog、Select 都是 React 组件，而 LuCI 的表单控件由 CBI 生成固定 DOM（`.cbi-value`、`.cbi-dropdown`、`.cbi-section-table` 等）。主题无法替换结构，只能为这些既有类名编写样式，因此不能把 shadcn 组件直接移植进来。

可移植的是设计 token 层，本主题采用以下映射：

1. 使用 shadcn 的 HSL 变量命名与取值：`--background`、`--foreground`、`--primary`、`--muted-foreground`、`--border`、`--ring`、`--radius`；
2. 明暗主题通过 `html[data-darkmode="true"]` 覆盖同一组变量，对应 LuCI 自带的 `data-darkmode` 属性；
3. 圆角、焦点环、阴影、间距全部由 token 派生；
4. 图标使用 Lucide 线性风格的内联 SVG。

## 实现要点

- **模板**：`header.ut` 输出 `<html>`、色板脚本、侧栏和顶栏，并保持 `#maincontent` 打开；`footer.ut` 关闭容器并加载 `menu-shadcn`。`#indicators`、`#tabmenu`、`#modemenu`、`#topmenu` 等 ID 与 LuCI 约定一致，`ui.showIndicator()`、`ui.tabs` 等原生逻辑无需修改。
- **菜单**：通过 `ui.menu.load()` + `ui.menu.getChildren()` 渲染。分组可折叠，当前分组默认展开，`logout` 固定在侧栏底部。
- **深色模式**：`header.ut` 在首屏绘制前读取 `localStorage` 或 `prefers-color-scheme`，写入 `html[data-darkmode]`；顶栏按钮负责切换并持久化。
- **登录页**：`sysauth.ut` 是独立居中卡片，不依赖 `ui.instantiateView`，保留官方模板的 HTTPS 自动跳转探测。
- **页面布局契约**：`#maincontent` 是唯一布局容器（宽度、padding、底部操作栏都以它为准）；`#view` 为 `display: contents`，`.cbi-map` 不产生视觉盒模型。因此 JS 视图、模板视图和 `form.Map` 页面的外层几何保持一致。
- **移动端表格**：利用 LuCI 写在 `.td` 上的 `data-title` 属性，把 `.cbi-section-table` 以及软件包页面的 `#packages` 表格转换为卡片布局。

## 样式组织

`cascade.css` 是唯一产物，按区块组织：

1. 设计 token（明暗两套）
2. 基础元素与排版
3. 应用外壳（侧栏、顶栏、内容区）
4. 组件（按钮、表单、下拉、表格、模态框、标签页、提示等）
5. 响应式规则（`1024px`、`900px`、`720px`）

没有运行时依赖，也不需要在路由器上构建。若希望进一步接入 Tailwind，可以用 CLI 将 `cascade.css` 预编译为单文件；产物仍必须是静态 CSS。
