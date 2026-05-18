# 课程资源共享平台后端技术文档

## API接口设计

### API结构规划
采用RESTful API设计风格，基础路径为`/api/v1`。主要模块包括：认证、用户、资源、分类、标签、收藏、统计。

### 接口命名规范
- 使用名词复数形式表示资源集合（如`/resources`）。
- 使用HTTP方法表示操作类型：GET（查询）、POST（创建）、PUT（更新）、DELETE（删除）。
- 路径层级清晰，嵌套关系不超过两级（如`/users/{userId}/favorites`）。

### 请求/响应格式
- 请求与响应体均使用JSON格式。
- 成功响应统一结构：`{ "code": 0, "message": "success", "data": {...} }`。
- 分页查询响应：`{ "code": 0, "data": { "list": [...], "total": 100, "page": 1, "pageSize": 20 } }`。

### 错误码设计
| 错误码 | 含义 | 说明 |
|--------|------|------|
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或Token无效 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |
| 1001 | User Exists | 用户已存在 |
| 2001 | Resource Not Found | 资源不存在 |
| 3001 | Category Not Found | 分类不存在 |

### 核心API端点列表
| 模块 | 端点 | 方法 | 描述 | 请求参数示例 | 响应示例 |
|------|------|--------------|
| 认证 | `/auth/login` | POST | 用户登录 | `{ "username": "user", "password": "pwd123" }` | `{ "token": "jwt_token", "userInfo": {...} }` |
| 认证 | `/auth/register` | POST | 用户注册 | `{ "username": "new", "password": "pwd", "email": "a@b.com", "role": "student" }` | `{ "id": 1, "username": "new" }` |
| 资源 | `/resources` | GET | 获取资源列表 | `?category=1&tag=2&keyword=math&page=1&pageSize=20` | `{ "list": [...], "total": 50 }` |
| 资源 | `/resources/{id}` | GET | 获取资源详情 | - | `{ "id": 1, "title": "...", "downloadCount": 10 }` |
| 资源 | `/resources` | POST | 上传资源 | `FormData: { file, title, description, categoryId }` | `{ "id": 2, "title": "new" }` |
| 资源 | `/resources/{id}` | PUT | 更新资源信息 | `{ "title": "updated", "description": "..." }` | `{ "id": 1, "title": "updated" }` |
| 资源 | `/resources/{id}` | DELETE | 删除资源 | - | `{ "message": "deleted" }` |
| 分类 | `/categories` | GET | 获取分类树 | - | `[{ "id": 1, "name": "计算机", "children": [...] }]` |
| 分类 | `/categories` | POST | 创建分类 | `{ "name": "数学", "parentId": null }` | `{ "id": 3, "name": "数学" }` |
| 收藏 | `/favorites` | GET | 获取用户收藏 | `?page=1` | `{ "list": [...], "total": 10 }` |
| 收藏 | `/favorites/{resourceId}` | POST | 收藏资源 | - | `{ "message": "collected" }` |
| 收藏 | `/favorites/{resourceId}` | DELETE | 取消收藏 | - | `{ "message": "uncollected" }` |
| 统计 | `/stats/overview` | GET | 获取概览统计 | - | `{ "totalUsers": 100, "totalResources": 200 }` |
| 统计 | `/stats/resources/top-downloaded` | GET | 获取下载量Top10资源 | `?limit=10` | `[{ "id": 1, "title": "...", "count": 100 }]` |
| 用户 | `/users` | GET | 获取用户列表（管理员） | `?role=teacher&page=1` | `{ "list": [...], "total": 30 }` |
| 用户 | `/users/{id}/status` | PUT | 启用/禁用用户（管理员） | `{ "status": "disabled" }` | `{ "message": "updated" }` |

## 数据库设计

### 数据库选型
选用MySQL 8.0，原因：关系型数据库，满足结构化数据存储、事务支持及复杂查询需求。

### 表结构设计
**1. 用户表 (users)**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password_hash | VARCHAR(255) | NOT NULL | 加密后的密码 |
| email | VARCHAR(100) | UNIQUE | 邮箱 |
| role | ENUM('student', 'teacher', 'admin') | NOT NULL, DEFAULT 'student' | 角色 |
| status | ENUM('active', 'disabled') | NOT NULL, DEFAULT 'active' | 账号状态 |
| created_at | DATETIME | NOT NULL | 创建时间 |
| updated_at | DATETIME | NOT NULL | 更新时间 |

**2. 资源表 (resources)**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 资源ID |
| title | VARCHAR(200) | NOT NULL | 标题 |
| description | TEXT | | 描述 |
| file_path | VARCHAR(500) | NOT NULL | 文件存储路径 |
| file_type | VARCHAR(20) | NOT NULL | 文件类型（pdf, ppt等） |
| file_size | INT | NOT NULL | 文件大小（字节） |
| uploader_id | BIGINT | FOREIGN KEY (users.id) | 上传者ID |
| category_id | BIGINT | FOREIGN KEY (categories.id) | 所属分类ID |
| view_count | INT | NOT NULL, DEFAULT 0 | 浏览次数 |
| download_count | INT | NOT NULL, DEFAULT 0 | 下载次数 |
| status | ENUM('draft', 'published', 'archived') | NOT NULL, DEFAULT 'draft' | 状态 |
| created_at | DATETIME | NOT NULL | 上传时间 |
| updated_at | DATETIME | NOT NULL | 更新时间 |

**3. 分类表 (categories)**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 分类ID |
| name | VARCHAR(50) | NOT NULL | 分类名称 |
| parent_id | BIGINT | FOREIGN KEY (categories.id), NULL | 父分类ID（NULL为一级分类） |
| sort_order | INT | NOT NULL, DEFAULT 0 | 排序序号 |

**4. 标签表 (tags)**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 标签ID |
| name | VARCHAR(30) | UNIQUE, NOT NULL | 标签名称 |

**5. 资源-标签关联表 (resource_tags)**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|
| resource_id | BIGINT | FOREIGN KEY (resources.id) | 资源ID |
| tag_id | BIGINT | FOREIGN KEY (tags.id) | 标签ID |
| PRIMARY KEY | (resource_id, tag_id) | | 联合主键 |

**6. 收藏表 (favorites)**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 收藏ID |
| user_id | BIGINT | FOREIGN KEY (users.id) | 用户ID |
| resource_id | BIGINT | FOREIGN KEY (resources.id) | 资源ID |
| created_at | DATETIME | NOT NULL | 收藏时间 |
| UNIQUE | (user_id, resource_id) | | 防止重复收藏 |

**7. 访问日志表 (access_logs)**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 日志ID |
| user_id | BIGINT | FOREIGN KEY (users.id), NULL | 用户ID（可为空） |
| resource_id | BIGINT | FOREIGN KEY (resources.id) | 资源ID |
| action | ENUM('view', 'download', 'favorite') | NOT NULL | 操作类型 |
| ip_address | VARCHAR(45) | | 访问IP |
| created_at | DATETIME | NOT NULL | 操作时间 |

### 索引设计
- `resources`表：为`category_id`, `uploader_id`, `status`, `created_at`建立索引。
- `favorites`表：为`user_id`, `resource_id`建立索引。
- `access_logs`表：为`resource_id`, `action`, `created_at`建立组合索引。
- `users`表：为`username`, `email`, `role`建立索引。

### 数据关系设计
- 用户与资源：一对多关系（一个用户可上传多个资源）。
- 资源与分类：多对一关系（多个资源属于一个分类）。
- 资源与标签：多对多关系（通过`resource_tags`关联表实现）。
- 用户与资源（收藏）：多对多关系（通过`favorites`表实现）。
- 访问日志与用户/资源：多对一关系。

## 中间件配置

### 认证中间件
- **技术方案**：使用JWT（JSON Web Token）。
- **流程**：
    1. 用户登录成功后，服务器生成包含`userId`和`role`的JWT，设置有效期（如7天）。
    2. 客户端在请求头`Authorization: Bearer <token>`中携带Token。
    3. 后端中间件验证Token签名及有效性，并将用户信息附加到`req.user`。
- **配置代码（Express示例）**：
    ```javascript
    const jwt = require('jsonwebtoken');
    const authMiddleware = (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ code: 401, message: '未登录' });
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId, role }
        next();
      } catch (err) {
        res.status(401).json({ code: 401, message: 'Token无效或已过期' });
      }
    };
    ```

### 权限校验中间件
- **角色校验**：基于`req.user.role`进行判断。
- **资源权限校验**：检查当前用户是否为资源上传者或管理员。
- **中间件工厂函数**：
    ```javascript
    const checkRole = (allowedRoles) => (req, res, next) => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ code: 403, message: '无权限访问' });
      }
      next();
    };
    // 使用：router.get('/admin', authMiddleware, checkRole(['admin']), handler)
    ```

### 日志中间件
- **请求日志**：记录请求方法、URL、状态码、响应时间、IP。
- **错误日志**：捕获并记录未处理的异常。
- **实现**：使用`morgan`库记录HTTP请求，自定义错误处理中间件记录错误堆栈。
    ```javascript
    const morgan = require('morgan');
    app.use(morgan('combined')); // 访问日志
    
    // 错误处理中间件
    app.use((err, req, res, next) => {
      console.error(`[ERROR] ${new Date().toISOString()} - ${err.stack}`);
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    ```

### 文件上传中间件
- **技术**：使用`multer`处理`multipart/form-data`。
- **配置**：限制文件大小、类型，指定存储路径和文件名规则。
    ```javascript
    const multer = require('multer');
    const storage = multer.diskStorage({
      destination: './uploads/',
      filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
    });
    const upload = multer({
      storage,
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint'];
        cb(null, allowedTypes.includes(file.mimetype));
      }
    });
    ```

## 部署说明

### 部署环境要求
| 组件 | 要求 | 说明 |
|------|------|
| 操作系统 | Linux (Ubuntu 20.04 LTS) | 推荐生产环境 |
| Node.js | v18.x 或更高 | 运行Express应用 |
| MySQL | 8.0 或更高 | 数据库服务 |
| Nginx | 最新稳定版 | 反向代理与静态文件服务 |
| PM2 | 最新版 | Node.js进程管理 |

### 部署步骤
1.  **服务器准备**：购买云服务器，配置安全组，开放80（HTTP）、443（HTTPS）、3306（MySQL）端口。
2.  **环境安装**：
    ```bash
    # 安装Node.js
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    # 安装MySQL
    sudo apt install mysql-server
    # 安装Nginx
    sudo apt install nginx
    # 安装PM2
    sudo npm install -g pm2
    ```
3.  **项目部署**：
    ```bash
    git clone <项目仓库地址>
    cd course-sharing-platform/backend
    npm install --production
    # 配置环境变量
    cp .env.example .env
    vim .env # 修改数据库连接、JWT密钥等
    # 初始化数据库
    mysql -u root -p < schema.sql
    # 启动应用
    pm2 start ecosystem.config.js --env production
    ```
4.  **Nginx配置**：
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;
        location /api/ {
            proxy_pass http://localhost:3000; # Express应用端口
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        location /uploads/ {
            alias /path/to/your/project/uploads/; # 文件存储目录
        }
        location / {
            root /path/to/your/frontend/dist; # Vue打包后的静态文件目录
            try_files $uri/ /index.html;
        }
    }
    ```
5.  **HTTPS配置（推荐）**：使用Let‘s Encrypt申请免费证书，配置Nginx SSL。

### 环境变量配置
创建`.env`文件，包含以下关键配置：
```env

PORT=3000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_USER=course_platform
DB_PASSWORD=strong_password
DB_NAME=course_sharing

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800 # 50MB
```

### 数据库初始化脚本
提供`schema.sql`文件，用于创建数据库和表结构，并插入默认管理员账号和初始分类数据。