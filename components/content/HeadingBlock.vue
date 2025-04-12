<template>
  <div class="heading-block">
    <component :is="headingTag" class="heading">{{ block.heading }}</component>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  block: {
    type: Object,
    required: true
  }
})

// Default to h2 if level is missing or invalid
const headingTag = computed(() => {
  const level = props.block.level
  if (level >= 1 && level <= 6) {
    return 'h' + level
  }
  return 'h2'
})

// Log the heading level for debugging
console.log('Heading level:', props.block.level, 'Resolved to:', headingTag.value)
</script>

<style scoped>
.heading-block {
  margin: var(--spacing-xl) 0;
}

/* The heading component now inherits styles from global typography.css */
</style>