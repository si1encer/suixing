# 用 GitHub Pages 在安卓手机上打开随行

GitHub 仓库不会自动变成网站。完成下面几步后，手机用浏览器打开一个网址即可使用，不需要应用商店。

## 1. 把 App 文件放进仓库

先解压 `随行旅行清单.zip`。

如果仓库是空的，最简单的做法是把压缩包里的这些文件和文件夹放在**仓库最外层**：

- `index.html`
- `config.js`
- `app.js`
- `sync.js`
- `styles.css`
- `manifest.webmanifest`
- `sw.js`
- `schema.sql`
- `使用说明.md`
- `vendor/`
- `assets/`

不要在仓库外面再套一层 `suixing/` 文件夹，除非你愿意在 GitHub Pages 设置里选择那个子目录。

如果通过 GitHub 网页上传，选择“Add file → Upload files”，把上述文件一起上传，然后点 “Commit changes”。

## 2. 填写一次 Supabase 地址

在 Supabase 项目中打开 `Project Settings → API`，复制：

- `Project URL`
- `anon public key`

回到 GitHub，打开仓库里的 `config.js`，点编辑，改成：

```js
window.SUIXING_CLOUD_CONFIG = {
  url: "https://你的项目编号.supabase.co",
  key: "你的 anon public key"
};
```

保存并提交。

`anon public key` 本来就是用于网页客户端的公开密钥，可以放在 GitHub 公开仓库中。真正保护行程的是数据库成员权限策略。

**绝对不要填写 `service_role`、`secret key` 或其他服务端密钥。**

如果暂时不填写 `config.js`，也可以在两台手机上分别进入头像页手动填写，但填写一次 `config.js` 明显更方便。

## 3. 在 Supabase 初始化数据库

这两个设置只需要做一次：

1. 打开 Supabase 的 `Authentication → Providers`，开启 `Anonymous Sign-ins`。
2. 打开 `SQL Editor`，把仓库里的 `schema.sql` 全文粘贴进去并运行。

如果看到 `Success. No rows returned`，通常表示脚本已经执行完成。

## 4. 开启 GitHub Pages

1. 进入 GitHub 仓库。
2. 打开 `Settings → Pages`。
3. 在 “Build and deployment” 中把 Source 选为 `Deploy from a branch`。
4. 分支选择 `main`。
5. 文件夹：
   - App 文件在仓库最外层：选择 `/ (root)`
   - App 文件在 `suixing` 子文件夹：选择 `/suixing`
6. 点 `Save`，等待 1–3 分钟。

GitHub 会在页面顶部显示网站地址，格式通常是：

```text
https://你的GitHub用户名.github.io/仓库名/
```

如果 App 放在子文件夹，地址是：

```text
https://你的GitHub用户名.github.io/仓库名/suixing/
```

GitHub Pages 对公开仓库最容易使用。如果仓库是私有的，可能需要付费套餐；也可以改用免费的 Cloudflare Pages 连接该私有仓库。

## 5. 两台安卓手机配对

先在手机上打开 GitHub Pages 地址：

1. 用安卓 Chrome 打开网址。
2. 第一台手机创建“我们的旅行”，生成邀请码。
3. 把网址和邀请码发给另一台手机。
4. 第二台手机打开同一个网址，输入邀请码加入。
5. 两台手机都点 Chrome 右上角菜单，选择“安装应用”或“添加到主屏幕”。

App 会根据 `config.js` 自动创建匿名设备身份，因此这里**不需要输入 Supabase 密码**。你们各自独立登录为匿名设备用户，再通过邀请码进入同一个旅行空间。

### 加入电脑或第三台设备

当前版本把每个浏览器设备视为一个独立匿名身份，所以手机和电脑不能共用同一个匿名会话。共享空间最多允许 6 台设备：

1. 在 Supabase SQL Editor 对已有项目运行 `migrations/multi-device.sql`。
2. 在 GitHub 更新 `sync.js` 和 `sw.js`，保留已经填写好的 `config.js`。
3. 电脑用 GitHub Pages 网址打开 App 并刷新。
4. 使用同一个邀请码加入。

加入成功后，状态会显示“3/6 台设备”，不会影响原有两台手机和已有数据。

## 常见问题

### 打开后只有首页，没有自动弹出配对

进入右上角头像页，点“情侣云端同步”。如果显示“已连接 Supabase”，直接创建或加入空间。

### 提示数据库表不存在

`schema.sql` 没有在正确的 Supabase 项目中运行。回到该项目的 SQL Editor 重新完整运行一次。

### 提示无法连接或项目暂停

Supabase Free 项目一周不活跃后可能暂停。进入 Supabase Dashboard 恢复项目，再刷新 App。

### 页面显示 404

通常是 `index.html` 不在 GitHub Pages 所选的发布目录中。重新进入 `Settings → Pages`，确认 App 文件所在的文件夹。

### 修改代码后手机仍看到旧版本

先刷新一次页面。App 会通过网络优先、离线回退的方式更新；安装在桌面的版本也可以关闭后重新打开。
