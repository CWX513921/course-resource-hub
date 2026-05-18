import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useCategoryStore = defineStore('category', () => {
  const tree = ref([])

  async function fetchTree() {
    const res = await request.get('/categories/tree')
    tree.value = res.data
  }

  return { tree, fetchTree }
})
