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

.heading {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
}

/* Apply heading styles directly to the .heading class */
.heading {
  margin-bottom: var(--spacing-md);
  line-height: 1.2;
}

/* Style each heading level */
h1.heading {
  font-size: 4rem; /* Explicitly set size */
  margin-bottom: var(--spacing-lg);
}

h2.heading {
  font-size: 3rem;
}

h3.heading {
  font-size: 2.5rem;
}

h4.heading {
  font-size: 2rem;
}

h5.heading {
  font-size: 1.5rem;
}

h6.heading {
  font-size: 1.25rem;
}
</style>