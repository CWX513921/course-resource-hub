<template>
  <div class="admin-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="统计概览" name="stats">
        <div class="stats-grid">
          <div class="stat-card" v-for="(item, key) in overview" :key="key">
            <div class="stat-shimmer"></div>
            <span class="stat-label">{{ statLabels[key] }}</span>
            <span class="stat-value">{{ item }}</span>
          </div>
        </div>
        <div class="charts-row">
          <div class="chart-card">
            <div class="chart-title">下载量 Top10 资源</div>
            <div ref="barChartRef" class="chart-container"></div>
          </div>
          <div class="chart-card">
            <div class="chart-title">分类资源数量</div>
            <div ref="pieChartRef" class="chart-container"></div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="用户管理" name="users">
        <el-table :data="users" v-loading="usersLoading">
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
      <el-tab-pane label="分类管理" name="categories">
        <div class="category-manage">
          <div class="category-actions">
            <el-button type="primary" size="small" @click="showAddCategory = true">添加分类</el-button>
          </div>
          <el-dialog v-model="showAddCategory" title="添加分类" width="400px" destroy-on-close>
            <el-form :model="categoryForm" label-width="80px">
              <el-form-item label="名称">
                <el-input v-model="categoryForm.name" placeholder="分类名称" />
              </el-form-item>
              <el-form-item label="父分类">
                <el-cascader v-model="categoryForm.parentId" :options="categoryTree" :props="{ value: 'id', label: 'name', children: 'children', emitPath: false, checkStrictly: true }" placeholder="顶级分类" clearable change-on-select />
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="showAddCategory = false">取消</el-button>
              <el-button type="primary" :loading="addingCategory" @click="handleAddCategory">添加</el-button>
            </template>
          </el-dialog>
          <el-tree :data="categoryTree" :props="{ label: 'name', children: 'children' }" default-expand-all>
            <template #default="{ data }">
              <span class="cat-node-row">
                <span class="cat-node">{{ data.name }}</span>
                <el-button size="small" type="danger" link @click.stop="handleDeleteCategory(data)">删除</el-button>
              </span>
            </template>
          </el-tree>
          <div v-if="categoryTree.length === 0" class="empty-cat">暂无分类</div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="标签管理" name="tags">
        <div class="tag-manage">
          <div class="tag-actions">
            <el-button type="primary" size="small" @click="openAddTag">添加标签</el-button>
          </div>
          <el-dialog v-model="showAddTag" title="添加标签" width="400px" destroy-on-close>
            <el-form :model="tagForm" label-width="80px">
              <el-form-item label="名称">
                <el-input v-model="tagForm.name" placeholder="标签名称" />
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="showAddTag = false">取消</el-button>
              <el-button type="primary" :loading="addingTag" @click="handleAddTag">添加</el-button>
            </template>
          </el-dialog>
          <el-dialog v-model="showEditTag" title="编辑标签" width="400px" destroy-on-close>
            <el-form :model="tagEditForm" label-width="80px">
              <el-form-item label="名称">
                <el-input v-model="tagEditForm.name" placeholder="标签名称" />
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="showEditTag = false">取消</el-button>
              <el-button type="primary" :loading="editingTag" @click="handleEditTag">保存</el-button>
            </template>
          </el-dialog>
          <el-table :data="tags" v-loading="tagsLoading">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="name" label="标签名" min-width="160" />
            <el-table-column prop="resource_count" label="关联资源数" width="120" />
            <el-table-column prop="created_at" label="创建时间" width="180" />
            <el-table-column label="操作" width="160">
              <template #default="{ row }">
                <el-button size="small" @click="openEditTag(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDeleteTag(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'
import { useCategoryStore } from '@/stores/category'
import { ElMessage, ElMessageBox } from 'element-plus'

const categoryStore = useCategoryStore()
const categoryTree = computed(() => categoryStore.tree)
const showAddCategory = ref(false)
const addingCategory = ref(false)
const categoryForm = reactive({ name: '', parentId: '' })

const tags = ref([])
const tagsLoading = ref(false)
const showAddTag = ref(false)
const showEditTag = ref(false)
const addingTag = ref(false)
const editingTag = ref(false)
const tagForm = reactive({ name: '' })
const tagEditForm = reactive({ id: null, name: '' })

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
  await Promise.all([fetchOverview(), fetchTopDownloaded(), fetchCategoryStats(), fetchUsers(), categoryStore.fetchTree(), fetchTags()])
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
    categoryData.value = res.data || []
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
    barChart = echarts.init(barChartRef.value, 'dark')
    updateBarChart()
  }
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value, 'dark')
    updatePieChart()
  }
}

const darkChartTheme = {
  backgroundColor: 'transparent',
  textStyle: { color: '#A1A1AA' },
  splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
  axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
  axisLabel: { color: '#71717A' }
}

function updateBarChart() {
  if (!barChart) return
  const data = topDownloadedData.value
  barChart.setOption({
    ...darkChartTheme,
    tooltip: { trigger: 'axis', backgroundColor: '#141414', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#EDEDEF' } },
    grid: { left: '8%', right: '4%', bottom: '12%', top: '8%' },
    xAxis: { type: 'category', data: data.map(i => (i.title || '').substring(0, 8)), axisLabel: { rotate: 30, color: '#71717A' }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }, axisTick: { show: false } },
    yAxis: { type: 'value', axisLabel: { color: '#71717A' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }, axisLine: { show: false } },
    series: [{
      type: 'bar',
      data: data.map(i => i.download_count || 0),
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#6366F1' },
          { offset: 1, color: '#A855F7' }
        ])
      },
      barWidth: '60%'
    }]
  }, true)
}

function updatePieChart() {
  if (!pieChart) return
  const data = categoryData.value
  if (data.length === 0) {
    pieChart.setOption({
      ...darkChartTheme,
      title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#52525B', fontSize: 14 } }
    }, true)
    return
  }
  pieChart.setOption({
    ...darkChartTheme,
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', backgroundColor: '#141414', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#EDEDEF' } },
    legend: { orient: 'vertical', left: 'left', top: 'middle', textStyle: { color: '#A1A1AA' } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      data: data.map(i => ({ name: i.category_name || '未分类', value: i.resource_count || 0 })),
      emphasis: { itemStyle: { shadowBlur: 20, shadowColor: 'rgba(99, 102, 241, 0.3)' } },
      label: { formatter: '{b}: {c}', color: '#A1A1AA' },
      itemStyle: {
        borderColor: '#0A0A0A',
        borderWidth: 2
      }
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

async function handleAddCategory() {
  if (!categoryForm.name.trim()) return ElMessage.warning('请输入分类名称')
  addingCategory.value = true
  try {
    await request.post('/categories', { name: categoryForm.name, parentId: categoryForm.parentId || null })
    ElMessage.success('添加成功')
    showAddCategory.value = false
    categoryForm.name = ''
    categoryForm.parentId = ''
    await categoryStore.fetchTree()
  } catch (err) {
    ElMessage.error(err.message || '添加失败')
  } finally {
    addingCategory.value = false
  }
}

async function handleDeleteCategory(node) {
  try {
    await ElMessageBox.confirm(`确定删除分类"${node.name}"吗？`, '确认删除', { type: 'warning' })
    await request.delete(`/categories/${node.id}`)
    ElMessage.success('删除成功')
    await categoryStore.fetchTree()
  } catch (err) {
    if (err !== 'cancel') ElMessage.error(err.message || '删除失败')
  }
}

async function fetchTags() {
  tagsLoading.value = true
  try {
    const res = await request.get('/tags')
    tags.value = res.data || []
  } catch {} finally {
    tagsLoading.value = false
  }
}

function openAddTag() {
  tagForm.name = ''
  showAddTag.value = true
}

async function handleAddTag() {
  if (!tagForm.name.trim()) return ElMessage.warning('请输入标签名称')
  addingTag.value = true
  try {
    await request.post('/tags', { name: tagForm.name })
    ElMessage.success('添加成功')
    showAddTag.value = false
    await fetchTags()
  } catch (err) {
    ElMessage.error(err.message || '添加失败')
  } finally {
    addingTag.value = false
  }
}

function openEditTag(row) {
  tagEditForm.id = row.id
  tagEditForm.name = row.name
  showEditTag.value = true
}

async function handleEditTag() {
  if (!tagEditForm.name.trim()) return ElMessage.warning('请输入标签名称')
  editingTag.value = true
  try {
    await request.put(`/tags/${tagEditForm.id}`, { name: tagEditForm.name })
    ElMessage.success('更新成功')
    showEditTag.value = false
    await fetchTags()
  } catch (err) {
    ElMessage.error(err.message || '更新失败')
  } finally {
    editingTag.value = false
  }
}

async function handleDeleteTag(row) {
  try {
    await ElMessageBox.confirm(`确定删除标签"${row.name}"吗？`, '确认删除', { type: 'warning' })
    await request.delete(`/tags/${row.id}`)
    ElMessage.success('删除成功')
    await fetchTags()
  } catch (err) {
    if (err !== 'cancel') ElMessage.error(err.message || '删除失败')
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.admin-page {
  max-width: 1100px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  background: $bg-surface;
  border: 1px solid $border-micro;
  border-radius: $radius-md;
  overflow: hidden;
  transition: all $transition-normal;

  &:hover {
    border-color: $border-hover;
    box-shadow: $shadow-glow;
  }
}

.stat-shimmer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255, 255, 255, 0.01) 45%,
      rgba(255, 255, 255, 0.02) 50%,
      rgba(255, 255, 255, 0.01) 55%,
      transparent 60%
    );
    animation: shimmer 4s ease-in-out infinite;
  }
}

.stat-label {
  color: $text-tertiary;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  color: $text-primary;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-card {
  background: $bg-surface;
  border: 1px solid $border-micro;
  border-radius: $radius-md;
  padding: 16px;
}

.chart-title {
  color: $text-primary;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
}

.chart-container {
  height: 300px;
}

.category-manage {
  margin-top: 8px;
}

.category-actions {
  margin-bottom: 16px;
}

.tag-manage {
  margin-top: 8px;
}

.tag-actions {
  margin-bottom: 16px;
}

.cat-node-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding-right: 8px;
}

.cat-node {
  color: $text-secondary;
  font-size: 14px;
}

.empty-cat {
  color: $text-tertiary;
  text-align: center;
  padding: 32px 0;
  font-size: 13px;
}

@keyframes shimmer {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(50%); }
}
</style>
