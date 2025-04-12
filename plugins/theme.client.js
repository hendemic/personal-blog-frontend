// Client-side only plugin to handle theme initialization
// This prevents flash of wrong theme on page load

export default defineNuxtPlugin(() => {
  if (process.client) {
    // Get theme from localStorage
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-mode')
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark-mode')
    } else {
      // If no saved theme, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      if (prefersDark) {
        document.documentElement.classList.add('dark-mode')
        localStorage.setItem('theme', 'dark')
      } else {
        localStorage.setItem('theme', 'light')
      }
    }
  }
})