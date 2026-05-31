<template>
  <div class="resource-card" :class="{ compact }" @click="$router.push(`/resource/${resource.id}`)">
    <div class="card-shimmer"></div>
    <div class="card-header">
      <span class="file-badge" :class="fileTypeClass">{{ resource.file_type?.toUpperCase() }}</span>
      <span class="card-title">{{ resource.title }}</span>
    </div>
    <p class="card-desc">{{ resource.description || '暂无描述' }}</p>
    <div class="card-footer">
      <span class="footer-item">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="6" cy="4" r="2.5"/><path d="M2 11c0-2 2-3.5 4-3.5s4 1.5 4 3.5"/></svg>
        {{ resource.uploader_name || '未知' }}
      </span>
      <span class="footer-item">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="1" y="1" width="10" height="10" rx="2"/><path d="M4 1v10M1 4h10"/></svg>
        {{ resource.category_name || '未分类' }}
      </span>
      <span class="footer-item">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M6 1v6M3 4l3 3 3-3M2 10h8"/></svg>
        {{ resource.download_count || 0 }}
      </span>
      <span class="footer-item">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="6" cy="6" r="4.5"/><path d="M6 4v2.5l2 1"/></svg>
        {{ resource.view_count || 0 }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  resource: { type: Object, required: true },
  compact: { type: Boolean, default: false }
})

const fileTypeClass = computed(() => {
  const map = { pdf: 'pdf', ppt: 'ppt', doc: 'doc', xls: 'xls' }
  return map[props.resource.file_type] || 'default'
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.resource-card {
  position: relative;
  cursor: pointer;
  margin-bottom: 10px;
  padding: 16px 18px;
  background: $bg-surface;
  border: 1px solid $border-micro;
  border-radius: $radius-md;
  transition: all $transition-normal;
  overflow: hidden;

  &:hover {
    border-color: $border-hover;
    background: $bg-surface-hover;
    transform: translateY(-1px);
    box-shadow: $shadow-md, 0 0 20px rgba(99, 102, 241, 0.06);

    .card-shimmer::after {
      opacity: 1;
    }
  }

  &.compact {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 18px;

    .card-header {
      margin-bottom: 0;
      min-width: 0;
      flex-shrink: 0;
    }

    .card-desc {
      margin: 0;
      max-width: 300px;
      flex-shrink: 1;
    }

    .card-footer {
      flex-shrink: 0;
      margin-left: auto;
    }
  }
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
      rgba(255, 255, 255, 0.015) 45%,
      rgba(255, 255, 255, 0.03) 50%,
      rgba(255, 255, 255, 0.015) 55%,
      transparent 60%
    );
    opacity: 0;
    transition: opacity $transition-normal;
    animation: shimmer 2.5s ease-in-out infinite;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.file-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 22px;
  padding: 0 6px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;

  &.pdf {
    background: rgba(239, 68, 68, 0.12);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  &.ppt {
    background: rgba(245, 158, 11, 0.12);
    color: #F59E0B;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }

  &.doc {
    background: rgba(34, 197, 94, 0.12);
    color: #22C55E;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  &.xls {
    background: rgba(59, 130, 246, 0.12);
    color: #3B82F6;
    border: 1px solid rgba(59, 130, 246, 0.2);
  }

  &.default {
    background: rgba(161, 161, 170, 0.12);
    color: $text-tertiary;
    border: 1px solid $border-micro;
  }
}

.card-title {
  font-weight: 600;
  font-size: 15px;
  color: $text-primary;
  letter-spacing: -0.01em;
}

.card-desc {
  color: $text-tertiary;
  font-size: 13px;
  margin: 0 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  gap: 14px;
}

.footer-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: $text-muted;
  font-size: 12px;
}

@keyframes shimmer {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(50%); }
}
</style>
