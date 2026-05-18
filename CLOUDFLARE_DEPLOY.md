# Cloudflare 全栈部署指南

本项目已改造为 Cloudflare 全栈架构：前端 Pages + 后端 Workers + 数据库 D1 + 文件存储 R2。

---

## 前置条件

- Cloudflare 账户（已有）
- Node.js >= 18
- Wrangler CLI（已安装）

---

## 第一步：登录 Wrangler

```bash
cd worker
npx wrangler login
```
浏览器会打开 Cloudflare 授权页面，点击允许。

---

## 第二步：创建 D1 数据库

```bash
npx wrangler d1 create course-sharing-db
```

命令执行后会输出 `database_id`，**复制它**，然后更新 `worker/wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "course-sharing-db"
database_id = "粘贴你的database_id"
```

---

## 第三步：初始化数据库表结构

```bash
# 远程执行（生产环境）
npx wrangler d1 execute course-sharing-db --file=../database/schema.sql --remote
npx wrangler d1 execute course-sharing-db --file=../database/seeds.sql --remote

# 或本地调试用
npx wrangler d1 execute course-sharing-db --file=../database/schema.sql --local
npx wrangler d1 execute course-sharing-db --file=../database/seeds.sql --local
```

---

## 第四步：创建 R2 存储桶

```bash
npx wrangler r2 bucket create course-uploads
```

---

## 第五步：部署后端 Worker

```bash
cd worker
npx wrangler deploy
```

部署成功后，会输出 Worker URL，格式如：
```
https://course-sharing-api.3105075752.workers.dev
```

**记下这个 URL**，前端需要用它作为 API 地址。

---

## 第六步：部署前端到 Cloudflare Pages

### 方式A：通过 Dashboard 手动部署

1. 先构建前端：
```bash
cd frontend
npm run build
```

2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create application → Pages

3. 选择 "Upload assets"（直接上传）

4. 项目名称：`course-sharing-frontend`

5. 上传 `frontend/dist` 目录

6. 部署完成后得到 URL，如：`https://course-sharing-frontend.pages.dev`

### 方式B：通过 Wrangler CLI 部署

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=course-sharing-frontend
```

---

## 第七步：配置前端 API 地址

前端需要知道后端 Worker 的地址。有两种方式：

### 方式A：修改前端代码（推荐）

编辑 `frontend/src/utils/request.js`，将 baseURL 改为你的 Worker URL：

```javascript
const request = axios.create({
  baseURL: 'https://course-sharing-api.3105075752.workers.dev/api/v1',
  timeout: 10000
})
```

然后重新构建并部署前端：
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=course-sharing-frontend
```

### 方式B：使用 Pages Functions 做代理（避免跨域）

在 `frontend/functions` 目录创建代理：

```javascript
// frontend/functions/api/[[path]].js
export async function onRequest(context) {
  const url = new URL(context.request.url)
  const targetUrl = `https://course-sharing-api.3105075752.workers.dev/api${url.pathname.replace('/api', '')}${url.search}`
  return fetch(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body,
  })
}
```

---

## 第八步：自定义域名（可选）

1. 在 Cloudflare Dashboard 中，进入你的 Pages 项目
2. Custom domains → Add domain
3. 输入你的域名（需已在 Cloudflare 管理 DNS）

同理可为 Worker 绑定自定义域名。

---

## 验证部署

1. 访问前端 URL，应看到登录页面
2. 注册账号 → 登录 → 浏览资源 → 收藏
3. 检查 Worker 日志：`npx wrangler tail`

---

## 本地开发调试

```bash
cd worker
npx wrangler dev
```
Worker 会在 http://localhost:8787 启动，前端代理指向此地址即可联调。

---

## 项目架构总览

```
Cloudflare 部署架构：

用户浏览器
    ↓
Cloudflare Pages (前端静态站点)
    ↓ /api 请求
Cloudflare Workers (Hono 后端API)
    ↓
Cloudflare D1 (SQLite数据库)
    ↓ 文件存储
Cloudflare R2 (对象存储)
```
