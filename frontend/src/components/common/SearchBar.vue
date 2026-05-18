<template>
  <div class="search-bar">
    <el-input
      v-model="keyword"
      placeholder="搜索课程资源..."
      clearable
      @keyup.enter="handleSearch"
      @clear="handleSearch"
    >
      <template #append>
        <el-button :icon="Search" @click="handleSearch" />
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const emit = defineEmits(['search'])
const keyword = ref('')

function handleSearch() {
  emit('search', keyword.value)
}
</script>

<style scoped>
.search-bar {
  margin-bottom: 16px;
}
</style>
