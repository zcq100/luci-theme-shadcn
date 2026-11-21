# 安装

## 系统要求

- **OpenWrt 24.10 及以后**（LuCI 使用 ucode 模板）
- 包本身与架构无关（`noarch`），任何 OpenWrt 目标设备均可使用

> OpenWrt 23.05 及更早版本使用 Lua 模板，本主题不包含 `luasrc/view/themes/` 下的文件，无法直接使用。

## 方式一：构建并安装 apk

适用于 **OpenWrt snapshot / 25.12 及以后**（apk-tools 3）。

```sh
# 需要 apk-tools 3（OpenWrt SDK 自带）
APK=/path/to/openwrt-sdk/staging_dir/host/bin/apk ./scripts/build-apk.sh
# -> dist/luci-theme-shadcn-<version>-r<release>.apk
```

导入公钥后安装：

```sh
scp dist/shadcn.ec.pub root@192.168.1.1:/etc/apk/keys/
scp dist/luci-theme-shadcn-*.apk root@192.168.1.1:/tmp/

ssh root@192.168.1.1 'apk add /tmp/luci-theme-shadcn-*.apk'
```

也可以直接通过 LuCI 网页上传安装。

不想导入公钥时，可单次放行未签名/未知密钥的包：

```sh
apk add --allow-untrusted /tmp/luci-theme-shadcn-*.apk
```

安装脚本会自动登记主题；若当前主题是 Bootstrap 或未设置，会自动切换到 shadcn，并清理 LuCI 缓存。

卸载：

```sh
apk del luci-theme-shadcn
```

若当前主题是 shadcn，卸载脚本会回退到 `/luci-static/bootstrap`。

## 方式二：OpenWrt SDK / 固件编译

### LuCI feed 布局

把仓库放到 `feeds/luci/themes/luci-theme-shadcn`，使用仓库根目录的 `Makefile`：

```sh
make menuconfig          # LuCI -> Themes -> luci-theme-shadcn
make package/luci-theme-shadcn/compile V=s
```

### 独立 SDK 布局

```sh
mkdir -p package/luci-theme-shadcn
cp -a htdocs ucode root Makefile.sdk package/luci-theme-shadcn/
mv package/luci-theme-shadcn/Makefile.sdk package/luci-theme-shadcn/Makefile

make package/luci-theme-shadcn/compile V=s
```

生成的 `.ipk` / `.apk` 位于 SDK 的 `bin/` 目录，安装后会自动登记主题。

## 方式三：手动部署

```sh
ROUTER=root@192.168.1.1

ssh $ROUTER 'mkdir -p /www/luci-static/resources \
  /usr/share/ucode/luci/template/themes'

scp -r htdocs/luci-static/shadcn          $ROUTER:/www/luci-static/
scp htdocs/luci-static/resources/menu-shadcn.js \
    $ROUTER:/www/luci-static/resources/
scp -r ucode/template/themes/shadcn       $ROUTER:/usr/share/ucode/luci/template/themes/
scp root/etc/uci-defaults/30_luci-theme-shadcn $ROUTER:/etc/uci-defaults/

ssh $ROUTER '
  uci set luci.themes.SHADCN="/luci-static/shadcn"
  uci set luci.main.mediaurlbase="/luci-static/shadcn"
  uci commit luci
  rm -f /tmp/luci-indexcache.*
  /etc/init.d/rpcd reload
'
```

随后强制刷新浏览器缓存（Ctrl/Cmd + Shift + R）。

## 回退或切换主题

```sh
# 回到官方 Bootstrap
uci set luci.main.mediaurlbase='/luci-static/bootstrap'
uci commit luci

# 查看已登记的主题
uci show luci.themes
```

## 重新打包 apk

`scripts/build-apk.sh` 只依赖 apk-tools 3：

```sh
APK=/path/to/openwrt-sdk/staging_dir/host/bin/apk ./scripts/build-apk.sh
```

脚本会用 `unshare -r` 把包内文件属主设为 `root:root`；若系统不允许 user namespace，则需要以 root 运行。

签名密钥默认读取 `.signing/shadcn.ec.key`（已 gitignore），存在时自动签名并导出 `dist/shadcn.ec.pub`。也可以用 `SIGN_KEY=/path/to/your.key` 指定其他 EC 私钥；没有密钥时生成未签名包，安装需要 `apk add --allow-untrusted`。

## 安装后的路径

| 仓库路径 | 路由器路径 |
|---|---|
| `htdocs/luci-static/shadcn/` | `/www/luci-static/shadcn/` |
| `htdocs/luci-static/resources/menu-shadcn.js` | `/www/luci-static/resources/menu-shadcn.js` |
| `ucode/template/themes/shadcn/` | `/usr/share/ucode/luci/template/themes/shadcn/` |
| `root/etc/uci-defaults/30_luci-theme-shadcn` | `/etc/uci-defaults/30_luci-theme-shadcn` |
