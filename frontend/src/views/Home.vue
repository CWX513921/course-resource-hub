<template>
  <div class="home-page">
    <SearchBar @search="onSearch" />
    <el-row :gutter="16">
      <el-col :span="5">
        <el-card header="资源分类">
          <CategoryTree :tree="categoryStore.tree" @select="onCategorySelect" />
        </el-card>
      </el-col>
      <el-col :span="19">
        <div v-loading="loading">
          <ResourceCard v-for="item in resourceStore.list" :key="item.id" :resource="item" />
          <el-empty v-if="!loading && resourceStore.list.length === 0" description="暂无资源" />
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
      </el-col>
    </el-row>
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

<style scoped>
.home-page {
  padding: 16px;
}
.pagination {
  margin-top: 16px;
  text-align: center;
}
</style>
