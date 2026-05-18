<template>
  <div class="main-layout">
    <el-container>
      <el-header>
        <div class="header-left">
          <span class="logo">课程资源共享平台</span>
        </div>
        <div class="header-right">
          <span>{{ userInfo?.username || '未登录' }}</span>
          <el-button type="danger" size="small" @click="handleLogout" style="margin-left:12px">退出</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <el-menu :default-active="currentRoute" router>
            <el-menu-item index="/home">
              <span>首页</span>
            </el-menu-item>
            <el-menu-item v-if="isTeacher" index="/dashboard">
              <span>教师工作台</span>
            </el-menu-item>
            <el-menu-item v-if="isAdmin" index="/admin">
              <span>管理后台</span>
            </el-menu-item>
            <el-menu-item index="/user">
              <span>个人中心</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
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

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
}
.el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #409eff;
  color: #fff;
}
.logo {
  font-size: 18px;
  font-weight: bold;
}
.el-aside {
  background: #f5f5f5;
}
</style>
