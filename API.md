# 课程资源共享平台 API 接口契约文档

## API 设计规范（简写）
- **基础路径**: `/api/v1`
- **认证方案**: JWT Bearer Token
- **统一响应格式**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {}
  }
  ```
- **分页响应格式**:
  ```json
  {
    "code": 0,
    "data": {
      "list": [],
      "total": 100,
      "page": 1,
      "pageSize": 20
    }
  }
  ```

## 接口列表

### 用户认证模块
| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
|------|------|----------|----------|
| POST | `/auth/login` | 用户登录 | `{ "username": "user", "password": "pwd123" }` | `{ "code": 0, "data": { "token": "xxx", "userInfo": { "id": 1, "role": "teacher" } } }` |
| POST | `/auth/register` | 用户注册 | `{ "username": "new", "password": "pwd", "email": "a@b.com", "role": "student" }` | `{ "code": 0, "data": { "id": 1, "username": "new" } }` |

### 业务核心模块
| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
|------|------|----------|----------|
| GET | `/resources` | 获取资源列表（支持筛选、搜索、分页） | Query: `category`, `tag`, `keyword`, `pageSize` | `{ "code": 0, "data": { "list": [{ "id": 1, "title": "课程一", "downloadCount": 10 }], "total": 50 } }` |
| GET | `/resources/{id}` | 获取资源详情 | Path: `id` | `{ "code": 0, "data": { "id": 1, "title": "...", "description": "...", "uploader": { "name": "教师A" }, "downloadCount": 10, "collectCount": 5 } }` |
| POST | `/resources` | 上传新资源（教师） | FormData: `file`, `title`, `description`, `categoryId`, `tags` | `{ "code": 0, "data": { "id": 2, "title": "新课件" } }` |
| PUT | `/resources/{id}` | 更新资源信息（教师） | Path: `id`, Body: `{ "title", "description", "categoryId", "tags" }` | `{ "code": 0, "data": { "id": 1, "title": "更新后标题" } }` |
| DELETE | `/resources/{id}` | 删除资源（教师/管理员） | Path: `id` | `{ "code": 0, "message": "删除成功" }` |
| GET | `/resources/{id}/file` | 下载资源文件流 | Path: `id` | 文件流（Content-Type: application/octet-stream） |
| POST | `/resources/{id}/download` | 记录资源下载 | Path: `id` | `{ "code": 0, "data": { "downloadUrl": "..." } }` |
| POST | `/favorites/{resourceId}` | 收藏资源 | Path: `resourceId` | `{ "code": 0, "message": "收藏成功" }` |
| DELETE | `/favorites/{resourceId}` | 取消收藏 | Path: `resourceId` | `{ "code": 0, "message": "取消成功" }` |
| GET | `/favorites/{resourceId}/check` | 检查是否已收藏 | Path: `resourceId` | `{ "code": 0, "data": { "isFavorited": true } }` |
| GET | `/favorites` | 获取用户收藏列表 | Query: `page`, `pageSize` | `{ "code": 0, "data": { "list": [{ "id": 1, "title": "课程一", "collectCount": 5 }], "total": 10 } }` |
| GET | `/categories/tree` | 获取分类树形结构 | 无 | `{ "code": 0, "data": [{ "id": 1, "name": "计算机", "children": [{ "id": 2, "name": "前端" }] }] }` |
| POST | `/categories` | 创建分类（管理员） | Body: `{ "name", "parentId" }` | `{ "code": 0, "data": { "id": 3, "name": "新分类" } }` |
| GET | `/stats/overview` | 获取平台概览统计 | 无 | `{ "code": 0, "data": { "totalUsers": 100, "totalResources": 200, "totalDownloads": 1500, "totalFavorites": 300 } }` |
| GET | `/stats/resources/top-downloaded` | 获取下载量Top10资源 | Query: `limit` | `{ "code": 0, "data": [{ "id": 1, "title": "热门课件", "downloadCount": 100 }] }` |
| GET | `/stats/categories` | 获取分类资源统计 | 无 | `{ "code": 0, "data": [{ "categoryId": 1, "categoryName": "计算机", "resourceCount": 50, "downloadCount": 300 }] }` |

### 评论模块
| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
|------|------|----------|----------|
| GET | `/comments/{resourceId}` | 获取资源评论列表 | Path: `resourceId`, Query: `page`, `pageSize` | `{ "code": 0, "data": { "list": [{ "id": 1, "content": "很好的课件", "userId": 2, "username": "学生A", "createdAt": "2024-01-01T00:00:00Z" }], "total": 20 } }` |
| POST | `/comments/{resourceId}` | 发表评论 | Path: `resourceId`, Body: `{ "content": "评论内容" }` | `{ "code": 0, "data": { "id": 2, "content": "评论内容", "createdAt": "2024-01-01T00:00:00Z" } }` |
| DELETE | `/comments/{resourceId}/{commentId}` | 删除评论 | Path: `resourceId`, `commentId` | `{ "code": 0, "message": "删除成功" }` |

### 系统管理模块
| 方法 | 路径 | 描述 | 请求参数 | 响应示例 |
|------|----------|
| GET | `/users` | 获取用户列表（管理员） | Query: `role`, `pageSize` | `{ "code": 0, "data": { "list": [{ "id": 1, "username": "teacher1", "role": "teacher", "status": "active" }], "total": 30 } }` |
| PUT | `/users/{id}/status` | 启用/禁用用户（管理员） | Path: `id`, Body: `{ "status": "disabled" }` | `{ "code": 0, "message": "状态更新成功" }` |

## 错误码设计
| 错误码 | 含义 | 说明 |
|--------|------|
| 400 | 参数错误 | 请求参数校验失败 |
| 401 | 未认证 | 缺少或Token无效 |
| 403 | 无权限 | 无权访问该资源 |
| 404 | 资源不存在 | 请求的资源未找到 |
| 500 | 服务器错误 | 内部服务异常 |
| 1001 | 用户已存在 | 注册时用户名或邮箱重复 |
| 2001 | 资源未找到 | 操作的资源不存在 |
| 3001 | 分类未找到 | 指定分类不存在 |
| 4001 | 文件格式错误 | 上传文件类型不支持 |
| 4002 | 上传失败 | 文件存储失败 |