<template>
  <div v-if="isOpen" class="image-modal" @click="close">
    <button class="close-button" @click.stop="close">
      <img src="~/assets/icons/close.svg" alt="Close" class="close-icon" />
    </button>
    
    <div class="modal-content" @click.stop>
      <img 
        :src="image.url" 
        :alt="image.alternativeText || ''" 
        :width="image.width" 
        :height="image.height"
        class="modal-image"
      />
      <div v-if="caption" class="modal-caption">{{ caption }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const image = ref(null)
const caption = ref(null)

function open(imageData, captionText) {
  image.value = imageData
  caption.value = captionText
  isOpen.value = true
  document.body.style.overflow = 'hidden' // Prevent scrolling when modal is open
}

function close() {
  isOpen.value = false
  document.body.style.overflow = '' // Restore scrolling
}

// Expose methods for parent components
defineExpose({
  open,
  close
})
</script>

<style scoped>
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.modal-content {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-image {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
}

.modal-caption {
  color: white;
  margin-top: var(--spacing-md);
  font-size: var(--font-size-sm);
  text-align: center;
  max-width: 80%;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 1010;
}

.close-icon {
  width: 48px;
  height: 48px;
}
</style>