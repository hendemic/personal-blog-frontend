<template>
  <div class="post-navigation">
    <NuxtLink 
      v-if="previousPost" 
      :to="`/posts/${previousPost.slug}`" 
      class="nav-button prev-button"
    >
      Previous
    </NuxtLink>
    
    <div v-else class="nav-placeholder"></div>
    
    <NuxtLink 
      v-if="nextPost" 
      :to="`/posts/${nextPost.slug}`" 
      class="nav-button next-button"
    >
      Next
    </NuxtLink>
    
    <div v-else class="nav-placeholder"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentSlug: {
    type: String,
    required: true
  },
  previousPost: {
    type: Object,
    default: null
  },
  nextPost: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.post-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-4xl);
  margin-bottom: var(--spacing-2xl);
  width: 100%;
  gap: var(--spacing-md);
}

.nav-button {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  background-color: var(--color-background);
  color: var(--color-text-primary);
  text-decoration: none;
  border: 1px solid var(--color-border);
  transition: background-color 0.2s;
  font-weight: var(--font-weight-medium);
  width: 120px;
  text-align: center;
}

.nav-button:hover {
  background-color: var(--color-border);
}

.prev-button {
  text-align: center;
}

.next-button {
  text-align: center;
  margin-left: auto;
}

.nav-placeholder {
  width: 120px;
}

@media (max-width: 768px) {
  .post-navigation {
    flex-direction: row;
    gap: var(--spacing-md);
  }
  
  .nav-button, .nav-placeholder {
    width: 120px;
  }
}
</style>