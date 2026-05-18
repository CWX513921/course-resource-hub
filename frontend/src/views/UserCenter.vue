<template>
  <div class="user-center">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="我的收藏" name="favorites">
        <el-table :data="favorites" v-loading="loading" stripe>
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
        <el-descriptions :column="1" border v-if="userInfo">
          <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ roleLabel }}</el-descriptions-item>
        </el-descriptions>
        <el-button type="danger" style="margin-top:16px" @click="handleLogout">退出登录</el-button>
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

<style scoped>
.user-center {
  padding: 16px;
}
</style>
