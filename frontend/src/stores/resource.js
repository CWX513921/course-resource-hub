import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useResourceStore = defineStore('resource', () => {
  const list = ref([])
  const total = ref(0)
  const current = ref(null)
  const filters = ref({ keyword: '', category: '', tag: '' })
  const pagination = ref({ page: 1, pageSize: 20 })

  async function fetchList(params = {}) {
    const query = {
      ...filters.value,
      ...pagination.value,
      ...params
    }
    const res = await request.get('/resources', { params: query })
    list.value = res.data.list
    total.value = res.data.total
    pagination.value.page = res.data.page
    pagination.value.pageSize = res.data.pageSize
  }

  async function fetchDetail(id) {
    const res = await request.get(`/resources/${id}`)
    current.value = res.data
    return res.data
  }

  async function downloadResource(id) {
    const res = await request.post(`/resources/${id}/download`)
    return res.data
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
  }

  return { list, total, current, filters, pagination, fetchList, fetchDetail, downloadResource, setFilters }
})
