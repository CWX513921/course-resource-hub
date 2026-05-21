import { createRouter, createWebHistory } from 'vue-router'

const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const MainLayout = () => import('@/layouts/MainLayout.vue')
const Home = () => import('@/views/Home.vue')
const ResourceDetail = () => import('@/views/ResourceDetail.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const Admin = () => import('@/views/Admin.vue')
const UserCenter = () => import('@/views/UserCenter.vue')
const NotFound = () => import('@/views/NotFound.vue')

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', name: 'Home', component: Home },
      { path: 'resource/:id', name: 'ResourceDetail', component: ResourceDetail },
      { path: 'dashboard', name: 'Dashboard', component: Dashboard, meta: { roles: ['teacher', 'admin'] } },
      { path: 'admin', name: 'Admin', component: Admin, meta: { roles: ['admin'] } },
      { path: 'user', name: 'UserCenter', component: UserCenter }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

let cachedUser = null
let cachedToken = null

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.roles) {
    if (token !== cachedToken) {
      cachedToken = token
      cachedUser = JSON.parse(localStorage.getItem('userInfo') || '{}')
    }
    if (to.meta.roles.includes(cachedUser.role)) {
      next()
    } else {
      next({ name: 'Home' })
    }
  } else {
    next()
  }
})

router.afterEach(() => {
  if (!cachedUser && localStorage.getItem('token')) {
    cachedUser = JSON.parse(localStorage.getItem('userInfo') || '{}')
    cachedToken = localStorage.getItem('token')
  }
})

export default router
