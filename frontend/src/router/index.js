import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', name: 'Home', component: () => import('@/views/Home.vue') },
      { path: 'resource/:id', name: 'ResourceDetail', component: () => import('@/views/ResourceDetail.vue') },
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/Dashboard.vue'), meta: { roles: ['teacher', 'admin'] } },
      { path: 'admin', name: 'Admin', component: () => import('@/views/Admin.vue'), meta: { roles: ['admin'] } },
      { path: 'user', name: 'UserCenter', component: () => import('@/views/UserCenter.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.roles) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    if (to.meta.roles.includes(userInfo.role)) {
      next()
    } else {
      next({ name: 'Home' })
    }
  } else {
    next()
  }
})

export default router
