<template>
  <div class="admin-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="统计概览" name="stats">
        <el-row :gutter="16" class="stats-cards">
          <el-col :span="6" v-for="(item, key) in overview" :key="key">
            <el-card shadow="hover">
              <el-statistic :title="statLabels[key]" :value="item" />
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="16" style="margin-top:16px">
          <el-col :span="12">
            <el-card header="下载量Top10资源">
              <div ref="barChartRef" style="height:300px"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card header="分类资源数量">
              <div ref="pieChartRef" style="height:300px"></div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="用户管理" name="users">
        <el-table :data="users" v-loading="usersLoading" stripe>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="{ row }">
              <el-tag>{{ { student: '学生', teacher: '教师', admin: '管理员' }[row.role] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'">{{ row.status === 'active' ? '正常' : '禁用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button v-if="row.role !== 'admin'" size="small" :type="row.status === 'active' ? 'danger' : 'success'" @click="toggleUserStatus(row)">
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const activeTab = ref('stats')
const overview = reactive({ totalUsers: 0, totalResources: 0, totalDownloads: 0, totalFavorites: 0 })
const statLabels = { totalUsers: '总用户数', totalResources: '已发布资源', totalDownloads: '总下载量', totalFavorites: '总收藏数' }
const barChartRef = ref(null)
const pieChartRef = ref(null)
const users = ref([])
const usersLoading = ref(false)
const topDownloadedData = ref([])
const categoryData = ref([])
let barChart = null
let pieChart = null

onMounted(async () => {
  await Promise.all([fetchOverview(), fetchTopDownloaded(), fetchCategoryStats(), fetchUsers()])
  await nextTick()
  initCharts()
})

onBeforeUnmount(() => {
  if (barChart) { barChart.dispose(); barChart = null }
  if (pieChart) { pieChart.dispose(); pieChart = null }
})

async function fetchOverview() {
  try {
    const res = await request.get('/stats/overview')
    Object.assign(overview, res.data)
  } catch {}
}

async function fetchTopDownloaded() {
  try {
    const res = await request.get('/stats/resources/top-downloaded', { params: { limit: 10 } })
    topDownloadedData.value = res.data || []
  } catch {}
}

async function fetchCategoryStats() {
  try {
    const res = await request.get('/stats/categories')
    categoryData.value = (res.data || []).filter(item => item.resource_count > 0)
  } catch {}
}

async function fetchUsers() {
  usersLoading.value = true
  try {
    const res = await request.get('/users', { params: { pageSize: 100 } })
    users.value = res.data.list
  } catch {} finally {
    usersLoading.value = false
  }
}

function initCharts() {
  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value)
    updateBarChart()
  }
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
    updatePieChart()
  }
}

function updateBarChart() {
  if (!barChart) return
  const data = topDownloadedData.value
  barChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map(i => (i.title || '').substring(0, 8)), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: data.map(i => i.download_count || 0), itemStyle: { color: '#409eff' } }]
  }, true)
}

function updatePieChart() {
  if (!pieChart) return
  const data = categoryData.value
  if (data.length === 0) {
    pieChart.setOption({
      title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } }
    }, true)
    return
  }
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left', top: 'middle' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      data: data.map(i => ({ name: i.category_name || '未分类', value: i.resource_count || 0 })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      label: { formatter: '{b}: {c}' }
    }]
  }, true)
}

async function toggleUserStatus(user) {
  const newStatus = user.status === 'active' ? 'disabled' : 'active'
  try {
    await request.put(`/users/${user.id}/status`, { status: newStatus })
    ElMessage.success('状态更新成功')
    await fetchUsers()
  } catch (err) {
    ElMessage.error(err.message || '操作失败')
  }
}
</script>

<style scoped>
.admin-page {
  padding: 16px;
}
.stats-cards {
  margin-bottom: 16px;
}
</style>
