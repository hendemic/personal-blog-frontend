<template>
  <div>
    <ThemeToggle />
    <BackButton />
    <slot />
  </div>
</template>

<script setup>
import ThemeToggle from '~/components/layout/ThemeToggle.vue'
import BackButton from '~/components/layout/BackButton.vue'
</script>