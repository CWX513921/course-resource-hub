# AGENTS.md — 课程资源共享平台 AI 编码规则文档

## 最高优先规则
1. 在开始任何编码、拆任务、写实现或调用外部 AI 工具之前，必须先审核全部 7 份项目文档：PRD.md、Frontend.md、Backend.md、API.md、task.md、context_state.md、AGENTS.md。
2. 只要任意文档中存在“审核修订记录”或“审核修订”内容，必须先依据这些修订记录重新编排、整合并规划相关文档内容，确保文档结构、术语、接口、任务顺序和执行约束已经吸收修订结果。
3. 完成上述整理前，不得直接进入编码阶段，也不得忽略修订记录继续实现。
4. 当用户在 AI 编程工具中输入“了解项目规则，查看 AGENTS.md 文档”时，必须立即先执行本规则，再开始后续编码引导。

## 项目概述
本项目旨在解决教育资源分散、共享不便的问题，构建一个统一的课程资源共享平台。核心目标是完成一个可运行的 Web 应用原型，支持教师上传课件、学生下载收藏、资源分类和访问统计。项目覆盖用户登录、数据增删改查、条件查询、状态流转、基础统计和权限控制等核心能力，为教师和学生提供便捷的资源管理与获取渠道。

## 技术栈
- **前端框架与库**: Vue 3, Element Plus, Pinia (状态管理), Vue Router, ECharts (图表)
- **后端框架与中间件**: Node.js, Express, JSON Web Token (JWT), Multer (文件上传)
- **数据库与缓存**: MySQL 8.0
- **构建工具**: Vite (前端), npm/yarn
- **测试框架**: Jest (后端单元测试), Vue Test Utils (前端组件测试)
- **部署**: Nginx (反向代理与静态文件服务)

## 项目结构
项目采用前后端分离架构，主要目录结构如下：
```
course-resource-platform/
├── frontend/                # Vue 3 前端项目
│   ├── src/
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # 公共组件与业务组件
│   │   ├── composables/    # 组合式函数
│   │   ├── layouts/        # 布局组件
│   │   ├── router/         # 路由配置
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── views/          # 页面视图组件
│   │   └── App.vue, main.js
│   └── package.json
├── backend/                 # Node.js + Express 后端项目
│   ├── src/
│   │   ├── controllers/    # 控制器层
│   │   ├── middlewares/    # 中间件（认证、权限）
│   │   ├── models/         # 数据库模型
│   │   ├── routes/         # 路由定义
│   │   ├── services/       # 业务逻辑层
│   │   ├── utils/          # 工具函数
│   │   └── app.js, server.js
│   ├── uploads/            # 上传文件存储目录
│   └── package.json
├── database/                # 数据库脚本
│   ├── schema.sql          # 表结构创建脚本
│   └── seeds.sql           # 初始数据
├── docs/                    # 项目文档（PRD, 设计等）
├── nginx.conf               # Nginx 配置文件
└── docker-compose.yml       # 容器化部署配置（可选）
```

## API 契约摘要
- **认证方式**: JWT Bearer Token。客户端在请求头中携带 `Authorization: Bearer <token>`。
- **基础 URL**: `/api/v1`
- **核心接口列表**:
    - **认证**: `POST /auth/login`, `POST /auth/register`
    - **资源**: `GET /resources` (列表与筛选), `GET /resources/:id`, `POST /resources` (上传), `PUT /resources/:id`, `DELETE /resources/:id`
    - **分类**: `GET /categories/tree`
    - **收藏**: `POST /favorites/:resourceId`, `DELETE /favorites/:resourceId`, `GET /favorites`
    - **统计**: `GET /stats/overview`, `GET /stats/resources/top-downloaded`
    - **用户管理 (管理员)**: `GET /users`, `PUT /users/:id/status`
- **统一响应格式**: `{ "code": 0, "message": "success", "data": {...} }`

## 任务执行指南
根据 `task.md`，开发任务按以下顺序执行，存在明确的依赖关系：
1.  **T-01 (项目初始化)** -> **T-02 (数据库设计)** -> **T-03 (用户认证)** -> **T-04 (资源管理后端API)** -> **T-05 (资源浏览前端)** -> **T-06 (资源上传前端)** -> **T-07 (收藏功能)** -> **T-08 (统计报表)** -> **T-09 (集成测试)** -> **T-10 (部署文档)**。
2.  **关键依赖**: T-04 依赖 T-02 和 T-03；T-05 和 T-06 依赖 T-04；T-07 依赖 T-03 和 T-05；T-08 依赖 T-04 和 T-05。
3.  **验收标准**: 每个任务的验收标准已在 `task.md` 中详细列出，完成时需逐项核对。

## 开发规则

### 代码规范
- **代码风格**: 遵循 ESLint 和 Prettier 配置，保持代码格式一致。前端遵循 Vue 3 风格指南，后端遵循 Express 最佳实践。
- **命名规范**:
    - 文件/目录: 前端组件使用 `PascalCase.vue`，其他使用 `kebab-case`。后端模块使用 `camelCase.js`。
    - 变量/函数: 使用 `camelCase`。
    - 常量: 使用 `UPPER_SNAKE_CASE`。
    - 数据库表/字段: 使用 `snake_case`。
- **注释要求**: 关键函数、复杂逻辑、API 接口必须添加注释。鼓励使用 JSDoc (前端) 和 TSDoc (后端) 进行类型和功能说明。

### 安全要求
- **输入验证**: 所有用户输入（请求参数、表单数据）必须在后端进行严格的类型、格式和长度校验。
- **认证授权**: 所有受保护 API 必须通过 JWT 中间件验证。关键操作（如删除资源、管理用户）需检查用户角色权限。
- **数据加密**: 用户密码必须使用 `bcrypt` 等强哈希算法加密存储。敏感数据传输使用 HTTPS。
- **其他**: 防止 SQL 注入（使用参数化查询）、XSS 攻击（前端输出编码）、CSRF 攻击（使用 Token 或 SameSite Cookie）。

### 测试要求
- **单元测试**: 后端核心服务函数（如密码验证、权限校验）、前端工具函数和复杂组件逻辑需有单元测试覆盖。
- **集成测试**: 对核心业务流程（登录-上传-搜索-下载-收藏）进行端到端测试。使用 Postman 或 Jest 进行 API 接口测试。
- **覆盖率目标**: 核心业务逻辑测试覆盖率不低于 70%。

## ContextState 更新规则
**重要：每次完成一个任务后，必须按以下步骤更新 context_state.md 文件：**

1. 将已完成任务的状态从 `PENDING` 更新为 `COMPLETED`。
2.  在“完成时间”列记录具体的完成日期和时间（格式：YYYY-MM-DD HH:MM）。
3.  更新“当前进度”部分的“已完成任务数”和“完成百分比”。
4.  根据任务依赖关系，在“下一步行动”部分明确指出下一个应执行的任务及其简要说明。
5.  如在任务执行中遇到任何阻碍或问题，记录到“遇到的问题”部分。
6.  在“变更记录”部分添加一行，格式为：`- [YYYY-MM-DD HH:MM] 完成 T-XX: 任务名称，下一步执行 T-XX: 任务名称`。

**更新示例**：
```markdown
## 变更记录
- [2023-10-27 14:30] 完成 T-01: 项目初始化与基础架构搭建，下一步执行 T-02: 数据库设计与迁移脚本
```

## 文档引用
本项目包含以下 7 份核心文档，开发前必须全部审阅：
1.  **PRD.md** — 产品需求文档，定义项目目标、功能需求与验收标准。
2.  **Frontend.md** — 前端技术文档，规定组件结构、状态管理、路由与样式方案。
3.  **Backend.md** — 后端技术文档，规定 API 设计、数据库结构与中间件。
4.  **API.md** — API 接口契约文档，明确所有接口的路径、方法、参数与响应格式。
5.  **task.md** — 开发任务清单，分解开发工作并明确顺序与依赖。
6.  **context_state.md** — 项目状态追踪文档，实时记录任务进度与问题（需每次任务后更新）。
7.  **AGENTS.md** — 本文件，AI 编码的核心规则与执行流程指南。

## 执行流程
1.  **启动检查**: 收到编码指令后，首先执行“最高优先规则”，审阅全部 7 份文档，特别注意有无“审核修订记录”。
2.  **文档整合**: 若有修订记录，依据修订内容重新同步所有相关文档的计划。
3.  **进度确认**: 阅读 `context_state.md`，确认当前待执行的任务（第一个 `PENDING` 状态的任务）。
4.  **任务实施**: 严格按照 `task.md` 中该任务的描述和验收标准进行开发。开发过程中参考 `Frontend.md`、`Backend.md` 和 `API.md` 的技术细节。
5.  **完成与更新**: 任务开发并通过验收后，立即按照上述“ContextState 更新规则”更新 `context_state.md` 文件。
6.  **循环推进**: 重复步骤 3-5，直至所有任务状态变为 `COMPLETED`。

## CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.