<template>
  <div v-if="isOpen" class="image-modal" @click="close">
    <button class="close-button" @click.stop="close">
      <img src="~/assets/icons/close.svg" alt="Close" class="close-icon" />
    </button>

    <!-- Navigation buttons - only shown when carousel images are available -->
    <div v-if="hasCarouselImages" class="navigation-controls">
      <button
        class="nav-button prev-button"
        @click.stop="showPrevImage"
        :disabled="!canGoBack"
        :class="{ 'disabled': !canGoBack }"
      >
        <img src="~/assets/icons/chevron_back.svg" alt="Previous" class="nav-icon" />
      </button>

      <button
        class="nav-button next-button"
        @click.stop="showNextImage"
        :disabled="!canGoForward"
        :class="{ 'disabled': !canGoForward }"
      >
        <img src="~/assets/icons/chevron_forward.svg" alt="Next" class="nav-icon" />
      </button>
    </div>

    <div 
      class="modal-content" 
      @click.stop
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div class="image-container">
        <img
          :src="image.url"
          :alt="image.alternativeText || ''"
          class="modal-image"
        />
        <div v-if="caption" class="modal-caption">{{ caption }}</div>
      </div>
    </div>

    <!-- Image counter when in carousel mode -->
    <div v-if="hasCarouselImages" class="image-counter">
      {{ currentImageIndex + 1 }} / {{ carouselImages.length }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)
const image = ref(null)
const caption = ref(null)
const carouselImages = ref([])
const currentImageIndex = ref(0)

// Determine if we're in carousel mode
const hasCarouselImages = computed(() => {
  return carouselImages.value && carouselImages.value.length > 1
})

// Navigation availability
const canGoBack = computed(() => {
  return hasCarouselImages.value && currentImageIndex.value > 0
})

const canGoForward = computed(() => {
  return hasCarouselImages.value && currentImageIndex.value < carouselImages.value.length - 1
})

// Save the current scroll position
let savedScrollPosition = 0

// Standard open function (for non-carousel images)
function open(imageData, captionText) {
  image.value = imageData
  caption.value = captionText
  carouselImages.value = [] // Clear any previous carousel data
  isOpen.value = true
  
  // Save the current scroll position
  savedScrollPosition = window.scrollY
  
  // Prevent scrolling when modal is open without changing the visual scroll position
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
  document.body.style.top = `-${savedScrollPosition}px`
  document.documentElement.style.scrollBehavior = 'auto' // Prevent smooth scrolling when reopening
}

// Open function for carousel images
function openCarousel(images, index, captions) {
  if (!images || !images.length) return

  carouselImages.value = images
  currentImageIndex.value = index || 0

  // Set the current image and caption
  const currentImage = carouselImages.value[currentImageIndex.value]
  image.value = currentImage.image
  caption.value = captions ? captions[currentImageIndex.value] : currentImage.caption

  isOpen.value = true
  
  // Save the current scroll position
  savedScrollPosition = window.scrollY
  
  // Prevent scrolling when modal is open without changing the visual scroll position
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
  document.body.style.top = `-${savedScrollPosition}px`
  document.documentElement.style.scrollBehavior = 'auto'
}

function showNextImage() {
  if (!canGoForward.value) return

  currentImageIndex.value++
  const currentImage = carouselImages.value[currentImageIndex.value]
  image.value = currentImage.image
  caption.value = currentImage.caption
}

function showPrevImage() {
  if (!canGoBack.value) return

  currentImageIndex.value--
  const currentImage = carouselImages.value[currentImageIndex.value]
  image.value = currentImage.image
  caption.value = currentImage.caption
}

function close() {
  isOpen.value = false
  
  // Remove all scroll locks
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
  document.body.style.top = ''
  
  // Directly restore to the saved position
  window.scrollTo(0, savedScrollPosition)
  
  // Restore default scroll behavior after a short delay
  setTimeout(() => {
    document.documentElement.style.scrollBehavior = ''
  }, 100)
}

// Handle keyboard navigation
function handleKeyDown(e) {
  if (!isOpen.value) return

  if (e.key === 'Escape') {
    close()
  } else if (e.key === 'ArrowRight' && hasCarouselImages.value) {
    showNextImage()
  } else if (e.key === 'ArrowLeft' && hasCarouselImages.value) {
    showPrevImage()
  }
}

// Add keyboard event listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// Touch gesture handling
let touchStartX = 0
let touchEndX = 0
let touchMoved = false
let touchStartTime = 0

function handleTouchStart(event) {
  if (!hasCarouselImages.value) return
  touchStartX = event.touches[0].clientX
  touchEndX = touchStartX // Initialize end position
  touchMoved = false // Reset movement flag
  touchStartTime = Date.now() // Record start time
}

function handleTouchMove(event) {
  if (!hasCarouselImages.value) return
  
  // Prevent default to stop background scrolling while modal is open
  event.preventDefault()
  
  touchEndX = event.touches[0].clientX
  
  // Mark as moved if there was significant movement
  if (Math.abs(touchEndX - touchStartX) > 10) {
    touchMoved = true
  }
}

function handleTouchEnd() {
  if (!hasCarouselImages.value) return
  
  // Calculate time of touch
  const touchDuration = Date.now() - touchStartTime
  
  // If it's a quick tap without movement, ignore it
  if (!touchMoved && touchDuration < 300) {
    return
  }
  
  // Determine swipe direction (left or right)
  const swipeThreshold = 100 // Increased minimum distance for a swipe to be registered
  const swipeDistance = touchEndX - touchStartX
  
  // Calculate swipe as a percentage of screen width for better responsiveness on different devices
  const screenWidth = window.innerWidth
  const swipePercentage = (Math.abs(swipeDistance) / screenWidth) * 100
  
  // Require either 100px absolute distance OR 15% of screen width, whichever is smaller
  // This ensures it works well on both large and small devices
  if (Math.abs(swipeDistance) < swipeThreshold && swipePercentage < 15) {
    // Not a significant swipe - ignore
    return
  }
  
  // Ensure there was actual movement and not just a small value
  if (touchEndX === touchStartX || !touchMoved) {
    return
  }
  
  if (swipeDistance > 0 && canGoBack.value) {
    // Swiped right - go to previous image
    showPrevImage()
  } else if (swipeDistance < 0 && canGoForward.value) {
    // Swiped left - go to next image
    showNextImage()
  }
}

// Expose methods for parent components
defineExpose({
  open,
  openCarousel,
  close
})
</script>

<style scoped>
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.97);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
  box-sizing: border-box;
  overflow-y: auto; /* Allow scrolling if content is tall */
  /* Fix for iOS and other mobile browsers */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
  /* Ensure the overlay covers the entire screen including iOS notches and safe areas */
  min-height: 100vh;
  min-height: -webkit-fill-available;
  margin: 0;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  /* Extend beyond default viewport boundaries */
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: -webkit-fill-available;
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
  max-height: 90vh; /* Increased max height to use more vertical space */
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

/* Navigation buttons */
.navigation-controls {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Allow clicks to pass through to the background */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.nav-button {
  background: transparent;
  border: none;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  pointer-events: auto; /* Make buttons clickable */
  transition: all 0.2s ease;
}

.nav-button:hover {
  transform: scale(1.1);
}

.nav-button.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-icon {
  width: 42px;
  height: 42px;
  filter: brightness(0) invert(1); /* Make the icon white */
}

/* Mobile optimization for navigation */
@media (max-width: 768px) {
  .navigation-controls {
    padding: 0 10px; /* Position closer to edges on mobile */
  }

  .nav-button {
    width: 45px;
    height: 45px;
  }

  .nav-icon {
    width: 32px;
    height: 32px;
  }
}

/* Extra optimization for very small screens */
@media (max-width: 480px) {
  .navigation-controls {
    padding: 0 5px; /* Position even closer to edges on small mobile */
  }

  .nav-button {
    width: 40px;
    height: 40px;
  }

  .nav-icon {
    width: 28px;
    height: 28px;
  }
}

/* Landscape orientation optimization */
@media (orientation: landscape) and (max-height: 600px) {
  .image-modal {
    /* Additional iOS-specific fixes for landscape mode */
    height: 100vh;
    height: -webkit-fill-available;
    min-height: stretch; /* Modern browsers */
    max-height: -webkit-fill-available;
    /* Additional fixes for iOS dynamic island in landscape mode */
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    width: 100vw;
    /* Prevent overlap issues */
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
  
  .modal-image {
    max-height: 70vh; /* Reduce height in landscape mode */
  }
  
  .modal-content {
    padding: 20px 20px 40px; /* Reduced padding */
  }
  
  .image-counter {
    bottom: 10px;
  }
  
  .close-button {
    top: 10px;
    right: 10px;
  }
  
  .close-icon {
    width: 36px;
    height: 36px;
  }
  
  .nav-button {
    width: 40px;
    height: 40px;
  }
  
  .nav-icon {
    width: 30px;
    height: 30px;
  }
}

/* Image counter */
.image-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
}
</style>
