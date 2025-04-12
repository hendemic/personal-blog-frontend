<template>
  <div class="dynamic-content">
    <template v-for="(block, index) in blocks" :key="index">
      <component 
        :is="getComponentType(block.__typename)" 
        :block="block" 
        v-if="isSupported(block.__typename)" 
      />
    </template>
  </div>
</template>

<script setup>
import HeadingBlock from '~/components/content/HeadingBlock.vue'
import TextBlock from '~/components/content/TextBlock.vue'
import ImageBlock from '~/components/content/ImageBlock.vue'
import MediaGridCarousel from '~/components/content/MediaGridCarousel.vue'

const props = defineProps({
  blocks: {
    type: Array,
    required: true
  }
})

// Map Strapi component types to our Vue components
const componentMap = {
  ComponentContentBlockHeadingBlock: HeadingBlock,
  ComponentContentBlockTextBlock: TextBlock,
  ComponentContentBlockImageBlock: ImageBlock,
  ComponentContentBlockMediaGrid: MediaGridCarousel
}

// Check if we support this block type
function isSupported(typename) {
  return !!componentMap[typename]
}

// Get the Vue component for this block type
function getComponentType(typename) {
  return componentMap[typename] || null
}
</script>

<style scoped>
.dynamic-content {
  width: 100%;
}
</style>