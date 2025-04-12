<template>
  <div>
    <div class="header">
      <BackButton />
      <ThemeToggle />
    </div>
    <slot />
  </div>
</template>

<script setup>
import ThemeToggle from '~/components/layout/ThemeToggle.vue'
import BackButton from '~/components/layout/BackButton.vue'
</script>

<style scoped>
.header {
  position: relative; /* For absolute positioning of children */
  display: flex;
  justify-content: flex-start; /* Only position the back button */
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
  min-height: 68px; /* Set minimum height based on the back button size */
}

/* Position the theme toggle with absolute positioning for consistent placement */
.header :deep(.theme-toggle) {
  position: absolute;
  top: 20px;  /* Match the header padding */
  right: 20px; /* Match the header padding */
  display: flex;
  align-items: center;
}
</style>