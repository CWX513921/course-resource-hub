# 课程资源共享平台

一个基于 Vue 3 + Node.js + MySQL 的课程资源共享平台，支持教师上传课件、学生下载收藏、资源分类和访问统计。

## 技术栈

- **前端**: Vue 3 + Element Plus + Pinia + Vue Router + ECharts + Axios
- **后端**: Node.js + Express + JWT + Multer + MySQL2
- **数据库**: MySQL 8.0
- **部署**: Nginx

## 本地开发

### 前置条件

- Node.js >= 18.x
- MySQL 8.0

### 1. 数据库初始化

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seeds.sql
```

默认管理员账号: admin / 123456

### 2. 后端启动

```bash
cd backend
cp .env.example .env
# 修改 .env 中的数据库连接信息
npm install
npm run dev
```

后端默认运行在 http://localhost:3000

### 3. 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 http://localhost:5173，已配置代理将 `/api` 请求转发到后端。

## 生产构建

```bash
# 构建前端
cd frontend
npm run build
# 产物在 frontend/dist 目录

# 启动后端
cd backend
npm start
```

## Nginx 配置

参考项目根目录的 `nginx.conf`，修改其中的路径为实际部署路径。

## API 文档

基础路径: `/api/v1`

| 模块 | 接口 | 说明 |
|------|------|------|
| 认证 | POST /auth/login | 用户登录 |
| 认证 | POST /auth/register | 用户注册 |
| 资源 | GET /resources | 资源列表(筛选分页) |
| 资源 | GET /resources/:id | 资源详情 |
| 资源 | POST /resources | 上传资源(教师) |
| 资源 | PUT /resources/:id | 更新资源 |
| 资源 | DELETE /resources/:id | 删除资源 |
| 资源 | POST /resources/:id/download | 下载资源 |
| 分类 | GET /categories/tree | 分类树 |
| 收藏 | GET /favorites | 我的收藏 |
| 收藏 | POST /favorites/:resourceId | 收藏 |
| 收藏 | DELETE /favorites/:resourceId | 取消收藏 |
| 统计 | GET /stats/overview | 概览统计 |
| 统计 | GET /stats/resources/top-downloaded | 下载Top10 |
| 统计 | GET /stats/categories | 分类统计 |
| 用户 | GET /users | 用户列表(管理员) |
| 用户 | PUT /users/:id/status | 启用/禁用用户 |
