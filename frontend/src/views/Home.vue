<template>
  <div class="home-page">
    <SearchBar @search="onSearch" />
    <div class="home-body">
      <aside class="category-panel">
        <div class="panel-header">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3">
            <rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/>
          </svg>
          <span>资源分类</span>
        </div>
        <CategoryTree :tree="categoryStore.tree" @select="onCategorySelect" />
      </aside>
      <div class="resource-panel">
        <div class="view-toggle">
          <button :class="{ active: viewMode === 'card' }" @click="viewMode = 'card'">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
          </button>
          <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M2 3h12M2 6.5h12M2 10h12M2 13.5h12"/></svg>
          </button>
        </div>
        <div v-loading="loading" class="resource-list" :class="viewMode">
          <ResourceCard v-for="item in resourceStore.list" :key="item.id" :resource="item" :compact="viewMode === 'list'" />
          <div v-if="!loading && resourceStore.list.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
              <rect x="6" y="6" width="36" height="36" rx="8"/><path d="M18 24h12M24 18v12"/>
            </svg>
            <p>暂无资源</p>
          </div>
        </div>
        <el-pagination
          v-if="resourceStore.total > 0"
          class="pagination"
          layout="prev, pager, next, total"
          :total="resourceStore.total"
          :page-size="resourceStore.pagination.pageSize"
          v-model:current-page="resourceStore.pagination.page"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useResourceStore } from '@/stores/resource'
import { useCategoryStore } from '@/stores/category'
import SearchBar from '@/components/common/SearchBar.vue'
import ResourceCard from '@/components/common/ResourceCard.vue'
import CategoryTree from '@/components/common/CategoryTree.vue'

const resourceStore = useResourceStore()
const categoryStore = useCategoryStore()
const loading = ref(false)
const viewMode = ref('card')

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([resourceStore.fetchList(), categoryStore.fetchTree()])
  } finally {
    loading.value = false
  }
})

function onSearch(keyword) {
  resourceStore.setFilters({ keyword })
  resourceStore.fetchList()
}

function onCategorySelect(categoryId) {
  resourceStore.setFilters({ category: categoryId })
  resourceStore.fetchList()
}

function onPageChange(page) {
  resourceStore.pagination.page = page
  resourceStore.fetchList()
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.home-page {
  max-width: 1200px;
}

.home-body {
  display: flex;
  gap: 16px;
  min-height: 400px;
}

.category-panel {
  width: 200px;
  flex-shrink: 0;
  background: $bg-surface;
  border: 1px solid $border-micro;
  border-radius: $radius-md;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid $border-micro;
  color: $text-primary;
  font-size: 13px;
  font-weight: 600;
}

.resource-panel {
  flex: 1;
  min-width: 0;
}

.resource-list {
  min-height: 200px;

  &.card {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    :deep(.resource-card) {
      margin-bottom: 0;
    }
  }

  &.list {
    :deep(.resource-card) {
      .card-desc {
        max-width: 400px;
      }
    }
  }
}

.view-toggle {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: $bg-surface;
    border: 1px solid $border-micro;
    border-radius: $radius-sm;
    color: $text-tertiary;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      border-color: $border-hover;
      color: $text-primary;
    }

    &.active {
      background: $accent-indigo-dim;
      border-color: rgba(99, 102, 241, 0.2);
      color: $accent-indigo;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: $text-muted;

  p {
    margin-top: 12px;
    font-size: 14px;
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
