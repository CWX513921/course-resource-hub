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

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;

.category-tree {
  padding: 4px;

  :deep(.el-tree) {
    background: transparent;
    color: $text-secondary;

    .el-tree-node__content {
      height: 32px;
      border-radius: $radius-sm;
      transition: all $transition-fast;
      padding-left: 8px !important;

      &:hover {
        background: $bg-surface-hover;
      }
    }

    .el-tree-node.is-current > .el-tree-node__content {
      background: $accent-indigo-dim;
      color: $accent-indigo;
      font-weight: 500;
    }

    .el-tree-node__expand-icon {
      color: $text-muted;
    }
  }
}
</style>
