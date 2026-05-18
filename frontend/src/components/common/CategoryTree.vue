<template>
  <div class="category-tree">
    <el-tree
      :data="tree"
      :props="{ label: 'name', children: 'children' }"
      node-key="id"
      highlight-current
      default-expand-all
      @node-click="handleClick"
    />
  </div>
</template>

<script setup>
defineProps({ tree: { type: Array, default: () => [] } })
const emit = defineEmits(['select'])

function handleClick(node) {
  emit('select', node.id)
}
</script>

<style scoped>
.category-tree {
  padding: 8px;
}
</style>
