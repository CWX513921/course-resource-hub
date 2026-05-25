<template>
  <div class="resource-detail" v-loading="loading">
    <template v-if="resource">
      <div class="detail-card fade-in">
        <div class="detail-header">
          <div class="header-left">
            <h2>{{ resource.title }}</h2>
            <span class="status-badge" :class="resource.status">{{ statusLabel }}</span>
          </div>
        </div>
        <div class="detail-body">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">文件类型</span>
              <span class="info-value">{{ resource.file_type?.toUpperCase() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">文件大小</span>
              <span class="info-value">{{ formatSize(resource.file_size) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">上传者</span>
              <span class="info-value">{{ resource.uploader?.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">分类</span>
              <span class="info-value">{{ resource.category_name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">浏览次数</span>
              <span class="info-value">{{ resource.view_count }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">下载次数</span>
              <span class="info-value">{{ resource.download_count }}</span>
            </div>
          </div>
          <div class="info-full">
            <span class="info-label">上传时间</span>
            <span class="info-value">{{ resource.created_at }}</span>
          </div>
          <div class="info-full">
            <span class="info-label">描述</span>
            <span class="info-value desc">{{ resource.description || '暂无描述' }}</span>
          </div>
        </div>
        <div class="detail-tags" v-if="resource.tags?.length">
          <span class="tag" v-for="tag in resource.tags" :key="tag.id">{{ tag.name }}</span>
        </div>
        <div class="detail-actions">
          <button class="action-btn primary" @click="handleDownload">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M7 2v6M4 5l3 3 3-3M2 10h10"/></svg>
            下载资源
          </button>
          <button class="action-btn" :class="{ favorited: isFavorited }" @click="handleFavorite">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 12.5l-1.05-.95C2.7 8.65 1 7.1 1 5.15 1 3.6 2.2 2.4 3.75 2.4c.87 0 1.7.4 2.25 1.05A3.24 3.24 0 0110.25 2.4C11.8 2.4 13 3.6 13 5.15c0 1.95-1.7 3.5-4.95 6.4L7 12.5z"/></svg>
            {{ isFavorited ? '取消收藏' : '收藏' }}
          </button>
          <button class="action-btn ghost" @click="$router.back()">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 1L3 7l5 6"/></svg>
            返回
          </button>
        </div>
        <div class="comment-section">
          <h3>评论 ({{ commentTotal }})</h3>
          <div class="comment-form">
            <el-input v-model="commentContent" type="textarea" :rows="2" placeholder="写下你的评论..." maxlength="500" show-word-limit />
            <el-button type="primary" size="small" :loading="submittingComment" @click="handleAddComment" style="margin-top:8px">发表评论</el-button>
          </div>
          <div class="comment-list">
            <div v-for="c in comments" :key="c.id" class="comment-item">
              <div class="comment-meta">
                <span class="comment-author">{{ c.username }}</span>
                <span class="comment-time">{{ c.created_at }}</span>
                <button v-if="c.user_id === currentUserId" class="comment-delete" @click="handleDeleteComment(c.id)">删除</button>
              </div>
              <p class="comment-content">{{ c.content }}</p>
            </div>
            <div v-if="comments.length === 0" class="no-comments">暂无评论</div>
          </div>
        </div>
      </div>
    </template>
    <div v-else-if="!loading" class="empty-state">
      <p>资源不存在</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useResourceStore } from '@/stores/resource'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const resourceStore = useResourceStore()
const userStore = useUserStore()
const loading = ref(false)
const isFavorited = ref(false)
const comments = ref([])
const commentTotal = ref(0)
const commentContent = ref('')
const submittingComment = ref(false)
const currentUserId = computed(() => userStore.userInfo?.id)
const resource = computed(() => resourceStore.current)
const statusLabel = computed(() => {
  const map = { published: '已发布', draft: '草稿', archived: '归档' }
  return map[resource.value?.status] || resource.value?.status
})

onMounted(async () => {
  loading.value = true
  try {
    await resourceStore.fetchDetail(route.params.id)
    checkFavoriteStatus()
    fetchComments()
  } finally {
    loading.value = false
  }
})

async function fetchComments() {
  try {
    const res = await request.get(`/comments/${route.params.id}`, { params: { pageSize: 50 } })
    comments.value = res.data.list
    commentTotal.value = res.data.total
  } catch {}
}

async function handleAddComment() {
  if (!commentContent.value.trim()) return ElMessage.warning('请输入评论内容')
  submittingComment.value = true
  try {
    await request.post(`/comments/${route.params.id}`, { content: commentContent.value })
    ElMessage.success('评论成功')
    commentContent.value = ''
    await fetchComments()
  } catch (err) {
    ElMessage.error(err.message || '评论失败')
  } finally {
    submittingComment.value = false
  }
}

async function handleDeleteComment(commentId) {
  try {
    await request.delete(`/comments/${route.params.id}/${commentId}`)
    ElMessage.success('删除成功')
    await fetchComments()
  } catch (err) {
    ElMessage.error(err.message || '删除失败')
  }
}

async function checkFavoriteStatus() {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const res = await request.get(`/favorites/${route.params.id}/check`)
    isFavorited.value = res.data.favorited
  } catch {}
}

async function handleDownload() {
  try {
    const res = await resourceStore.downloadResource(route.params.id)
    if (res.downloadUrl) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'
      const fullUrl = res.downloadUrl.startsWith('http') ? res.downloadUrl : `${apiBase}${res.downloadUrl.replace(/^\/api\/v1/, '')}`
      const response = await fetch(fullUrl, {
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

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.resource-detail {
  max-width: 800px;
}

.detail-card {
  background: $bg-surface;
  border: 1px solid $border-micro;
  border-radius: $radius-lg;
  padding: 24px;
}

.detail-header {
  margin-bottom: 20px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h2 {
    color: $text-primary;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0;
  }
}

.status-badge {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;

  &.published {
    background: rgba(34, 197, 94, 0.12);
    color: $success;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  &.draft {
    background: rgba(161, 161, 170, 0.12);
    color: $text-tertiary;
    border: 1px solid $border-micro;
  }

  &.archived {
    background: rgba(245, 158, 11, 0.12);
    color: $warning;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.info-item, .info-full {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-full {
  margin-bottom: 8px;
}

.info-label {
  color: $text-muted;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.info-value {
  color: $text-primary;
  font-size: 14px;

  &.desc {
    color: $text-secondary;
  }
}

.detail-tags {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 3px 10px;
  background: $bg-surface-hover;
  border: 1px solid $border-micro;
  border-radius: 20px;
  color: $text-secondary;
  font-size: 12px;
}

.detail-actions {
  margin-top: 24px;
  display: flex;
  gap: 10px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: $bg-surface-hover;
  border: 1px solid $border-subtle;
  border-radius: $radius-sm;
  color: $text-secondary;
  font-size: 13px;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $border-hover;
    color: $text-primary;
  }

  &.primary {
    background: linear-gradient(135deg, $accent-indigo, $accent-purple);
    border: none;
    color: white;
    box-shadow: 0 0 16px rgba(99, 102, 241, 0.2);

    &:hover {
      box-shadow: 0 0 24px rgba(99, 102, 241, 0.35);
      transform: translateY(-1px);
    }
  }

  &.favorited {
    color: #EF4444;
    border-color: rgba(239, 68, 68, 0.2);
    background: rgba(239, 68, 68, 0.08);
  }

  &.ghost {
    border: none;
    background: transparent;

    &:hover {
      background: $bg-surface-hover;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: $text-tertiary;
}

.comment-section {
  margin-top: 32px;
  border-top: 1px solid $border-micro;
  padding-top: 20px;

  h3 {
    color: $text-primary;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px;
  }
}

.comment-form {
  margin-bottom: 20px;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid $border-micro;

  &:last-child {
    border-bottom: none;
  }
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.comment-author {
  color: $text-primary;
  font-size: 13px;
  font-weight: 500;
}

.comment-time {
  color: $text-muted;
  font-size: 12px;
}

.comment-delete {
  background: none;
  border: none;
  color: $text-muted;
  font-size: 12px;
  cursor: pointer;
  margin-left: auto;

  &:hover { color: $danger; }
}

.comment-content {
  color: $text-secondary;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.no-comments {
  color: $text-tertiary;
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
}
</style>
