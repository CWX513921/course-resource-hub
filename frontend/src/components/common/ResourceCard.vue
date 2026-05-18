<template>
  <el-card shadow="hover" class="resource-card" @click="$router.push(`/resource/${resource.id}`)">
    <div class="card-header">
      <el-tag :type="fileTypeTag" size="small">{{ resource.file_type?.toUpperCase() }}</el-tag>
      <span class="card-title">{{ resource.title }}</span>
    </div>
    <p class="card-desc">{{ resource.description || '暂无描述' }}</p>
    <div class="card-footer">
      <span>{{ resource.uploader_name || '未知' }}</span>
      <span>{{ resource.category_name || '未分类' }}</span>
      <span>下载 {{ resource.download_count || 0 }}</span>
      <span>浏览 {{ resource.view_count || 0 }}</span>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ resource: { type: Object, required: true } })

const fileTypeTag = computed(() => {
  const map = { pdf: 'danger', ppt: 'warning', doc: 'success', xls: 'info' }
  return map[props.resource.file_type] || ''
})
</script>

<style scoped>
.resource-card {
  cursor: pointer;
  margin-bottom: 12px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.card-title {
  font-weight: bold;
  font-size: 16px;
}
.card-desc {
  color: #666;
  font-size: 13px;
  margin: 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-footer {
  display: flex;
  gap: 16px;
  color: #999;
  font-size: 12px;
}
</style>
