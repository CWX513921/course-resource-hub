<template>
  <div class="not-found">
    <div class="glow-bg"></div>
    <div class="content fade-in">
      <div class="error-code">404</div>
      <div class="divider"></div>
      <p class="message">页面未找到</p>
      <p class="sub-message">你访问的页面不存在或已被移除</p>
      <button class="back-btn" @click="$router.push('/home')">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 1L3 7l5 6"/></svg>
        返回首页
      </button>
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  position: relative;
}

.glow-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(
    ellipse,
    rgba(99, 102, 241, 0.05) 0%,
    transparent 70%
  );
  pointer-events: none;
  animation: breathe 4s ease-in-out infinite;
}

.content {
  text-align: center;
}

.error-code {
  font-size: 72px;
  font-weight: 700;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, $accent-indigo, $accent-purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.divider {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, $accent-indigo, $accent-purple);
  margin: 16px auto;
  border-radius: 1px;
}

.message {
  color: $text-primary;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 6px;
}

.sub-message {
  color: $text-tertiary;
  font-size: 13px;
  margin: 0 0 24px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: linear-gradient(135deg, $accent-indigo, $accent-purple);
  border: none;
  border-radius: $radius-sm;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(99, 102, 241, 0.2);
  transition: all $transition-fast;

  &:hover {
    box-shadow: 0 0 24px rgba(99, 102, 241, 0.35);
    transform: translateY(-1px);
  }
}

@keyframes breathe {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
