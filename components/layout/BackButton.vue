<template>
  <NuxtLink to="/" class="back-button" v-if="showBackButton">
    <img 
      :src="iconSrc" 
      alt="Back" 
      class="icon" 
    />
  </NuxtLink>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import lightIcon from '~/assets/icons/arrow_back_light.svg'
import darkIcon from '~/assets/icons/arrow_back_dark.svg'

const route = useRoute()
const isDarkMode = ref(false)

// Only show the back button on post pages
const showBackButton = computed(() => {
  return route.path.includes('/posts/')
})

// Determine which icon to use based on the theme
const iconSrc = computed(() => {
  return isDarkMode.value ? darkIcon : lightIcon
})

// Check for dark mode
onMounted(() => {
  // Initial check
  isDarkMode.value = document.documentElement.classList.contains('dark-mode')
  
  // Listen for theme changes
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark-mode')
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})
</script>

<style scoped>
.back-button {
  font-size: 1rem;
  color: var(--color-text-primary);
  text-decoration: none;
  /* This ensures the SVG inherits the color */
  fill: var(--color-text-primary);
}

.back-button:hover {
  opacity: 0.7;
}

.icon {
  width: 48px;
  height: 48px;
}
</style>