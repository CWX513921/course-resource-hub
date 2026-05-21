<template>
  <div class="resource-detail" v-loading="loading">
    <template v-if="resource">
      <el-card>
        <template #header>
          <div class="detail-header">
            <h2>{{ resource.title }}</h2>
            <el-tag>{{ resource.status }}</el-tag>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文件类型">{{ resource.file_type?.toUpperCase() }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ formatSize(resource.file_size) }}</el-descriptions-item>
          <el-descriptions-item label="上传者">{{ resource.uploader?.name }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ resource.category_name }}</el-descriptions-item>
          <el-descriptions-item label="浏览次数">{{ resource.view_count }}</el-descriptions-item>
          <el-descriptions-item label="下载次数">{{ resource.download_count }}</el-descriptions-item>
          <el-descriptions-item label="上传时间" :span="2">{{ resource.created_at }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ resource.description || '暂无描述' }}</el-descriptions-item>
        </el-descriptions>
        <div class="detail-tags" v-if="resource.tags?.length">
          <el-tag v-for="tag in resource.tags" :key="tag.id" class="tag-item">{{ tag.name }}</el-tag>
        </div>
        <div class="detail-actions">
          <el-button type="primary" @click="handleDownload">下载资源</el-button>
          <el-button @click="handleFavorite">{{ isFavorited ? '取消收藏' : '收藏' }}</el-button>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </el-card>
    </template>
    <el-empty v-else-if="!loading" description="资源不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResourceStore } from '@/stores/resource'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const resourceStore = useResourceStore()
const loading = ref(false)
const isFavorited = ref(false)
const resource = computed(() => resourceStore.current)

onMounted(async () => {
  loading.value = true
  try {
    await resourceStore.fetchDetail(route.params.id)
    checkFavoriteStatus()
  } finally {
    loading.value = false
  }
})

async function checkFavoriteStatus() {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const res = await request.get('/favorites', { params: { page: 1, pageSize: 100 } })
    const resourceId = Number(route.params.id)
    isFavorited.value = res.data.list.some(f => f.resource_id === resourceId)
  } catch {}
}

async function handleDownload() {
  try {
    const res = await resourceStore.downloadResource(route.params.id)
    if (res.downloadUrl) {
      const response = await fetch(res.downloadUrl, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      if (!response.ok) throw new Error('下载失败')
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      let fileName = 'download'
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?(.+)/)
        if (match) fileName = decodeURIComponent(match[1].replace(/"/g, ''))
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
    ElMessage.success('下载成功')
  } catch (err) {
    ElMessage.error(err.message || '下载失败')
  }
}

async function handleFavorite() {
  try {
    if (isFavorited.value) {
      await request.delete(`/favorites/${route.params.id}`)
      isFavorited.value = false
      ElMessage.success('取消收藏')
    } else {
      await request.post(`/favorites/${route.params.id}`)
      isFavorited.value = true
      ElMessage.success('收藏成功')
    }
  } catch (err) {
    ElMessage.error(err.message || '操作失败')
  }
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return size.toFixed(1) + ' ' + units[i]
}
</script>

<style scoped>
.resource-detail {
  padding: 16px;
}
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.detail-header h2 {
  margin: 0;
}
.detail-tags {
  margin-top: 16px;
}
.tag-item {
  margin-right: 8px;
}
.detail-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}
</style>
