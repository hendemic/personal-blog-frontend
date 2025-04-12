<template>
  <button @click="toggleTheme" class="theme-toggle" aria-label="Toggle dark mode">
    <img v-if="isDarkMode" src="~/assets/icons/light_mode.svg" alt="Light mode" class="icon" />
    <img v-else src="~/assets/icons/dark_mode.svg" alt="Dark mode" class="icon" />
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDarkMode = ref(false)

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-mode')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark-mode')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  // Check for saved theme preference or use OS preference
  const savedTheme = localStorage.getItem('theme')
  
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark-mode')
  } else if (savedTheme === 'light') {
    isDarkMode.value = false
    document.documentElement.classList.remove('dark-mode')
  } else {
    // If no saved preference, check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = prefersDark
    
    if (prefersDark) {
      document.documentElement.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      localStorage.setItem('theme', 'light')
    }
  }
})
</script>

<style scoped>
.theme-toggle {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
}

.theme-toggle:hover {
  opacity: 0.7;
}

.icon {
  width: 30px;
  height: 30px;
}

/* Make dark_mode icon darker in light mode */
:root:not(.dark-mode) .icon {
  filter: brightness(0.8);
}

/* Make light_mode icon less bright in dark mode */
.dark-mode .icon {
  filter: brightness(0.7);
}
</style>