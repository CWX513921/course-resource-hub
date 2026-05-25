<template>
  <div class="user-center">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="我的收藏" name="favorites">
        <el-table :data="favorites" v-loading="loading">
          <el-table-column prop="title" label="资源标题" min-width="200" />
          <el-table-column prop="file_type" label="类型" width="80">
            <template #default="{ row }">{{ row.file_type?.toUpperCase() }}</template>
          </el-table-column>
          <el-table-column prop="download_count" label="下载量" width="80" />
          <el-table-column prop="favorited_at" label="收藏时间" width="180" />
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button size="small" @click="$router.push(`/resource/${row.resource_id}`)">查看</el-button>
              <el-button size="small" type="danger" @click="handleUnfavorite(row)">取消</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="个人信息" name="info">
        <div class="info-card" v-if="userInfo">
          <div class="info-row">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ userInfo.username }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">角色</span>
            <span class="info-value">{{ roleLabel }}</span>
          </div>
        </div>
        <button class="logout-action" @click="handleLogout">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M5 2H2.5a1 1 0 00-1 1v8a1 1 0 001 1H5M9.5 9.5L12.5 7l-3-2.5M12 7H5"/>
          </svg>
          退出登录
        </button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('favorites')
const favorites = ref([])
const loading = ref(false)
const userInfo = computed(() => userStore.userInfo)
const roleLabel = computed(() => {
  const map = { student: '学生', teacher: '教师', admin: '管理员' }
  return map[userInfo.value?.role] || userInfo.value?.role
})

onMounted(() => fetchFavorites())

async function fetchFavorites() {
  loading.value = true
  try {
    const res = await request.get('/favorites', { params: { pageSize: 100 } })
    favorites.value = res.data.list
  } catch {} finally {
    loading.value = false
  }
}

async function handleUnfavorite(row) {
  await ElMessageBox.confirm('确定取消收藏？', '提示', { type: 'warning' })
  try {
    await request.delete(`/favorites/${row.resource_id}`)
    ElMessage.success('已取消收藏')
    await fetchFavorites()
  } catch (err) {
    ElMessage.error(err.message || '操作失败')
  }
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.user-center {
  max-width: 800px;
}

.info-card {
  background: $bg-surface;
  border: 1px solid $border-micro;
  border-radius: $radius-md;
  overflow: hidden;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid $border-micro;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  width: 80px;
  color: $text-tertiary;
  font-size: 13px;
  flex-shrink: 0;
}

.info-value {
  color: $text-primary;
  font-size: 14px;
}

.logout-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: $radius-sm;
  color: $danger;
  font-size: 13px;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.25);
  }
}
</style>
