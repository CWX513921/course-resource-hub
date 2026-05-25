<template>
  <div class="search-bar">
    <el-input
      v-model="keyword"
      placeholder="搜索课程资源..."
      clearable
      size="large"
      @keyup.enter="handleSearch"
      @clear="handleSearch"
      @focus="showHistory = true"
      @blur="onBlur"
      class="search-input"
    >
      <template #prefix>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/>
        </svg>
      </template>
      <template #append>
        <el-button :icon="Search" @click="handleSearch" class="search-btn" />
      </template>
    </el-input>
    <div v-if="showHistory && searchHistory.length > 0" class="history-dropdown">
      <div class="history-header">
        <span>搜索历史</span>
        <button @click="clearHistory">清除</button>
      </div>
      <div v-for="item in searchHistory" :key="item" class="history-item" @mousedown.prevent="selectHistory(item)">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const emit = defineEmits(['search'])
const keyword = ref('')
const showHistory = ref(false)

const STORAGE_KEY = 'search_history'

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

const searchHistory = ref(getHistory())

function handleSearch() {
  const kw = keyword.value.trim()
  if (kw && !searchHistory.value.includes(kw)) {
    searchHistory.value.unshift(kw)
    if (searchHistory.value.length > 10) searchHistory.value.pop()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory.value))
  }
  showHistory.value = false
  emit('search', kw)
}

function selectHistory(item) {
  keyword.value = item
  showHistory.value = false
  emit('search', item)
}

function clearHistory() {
  searchHistory.value = []
  localStorage.removeItem(STORAGE_KEY)
}

function onBlur() {
  setTimeout(() => { showHistory.value = false }, 150)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.search-bar {
  margin-bottom: 16px;
  position: relative;
}

.search-input {
  :deep(.el-input__wrapper) {
    background: $bg-surface;
    border: 1px solid $border-subtle;
    border-radius: $radius-md;
    box-shadow: none;
    padding-left: 12px;
    transition: all $transition-fast;

    &:hover {
      border-color: $border-hover;
    }

    &.is-focus {
      border-color: $accent-indigo;
      box-shadow: 0 0 0 2px $accent-indigo-dim;
    }
  }

  :deep(.el-input-group__append) {
    background: $accent-indigo-dim;
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-left: none;
    border-radius: 0 $radius-md $radius-md 0;
    color: $accent-indigo;
    box-shadow: none;
  }
}

.search-btn {
  &:hover {
    color: $accent-purple;
  }
}

.history-dropdown {
  position: absolute;
  top: 44px;
  left: 0;
  right: 0;
  background: $bg-elevated;
  border: 1px solid $border-subtle;
  border-radius: $radius-md;
  box-shadow: $shadow-lg;
  z-index: 50;
  max-height: 280px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid $border-micro;

  span {
    color: $text-tertiary;
    font-size: 12px;
  }

  button {
    background: none;
    border: none;
    color: $text-muted;
    font-size: 12px;
    cursor: pointer;

    &:hover { color: $danger; }
  }
}

.history-item {
  padding: 8px 12px;
  color: $text-secondary;
  font-size: 13px;
  cursor: pointer;
  transition: background $transition-fast;

  &:hover {
    background: $bg-surface-hover;
    color: $text-primary;
  }
}
</style>
