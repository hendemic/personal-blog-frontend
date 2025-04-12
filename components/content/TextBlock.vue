<template>
  <div class="text-block" v-html="block.text"></div>
</template>

<script setup>
const props = defineProps({
  block: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.text-block {
  margin-bottom: var(--spacing-xl);
  line-height: 1.7;
  font-size: var(--font-size-base);
}

/* Target paragraph spacing within rich text content */
:deep(p) {
  margin-bottom: var(--spacing-md);
}

:deep(a) {
  color: var(--color-primary);
  text-decoration: none;
}

:deep(a:hover) {
  text-decoration: underline;
}

:deep(ul), :deep(ol) {
  margin-left: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

:deep(li) {
  margin-bottom: var(--spacing-sm);
}

:deep(blockquote) {
  border-left: 4px solid var(--color-border);
  padding-left: var(--spacing-md);
  font-style: italic;
  margin: var(--spacing-lg) 0;
}

:deep(code) {
  font-family: monospace;
  background-color: var(--color-background);
  padding: 2px 4px;
  border-radius: var(--border-radius-sm);
}
</style>