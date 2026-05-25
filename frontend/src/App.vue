<template>
  <div class="app-root">
    <div class="ambient-glow"></div>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
</script>

<style lang="scss">
@use '@/assets/styles/variables' as *;

.app-root {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: $bg-canvas;
  overflow-x: hidden;
}

.ambient-glow {
  position: fixed;
  top: -20%;
  left: -10%;
  width: 60%;
  height: 60%;
  background: radial-gradient(
    ellipse,
    rgba(99, 102, 241, 0.04) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}

.page-enter-active {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-leave-active {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}

@keyframes fadeIn {
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
