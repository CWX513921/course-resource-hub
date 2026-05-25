<template>
  <div class="main-layout">
    <header class="app-header">
      <div class="header-left">
        <div class="logo-mark">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#hg)" stroke-width="1.5" fill="none"/>
            <path d="M10 16L14 20L22 12" stroke="url(#hg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <defs><linearGradient id="hg" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#6366F1"/><stop offset="1" stop-color="#A855F7"/></linearGradient></defs>
          </svg>
        </div>
        <span class="logo-text">课程资源共享平台</span>
      </div>
      <div class="header-right">
        <span class="user-name">{{ userInfo?.username || '未登录' }}</span>
        <div class="user-badge" v-if="userInfo?.role">
          <span>{{ roleLabel }}</span>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6"/>
          </svg>
        </button>
      </div>
    </header>
    <div class="layout-body">
      <aside class="app-aside">
        <el-menu :default-active="currentRoute" router>
          <el-menu-item index="/home">
            <svg class="menu-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="1" y="1" width="7" height="7" rx="2"/><rect x="10" y="1" width="7" height="7" rx="2"/><rect x="1" y="10" width="7" height="7" rx="2"/><rect x="10" y="10" width="7" height="7" rx="2"/>
            </svg>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item v-if="isTeacher" index="/dashboard">
            <svg class="menu-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M2 14h14M4 14V7l5-4 5 4v7"/>
              <path d="M7 14v-3h4v3"/>
            </svg>
            <span>教师工作台</span>
          </el-menu-item>
          <el-menu-item v-if="isAdmin" index="/admin">
            <svg class="menu-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <circle cx="9" cy="5" r="3"/><path d="M2 16c0-3 3-5 7-5s7 2 7 5"/>
            </svg>
            <span>管理后台</span>
          </el-menu-item>
          <el-menu-item index="/user">
            <svg class="menu-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <circle cx="9" cy="6" r="3"/><path d="M3 16c0-3.5 3-5.5 6-5.5s6 2 6 5.5"/>
            </svg>
            <span>个人中心</span>
          </el-menu-item>
        </el-menu>
      </aside>
      <main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="page-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const currentRoute = computed(() => route.path)
const userInfo = computed(() => userStore.userInfo)
const isTeacher = computed(() => ['teacher', 'admin'].includes(userInfo.value?.role))
const isAdmin = computed(() => userInfo.value?.role === 'admin')
const roleLabel = computed(() => {
  const map = { student: '学生', teacher: '教师', admin: '管理员' }
  return map[userInfo.value?.role] || ''
})

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-canvas;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 20px;
  background: rgba(8, 8, 8, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid $border-micro;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: $accent-indigo-dim;
  border-radius: $radius-sm;
}

.logo-text {
  color: $text-primary;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  color: $text-secondary;
  font-size: 13px;
}

.user-badge {
  padding: 2px 8px;
  background: $accent-indigo-dim;
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 20px;
  color: $accent-indigo;
  font-size: 11px;
  font-weight: 500;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid $border-micro;
  border-radius: $radius-sm;
  color: $text-tertiary;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $border-hover;
    color: $danger;
    background: rgba(239, 68, 68, 0.08);
  }
}

.layout-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.app-aside {
  width: 200px;
  padding: 12px 0;
  background: $bg-surface;
  border-right: 1px solid $border-micro;
  flex-shrink: 0;
}

.menu-icon {
  margin-right: 8px;
  flex-shrink: 0;
  color: $text-tertiary;
}

.app-main {
  flex: 1;
  padding: 20px;
  min-width: 0;
  overflow-y: auto;
}

.page-slide-enter-active {
  animation: pageIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-slide-leave-active {
  animation: pageIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}

@keyframes pageIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
