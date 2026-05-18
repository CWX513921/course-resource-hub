# 课程资源共享平台前端技术文档

## 组件结构设计

### 组件树结构
```
App
├── Layout (布局组件)
│   ├── Header (顶部导航)
│   ├── Sidebar (侧边栏)
│   └── Main (主内容区)
├── Views (页面视图)
│   ├── Login (登录页)
│   ├── Register (注册页)
│   ├── Home (首页/资源列表)
│   ├── ResourceDetail (资源详情)
│   ├── Dashboard (教师工作台)
│   ├── Admin (管理后台)
│   └── UserCenter (个人中心)
├── Components (公共组件)
│   ├── ResourceCard (资源卡片)
│   ├── SearchBar (搜索栏)
│   ├── FileUploader (文件上传器)
│   ├── StatsChart (统计图表)
│   └── CategoryTree (分类树)
└── Business (业务组件)
    ├── ResourceForm (资源表单)
    ├── CategoryManager (分类管理)
    └── UserTable (用户列表)
```

### 组件职责划分
- **Layout组件**：负责应用整体布局、导航和用户状态展示。
- **Views组件**：对应路由页面，负责页面级数据获取和逻辑编排。
- **Components组件**：无状态或纯展示组件，通过`props`接收数据，`emits`触发事件。
- **Business组件**：封装特定业务逻辑的复杂组件，可包含状态和交互。

### 组件命名规范
- **文件命名**：采用`PascalCase`（如`ResourceCard.vue`）或`kebab-case`（如`resource-card.vue`）。
- **组件命名**：使用`PascalCase`（如`defineComponent('ResourceCard')`）。
- **Props/Events命名**：采用`camelCase`（如`propName`，`eventName`）。

### 组件复用策略
- **公共组件**：抽象通用UI模式（如按钮、表格、弹窗），放入`components/common`。
- **业务组件**：针对资源、用户、分类等核心实体，封装增删改查逻辑，放入`components/business`。
- **组合式函数**：将可复用的逻辑（如数据获取、表单验证）抽离为`composables`。

## 状态管理方案

### 状态结构设计
```javascript
// 使用Pinia定义Store
{
  user: {
    token: '',
    info: null, // 用户信息
    permissions: []
  },
  resource: {
    list: [],
    current: null, // 当前查看资源
    filters: {}, // 查询条件
    pagination: {}
  },
  category: {
    tree: [], // 分类树形结构
    flatList: []
  },
  stats: {
    overview: {}, // 概览统计
    charts: {} // 图表数据
  },
  ui: {
    loading: false,
    sidebarCollapsed: false
  }
}
```

### 状态管理工具选型
- **工具**：Pinia
- **理由**：Vue 3官方推荐，提供完整的TypeScript支持，模块化设计，易于测试。

### 状态更新流程
1. **组件**通过`mapActions`或直接调用触发`Store Action`。
2. **Action**执行异步操作（如调用API）。
3. 成功后，`Action`通过`$patch`或直接赋值更新`State`。
4. **State**的改变通过`Getters`计算派生状态，并响应式地更新视图。

### 状态持久化方案
- **用户认证信息**：使用`localStorage`存储JWT Token，通过Pinia插件`pinia-plugin-persistedstate`实现持久化。
- **UI状态**（如侧边栏状态）：使用`sessionStorage`临时存储。
- **敏感数据**：仅在内存状态中保留，不进行持久化。

## 路由设计

### 路由结构规划
```javascript
const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', component: Home },
      { path: 'resource/:id', component: ResourceDetail },
      { path: 'dashboard', component: Dashboard, meta: { roles: ['teacher'] } },
      { path: 'admin', component: Admin, meta: { roles: ['admin'] } },
      { path: 'user', component: UserCenter }
    ]
  },
  { path: '/:pathMatch(.*)*', component: NotFound }
]
```

### 路由守卫设计
- **全局前置守卫**：检查路由是否需要认证（`meta.requiresAuth`），验证用户Token有效性。
- **角色守卫**：根据`meta.roles`检查用户角色权限，无权限则跳转至403页面。
- **路由后置守卫**：用于页面标题设置、埋点等。

### 路由参数设计
- **动态路由**：用于资源详情页`/resource/:id`，通过`useRoute().params.id`获取。
- **查询参数**：用于列表页筛选和分页，如`/home?category=math&page=2`，通过`useRoute().query`获取。

## 样式方案

### 样式框架选择
- **核心框架**：Element Plus（组件库）
- **CSS预处理器**：SCSS
- **原子化CSS**：可选引入Tailwind CSS用于快速布局。

### 样式组织方式
- **全局样式**：`styles/`目录下存放变量、混入、重置样式。
- **组件样式**：使用`<style scoped>`确保样式隔离。
- **主题定制**：通过覆盖Element Plus的SCSS变量实现品牌色定制。

### 响应式设计方案
- **断点设置**：参考Element Plus栅格系统（xs, sm, md, lg, xl）。
- **布局策略**：使用Flexbox和Grid布局，结合媒体查询。
- **组件适配**：为复杂组件（如数据表格）提供移动端专用视图或抽屉式操作面板。

## 用户体验优化

### 加载状态处理
- **全局加载**：使用`ElLoading`服务覆盖整个页面或容器。
- **局部加载**：在按钮、表格等组件上使用`v-loading`指令。
- **骨架屏**：在资源列表、个人中心等页面使用骨架屏作为占位。

### 错误提示设计
- **API错误**：统一通过响应拦截器捕获，使用`ElMessage`显示友好错误信息。
- **表单错误**：使用Element Plus表单验证的即时反馈。
- **全局错误**：捕获未处理的Promise异常和错误，引导用户刷新或联系支持。

### 操作反馈机制
- **成功操作**：使用`ElMessage.success`提示（如“收藏成功”）。
- **危险操作**：使用`ElMessageBox.confirm`进行二次确认（如删除资源）。
- **异步操作**：按钮在请求期间显示加载状态并禁用，防止重复提交。

## 表单验证与错误处理

### 表单验证规则
- **必填项**：使用`required: true`规则。
- **格式验证**：如邮箱格式、密码强度（长度、字符类型）。
- **业务规则**：如资源标题唯一性（需异步校验）、文件类型与大小限制。

### 错误消息设计
- **消息明确**：指出具体错误原因（如“密码长度需在8-20位之间”）。
- **位置贴近**：错误消息显示在对应表单字段下方。
- **样式统一**：使用Element Plus默认的红色错误样式。

### 表单提交流程
1. 前端预验证（调用`form.validate()`）。
2. 显示加载状态，禁用提交按钮。
3. 发送API请求。
4. 根据响应结果：
   - 成功：提示成功，重置表单或跳转。
   - 失败：显示具体错误，恢复按钮状态。
5. 提供“保存草稿”功能，避免数据丢失。

## 响应式设计

### 断点设置
- **移动端**：< 768px
- **平板端**：768px - 1024px
- **桌面端**：> 1024px

### 组件响应式策略
- **导航**：移动端使用底部导航栏或抽屉菜单，桌面端使用侧边栏。
- **数据表格**：移动端转为卡片列表，桌面端使用表格。
- **图表**：根据容器宽度自动调整尺寸和布局。

### 移动端适配方案
- **视口设置**：确保`<meta name="viewport">`正确配置。
- **触摸优化**：增大按钮点击区域，优化手势操作。
- **性能考虑**：移动端减少复杂动画和重绘，优先加载关键内容。