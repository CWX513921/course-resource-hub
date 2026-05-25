<template>
  <div class="register-container">
    <div class="register-bg-glow"></div>
    <div class="register-card fade-in">
      <div class="card-shimmer"></div>
      <div class="register-header">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#g1)" stroke-width="1.5" fill="none"/>
            <path d="M16 10V22M10 16H22" stroke="url(#g1)" stroke-width="2" stroke-linecap="round"/>
            <defs><linearGradient id="g1" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#6366F1"/><stop offset="1" stop-color="#A855F7"/></linearGradient></defs>
          </svg>
        </div>
        <h2>用户注册</h2>
        <p class="subtitle">创建账号开始使用</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" class="register-form">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" size="large" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码（至少6位）" size="large" show-password prefix-icon="Lock" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" size="large" prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="role">
          <el-select v-model="form.role" placeholder="选择角色" size="large" class="full-width">
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="register-btn" @click="handleRegister">注册</el-button>
        </el-form-item>
        <div class="register-footer">
          <router-link to="/login">已有账号？立即登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({ username: '', password: '', email: '', role: 'student' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

async function handleRegister() {
  await formRef.value.validate()
  loading.value = true
  try {
    await userStore.register(form)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (err) {
    ElMessage.error(err.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: $bg-canvas;
  position: relative;
}

.register-bg-glow {
  position: absolute;
  top: 40%;
  left: 60%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(
    ellipse,
    rgba(168, 85, 247, 0.05) 0%,
    rgba(99, 102, 241, 0.03) 40%,
    transparent 70%
  );
  pointer-events: none;
  animation: breathe 7s ease-in-out infinite;
}

.register-card {
  position: relative;
  width: 400px;
  background: $bg-surface;
  border: 1px solid $border-subtle;
  border-radius: $radius-xl;
  padding: 36px 36px 28px;
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
    animation: shimmer 5s ease-in-out infinite;
  }
}

.register-header {
  text-align: center;
  margin-bottom: 28px;

  .logo-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: $accent-purple-dim;
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

.register-form {
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
}

.full-width {
  width: 100%;
}

.register-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  border-radius: $radius-md;
}

.register-footer {
  text-align: center;
  margin-top: 4px;

  a {
    color: $text-tertiary;
    font-size: 13px;
    transition: color $transition-fast;

    &:hover {
      color: $accent-purple;
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
