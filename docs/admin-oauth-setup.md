# Decap CMS 后台登录配置（OAuth 网关）

## 背景
- 网站托管在 GitHub Pages（`https://volcanolee4.github.io/Website/`），内容后台在 `/admin`（Decap CMS）。
- Decap CMS 的 `github` backend 需要一个 OAuth 网关才能登录（GitHub 要求服务端中转授权）。
- 方案：用 Cloudflare Pages 免费托管一个 OAuth 网关（社区项目 `i40west/netlify-cms-cloudflare-pages`）。
- 说明：Netlify 的 Git Gateway（老的「邮箱登录」免费方案）已弃用，故改用 github backend + 自托管网关。

## 一次性准备（约 15 分钟，只需做一次）

### 第 1 步：创建 GitHub OAuth App
1. 登录 GitHub → 右上头像 → **Settings → Developer settings → OAuth Apps → New OAuth App**。
2. 填写：
   - **Application name**：`HYGOAL CMS`（随意）
   - **Homepage URL**：`https://volcanolee4.github.io/Website/`
   - **Authorization callback URL**：先随便填一个占位（如 `https://example.com/api/callback`），第 3 步再回来改成真实地址。
3. **Register application** → 记下 **Client ID** → 点 **Generate a new client secret** → 记下 **Client Secret**（只显示一次，务必保存）。

### 第 2 步：把 OAuth 网关部署到 Cloudflare Pages
1. 先把网关源码 fork 到你的账号：打开 `https://github.com/i40west/netlify-cms-cloudflare-pages` → 点 **Fork**。
2. 登录 Cloudflare（`cloudflare.com`，免费注册、无需信用卡）→ **Workers & Pages → Create → Pages → Connect to Git**。
3. 授权 GitHub，选择你刚 fork 的 `netlify-cms-cloudflare-pages` 仓库。
4. 构建设置：
   - **Build command**：留空
   - **Build output directory**：`static`
   （根目录的 `functions/` 会被 Cloudflare 自动识别为 Pages Functions，无需配置。）
5. 部署完成后，进入该项目 **Settings → Environment variables**，添加两个变量：
   - `GITHUB_CLIENT_ID` = 第 1 步的 Client ID
   - `GITHUB_CLIENT_SECRET` = 第 1 步的 Client Secret
6. 保存并重新部署，得到网关地址，形如 `https://hygoal-oauth.pages.dev`。

### 第 3 步：回填 GitHub OAuth App 的 callback URL
回到第 1 步的 OAuth App，把 **Authorization callback URL** 改成真实地址：
`https://<你的网关地址>.pages.dev/api/callback`

### 第 4 步：更新 config.yml 的 base_url
把 `apps/web/public/admin/config.yml` 里 `backend.base_url` 的 `CHANGE-ME` 换成你的网关地址（不含 `/api`）：

```yaml
backend:
  name: github
  repo: volcanolee4/Website
  branch: main
  site_domain: https://volcanolee4.github.io/Website/
  base_url: https://<你的网关地址>.pages.dev
  auth_endpoint: /api/auth
```

### 第 5 步：提交推送，重新部署网站
```bash
cd D:/Code/Books/DaoHistory/web_project/Website
git add -A && git commit -m "配置 Decap CMS OAuth 网关" && git push
```
等 GitHub Actions 部署完（约 1-2 分钟）。

### 第 6 步：验证 + 添加客户为协作者
1. 打开 `https://volcanolee4.github.io/Website/admin/` → 点 **Login with GitHub**。
2. 用你的 GitHub 账号授权登录，能进后台看到「站点设置 / 产品分类 / 产品 / 产品详情」即成功。
3. 让客户注册一个 GitHub 账号；然后你在 GitHub 仓库 `volcanolee4/Website` → **Settings → Collaborators → Add people**，把客户账号加为协作者（需要 **Write** 权限）。
4. 客户之后用自己 GitHub 账号登录 `/admin` 即可改内容。

## 工作原理（简单版）
- 客户在 `/admin` 点登录 → 网关把客户转到 GitHub 授权页 → 授权后回调网关 → 网关把 token 传回 `/admin`。
- 之后客户在后台改内容 = 用客户的 GitHub 身份向仓库提交（每次保存一个 commit，自动触发重新部署，约 1-2 分钟上线）。

## 常见问题
- **登录后报 callback 不匹配**：检查第 3 步的 callback URL 是否与「网关地址 + `/api/callback`」完全一致。
- **客户登录后看不到仓库内容**：确认已把他加为 Collaborator，且权限是 Write 或 Admin。
- **图片想本地上传（而非贴 URL）**：需要把 `config.yml` 里图片字段从 `widget: string` 改成 `widget: image`，并配置 media_folder 上传到仓库（会改变当前「图片全走外部 CDN」的架构）。
