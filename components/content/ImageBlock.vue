<template>
  <figure class="image-block">
    <nuxt-img 
      :src="getImageUrl(block.image, 'large')" 
      :alt="block.image?.alternativeText || block.caption || ''" 
      sizes="xl:2000px lg:1600px md:1024px sm:600px"
      preset="blog"
      loading="lazy"
      placeholder
      class="image"
      @click="openModal"
    />
    <figcaption v-if="block.caption" class="caption">{{ block.caption }}</figcaption>
  </figure>
  
  <ImageModal ref="imageModal" />
</template>

<script setup>
import { ref } from 'vue'
import ImageModal from '~/components/ImageModal.vue'

// Helper function to get optimal image URL based on format size
function getImageUrl(image, size = 'large') {
  if (!image) return ''
  
  // If formats are available, use them (formats is a JSON field in Strapi)
  if (image.formats) {
    const formats = typeof image.formats === 'string' 
      ? JSON.parse(image.formats) 
      : image.formats
      
    if (size === 'thumbnail' && formats.thumbnail) {
      return formats.thumbnail.url
    } else if (size === 'small' && formats.small) {
      return formats.small.url
    } else if (size === 'medium' && formats.medium) {
      return formats.medium.url
    } else if (size === 'large' && formats.large) {
      return formats.large.url
    }
  }
  
  // Fallback to original URL if format not available
  return image.url
}

const props = defineProps({
  block: {
    type: Object,
    required: true
  }
})

const imageModal = ref(null)

function openModal() {
  if (props.block.image && imageModal.value) {
    imageModal.value.open(props.block.image, props.block.caption)
  }
}
</script>

<style scoped>
.image-block {
  margin: var(--spacing-xl) 0;
}

.image {
  width: 100%;
  height: auto;
  display: block;
  cursor: pointer;
  transition: opacity 0.2s;
}

.image:hover {
  opacity: 0.9;
}

.caption {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
  font-style: italic;
}
</style>