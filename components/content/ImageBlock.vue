<template>
  <figure class="image-block">
    <img 
      :src="block.image?.url" 
      :alt="block.image?.alternativeText || block.caption || ''" 
      :width="block.image?.width" 
      :height="block.image?.height"
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