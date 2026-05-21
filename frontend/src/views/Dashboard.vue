<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <h2>教师工作台</h2>
      <el-button type="primary" @click="openUploadDialog">上传资源</el-button>
    </div>

    <el-dialog v-model="showUploadDialog" title="上传资源" width="600px" destroy-on-close>
      <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="uploadForm.title" placeholder="请输入资源标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="uploadForm.description" type="textarea" :rows="3" placeholder="请输入资源描述" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-cascader v-model="uploadForm.categoryId" :options="categoryOptions" :props="{ value: 'id', label: 'name', children: 'children', emitPath: false }" placeholder="请选择分类" clearable />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select v-model="uploadForm.tags" multiple filterable allow-create placeholder="请输入标签" />
        </el-form-item>
        <el-form-item label="文件" prop="file" required>
          <el-upload ref="uploadRef" :auto-upload="false" :limit="1" :on-change="onFileChange" :on-remove="onFileRemove" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip,.rar">
            <el-button type="primary">选择文件</el-button>
            <template #tip><div class="el-upload__tip">支持 PDF/PPT/Word/Excel/ZIP 格式，最大50MB</div></template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleUpload">上传</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="编辑资源" width="600px" destroy-on-close>
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入资源标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入资源描述" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-cascader v-model="editForm.categoryId" :options="categoryOptions" :props="{ value: 'id', label: 'name', children: 'children', emitPath: false }" placeholder="请选择分类" clearable />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
            <el-option label="归档" value="archived" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="editing" @click="handleEditSubmit">保存</el-button>
      </template>
    </el-dialog>

    <el-table :data="myResources" v-loading="loading" stripe>
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="file_type" label="类型" width="80">
        <template #default="{ row }">{{ row.file_type?.toUpperCase() }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'published' ? 'success' : row.status === 'draft' ? 'info' : 'warning'">{{ { published: '已发布', draft: '草稿', archived: '归档' }[row.status] || row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="download_count" label="下载量" width="80" />
      <el-table-column prop="view_count" label="浏览量" width="80" />
      <el-table-column prop="created_at" label="上传时间" width="180" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/category'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const categoryStore = useCategoryStore()
const loading = ref(false)
const uploading = ref(false)
const editing = ref(false)
const showUploadDialog = ref(false)
const showEditDialog = ref(false)
const uploadFormRef = ref(null)
const uploadRef = ref(null)
const editFormRef = ref(null)
const myResources = ref([])
const selectedFile = ref(null)

const uploadForm = reactive({ title: '', description: '', categoryId: '', tags: [] })
const editForm = reactive({ id: null, title: '', description: '', categoryId: '', status: 'published' })
const uploadRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
}
const editRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}
const categoryOptions = computed(() => categoryStore.tree)

onMounted(async () => {
  await categoryStore.fetchTree()
  await fetchMyResources()
})

async function fetchMyResources() {
  loading.value = true
  try {
    const res = await request.get('/resources', { params: { pageSize: 100 } })
    myResources.value = res.data.list
  } finally {
    loading.value = false
  }
}

function openUploadDialog() {
  Object.assign(uploadForm, { title: '', description: '', categoryId: '', tags: [] })
  selectedFile.value = null
  showUploadDialog.value = true
}

function onFileChange(file) { selectedFile.value = file.raw }
function onFileRemove() { selectedFile.value = null }

async function handleUpload() {
  await uploadFormRef.value.validate()
  if (!selectedFile.value) return ElMessage.warning('请选择文件')
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('title', uploadForm.title)
    formData.append('description', uploadForm.description || '')
    formData.append('categoryId', uploadForm.categoryId || 1)
    if (uploadForm.tags.length) formData.append('tags', uploadForm.tags.join(','))
    await request.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    ElMessage.success('上传成功')
    showUploadDialog.value = false
    await fetchMyResources()
  } catch (err) {
    ElMessage.error(err.message || '上传失败')
  } finally {
    uploading.value = false
  }
}

function handleEdit(row) {
  editForm.id = row.id
  editForm.title = row.title
  editForm.description = row.description || ''
  editForm.categoryId = row.category_id || ''
  editForm.status = row.status || 'published'
  showEditDialog.value = true
}

async function handleEditSubmit() {
  await editFormRef.value.validate()
  editing.value = true
  try {
    const data = { title: editForm.title, description: editForm.description, status: editForm.status }
    if (editForm.categoryId) data.categoryId = editForm.categoryId
    await request.put(`/resources/${editForm.id}`, data)
    ElMessage.success('更新成功')
    showEditDialog.value = false
    await fetchMyResources()
  } catch (err) {
    ElMessage.error(err.message || '更新失败')
  } finally {
    editing.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm('确定删除该资源吗？', '确认删除', { type: 'warning' })
  try {
    await request.delete(`/resources/${row.id}`)
    ElMessage.success('删除成功')
    await fetchMyResources()
  } catch (err) {
    ElMessage.error(err.message || '删除失败')
  }
}
</script>

<style scoped>
.dashboard-page {
  padding: 16px;
}
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>
