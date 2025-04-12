<template>
  <figure class="image-block">
    <NuxtImg 
      :src="block.image.url" 
      :alt="block.image?.alternativeText || block.caption || ''" 
      preset="blog"
      loading="lazy"
      preload
      :placeholder="[200, 150, 25, 15]"
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

// We don't need this helper anymore since we're letting NuxtImg handle the image processing

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