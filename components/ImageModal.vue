<template>
  <div v-if="isOpen" class="image-modal" @click="close">
    <button class="close-button" @click.stop="close">
      <img src="~/assets/icons/close.svg" alt="Close" class="close-icon" />
    </button>
    
    <div class="modal-content" @click.stop>
      <div class="image-container">
        <img 
          :src="image.url" 
          :alt="image.alternativeText || ''" 
          class="modal-image"
        />
        <div v-if="caption" class="modal-caption">{{ caption }}</div>
      </div>
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
  box-sizing: border-box;
  overflow-y: auto; /* Allow scrolling if content is tall */
}

.modal-content {
  margin: auto;
  text-align: center;
  padding: 40px 20px 70px; /* Extra padding at bottom for captions */
  max-height: 100vh;
  max-width: 90vw;
  overflow: visible;
}

.image-container {
  position: relative; /* For absolute positioning of caption */
  display: inline-block; /* Ensure it's only as big as needed */
}

.modal-image {
  max-width: 100%;
  max-height: 75vh;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

.modal-caption {
  position: absolute;
  bottom: -30px; /* Position below the image */
  left: 0;
  right: 0;
  color: white;
  font-size: var(--font-size-sm);
  text-align: left; /* Left align text */
  padding: 5px 10px; /* More padding on left/right */
  background-color: rgba(0, 0, 0, 0.8); /* 80% opacity */
  border-radius: 4px;
  opacity: 0.8; /* 80% opacity for the text */
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