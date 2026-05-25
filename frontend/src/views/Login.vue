<template>
  <div class="login-container">
    <div class="login-bg-glow"></div>
    <div class="login-card fade-in">
      <div class="card-shimmer"></div>
      <div class="login-header">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#g1)" stroke-width="1.5" fill="none"/>
            <path d="M10 16L14 20L22 12" stroke="url(#g1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <defs><linearGradient id="g1" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#6366F1"/><stop offset="1" stop-color="#A855F7"/></linearGradient></defs>
          </svg>
        </div>
        <h2>课程资源共享平台</h2>
        <p class="subtitle">登录以访问课程资源</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" size="large" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password prefix-icon="Lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">登录</el-button>
        </el-form-item>
        <div class="login-footer">
          <router-link to="/register">没有账号？立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  await formRef.value.validate()
  loading.value = true
  try {
    await userStore.login(form.username, form.password)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/home'
    router.push(redirect)
  } catch (err) {
    ElMessage.error(err.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: $bg-canvas;
  position: relative;
}

.login-bg-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(
    ellipse,
    rgba(99, 102, 241, 0.06) 0%,
    rgba(168, 85, 247, 0.03) 40%,
    transparent 70%
  );
  pointer-events: none;
  animation: breathe 6s ease-in-out infinite;
}

.login-card {
  position: relative;
  width: 400px;
  background: $bg-surface;
  border: 1px solid $border-subtle;
  border-radius: $radius-xl;
  padding: 40px 36px 32px;
  box-shadow: $shadow-lg;
  overflow: hidden;
}

.card-shimmer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255, 255, 255, 0.02) 45%,
      rgba(255, 255, 255, 0.04) 50%,
      rgba(255, 255, 255, 0.02) 55%,
      transparent 60%
    );
    animation: shimmer 4s ease-in-out infinite;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .logo-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: $accent-indigo-dim;
    border-radius: $radius-lg;
    margin-bottom: 16px;
  }

  h2 {
    color: $text-primary;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0 0 6px;
  }

  .subtitle {
    color: $text-tertiary;
    font-size: 13px;
    margin: 0;
  }
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  border-radius: $radius-md;
}

.login-footer {
  text-align: center;
  margin-top: 4px;

  a {
    color: $text-tertiary;
    font-size: 13px;
    transition: color $transition-fast;

    &:hover {
      color: $accent-indigo;
    }
  }
}

@keyframes shimmer {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(50%); }
}

@keyframes breathe {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
</style>
