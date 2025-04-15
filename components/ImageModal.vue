<template>
  <div v-if="isOpen" class="image-modal-container">
    <!-- Full bleed background that extends into iOS keepout zones -->
    <div class="image-modal-background"></div>

    <!-- Main modal content that respects safe areas -->
    <div class="image-modal" @click="close">
      <button class="close-button" @click.stop="close">
        <img src="~/assets/icons/close.svg" alt="Close" class="close-icon" />
      </button>

      <!-- Simplified approach: Add buttons OUTSIDE the main content -->
      <button
        v-if="hasCarouselImages"
        class="nav-button prev-button"
        @click.stop="showPrevImage()"
        :disabled="!canGoBack"
        :class="{ 'disabled': !canGoBack }"
      >
        <img src="~/assets/icons/chevron_back.svg" alt="Previous" class="nav-icon" />
      </button>

      <button
        v-if="hasCarouselImages"
        class="nav-button next-button"
        @click.stop="showNextImage()"
        :disabled="!canGoForward"
        :class="{ 'disabled': !canGoForward }"
      >
        <img src="~/assets/icons/chevron_back.svg" alt="Next" class="nav-icon nav-icon-flipped" />
      </button>

    <div
      class="modal-content"
      @click.stop
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Carousel mode with sliding functionality -->
      <div v-if="hasCarouselImages" class="images-wrapper" :style="transformStyle">
        <div
          v-for="(carouselItem, idx) in carouselImages"
          :key="idx"
          class="carousel-slide"
        >
          <div class="slide-content">
            <!-- Image centered wrapper -->
            <div class="image-center-wrapper">
              <div class="image-box">
                <NuxtImg
                  :src="carouselItem.image.url"
                  :alt="carouselItem.image.alternativeText || carouselItem.caption || ''"
                  preset="modal"
                  :loading="idx === currentImageIndex ? 'eager' : 'lazy'"
                  :preload="idx >= currentImageIndex - 1 && idx <= currentImageIndex + 1"
                  class="modal-image"
                  @load="idx === currentImageIndex && (imageLoaded = true)"
                />
              </div>
            </div>

            <!-- Caption container directly below the image -->
            <div class="caption-container" :class="{ 'hide-caption': isDragging || isTransitioning }">
              <div v-if="carouselItem.caption && idx === currentImageIndex && imageLoaded"
                  class="modal-caption">
                {{ carouselItem.caption }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Single image mode (non-carousel) -->
      <div v-else class="carousel-slide">
        <div class="slide-content">
          <!-- Image centered wrapper -->
          <div class="image-center-wrapper">
            <div class="image-box">
              <NuxtImg
                v-if="image"
                :src="image?.url"
                :alt="image?.alternativeText || ''"
                preset="modal"
                loading="eager"
                preload
                class="modal-image"
                @load="imageLoaded = true"
              />
            </div>
          </div>
        </div>

        <!-- Caption container positioned absolute -->
        <div class="caption-container" :class="{ 'hide-caption': isDragging || isTransitioning }">
          <div v-if="caption && imageLoaded" class="modal-caption">{{ caption }}</div>
        </div>
      </div>
    </div>

    <!-- Image counter when in carousel mode -->
    <div v-if="hasCarouselImages" class="image-counter">
      {{ currentImageIndex + 1 }} / {{ carouselImages.length }}
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useCarouselSwipe } from '~/composables/useCarouselSwipe'
const img = useImage()

const isOpen = ref(false)
const image = ref(null)
const caption = ref(null)
const carouselImages = ref([])
const currentImageIndex = ref(0)
const imageLoaded = ref(false)
const isTransitioning = ref(false)

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

// Compute previous image URL for preloading (if available)
const prevImageUrl = computed(() => {
  if (!hasCarouselImages.value || !canGoBack.value) return null
  return carouselImages.value[currentImageIndex.value - 1].image.url
})

// Compute next image URL for preloading (if available)
const nextImageUrl = computed(() => {
  if (!hasCarouselImages.value || !canGoForward.value) return null
  return carouselImages.value[currentImageIndex.value + 1].image.url
})

// Save the current scroll position
let savedScrollPosition = 0

// Standard open function (for non-carousel images)
function open(imageData, captionText) {
  // Set modal to open
  isOpen.value = true
  carouselImages.value = [] // Clear any previous carousel data

  // Start with null image to force placeholder
  image.value = null
  caption.value = captionText
  imageLoaded.value = false

  // Save the current scroll position
  savedScrollPosition = window.scrollY

  // Prevent scrolling when modal is open without changing the visual scroll position
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
  document.body.style.top = `-${savedScrollPosition}px`
  document.documentElement.style.scrollBehavior = 'auto' // Prevent smooth scrolling when reopening

  // Set the image in next tick to ensure placeholder shows
  nextTick(() => {
    image.value = imageData
  })
}

// Open function for carousel images
function openCarousel(images, index, captions) {
  if (!images || !images.length) return

  // Open modal with placeholder first
  isOpen.value = true
  carouselImages.value = images
  currentImageIndex.value = index || 0

  // Start with null image to ensure placeholder shows
  image.value = null
  imageLoaded.value = false

  // Save the current scroll position
  savedScrollPosition = window.scrollY

  // Prevent scrolling when modal is open without changing the visual scroll position
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
  document.body.style.top = `-${savedScrollPosition}px`
  document.documentElement.style.scrollBehavior = 'auto'

  // Set the image in the next tick to ensure placeholder shows first
  nextTick(() => {
    const currentImage = carouselImages.value[currentImageIndex.value]
    image.value = currentImage.image
    caption.value = captions ? captions[currentImageIndex.value] : currentImage.caption

    // Initialize carousel dimensions and set position directly without animation
    setTimeout(() => {
      // Ensure dragging is true to prevent transition animation when initially positioning
      isDragging.value = true
      setupCarouselDimensions()

      // Reset dragging state after a short delay to allow future transitions
      setTimeout(() => {
        isDragging.value = false
      }, 50)
    }, 50)
  })
}

// We'll use NuxtImg's preload prop instead of manual preloading

function showNextImage() {
  if (!canGoForward.value) return

  // Start transition state
  isTransitioning.value = true

  // Update index immediately
  currentImageIndex.value++
  imageLoaded.value = false

  // Update the transform to slide to the new position
  if (slideWidth.value) {
    // For desktop OS, make the transition instant
    if (!isMobileOS.value) {
      isDragging.value = true
      currentTranslate.value = -currentImageIndex.value * slideWidth.value
      setTimeout(() => { isDragging.value = false }, 50)
    } else {
      // For mobile OS, use smooth transition
      currentTranslate.value = -currentImageIndex.value * slideWidth.value
    }
  } else {
    // Initialize it if needed
    const modalContent = document.querySelector('.modal-content')
    if (modalContent) {
      slideWidth.value = modalContent.offsetWidth
      currentTranslate.value = -currentImageIndex.value * slideWidth.value
    }
  }

  // When using the buttons, we need to ensure proper state updates
  nextTick(() => {
    // Update the caption if needed
    if (carouselImages.value[currentImageIndex.value].caption) {
      caption.value = carouselImages.value[currentImageIndex.value].caption
    }

    // Keep transition state only during the slide animation
    setTimeout(() => {
      isTransitioning.value = false
    }, 300) // Just the slide transition time
  })
}

function showPrevImage() {
  if (!canGoBack.value) return

  // Start transition state
  isTransitioning.value = true

  // Update index immediately
  currentImageIndex.value--
  imageLoaded.value = false

  // Update the transform to slide to the new position
  if (slideWidth.value) {
    // For desktop OS, make the transition instant
    if (!isMobileOS.value) {
      isDragging.value = true
      currentTranslate.value = -currentImageIndex.value * slideWidth.value
      setTimeout(() => { isDragging.value = false }, 50)
    } else {
      // For mobile OS, use smooth transition
      currentTranslate.value = -currentImageIndex.value * slideWidth.value
    }
  } else {
    // Initialize it if needed
    const modalContent = document.querySelector('.modal-content')
    if (modalContent) {
      slideWidth.value = modalContent.offsetWidth
      currentTranslate.value = -currentImageIndex.value * slideWidth.value
    }
  }

  // When using the buttons, we need to ensure proper state updates
  nextTick(() => {
    // Update the caption if needed
    if (carouselImages.value[currentImageIndex.value].caption) {
      caption.value = carouselImages.value[currentImageIndex.value].caption
    }

    // Keep transition state only during the slide animation
    setTimeout(() => {
      isTransitioning.value = false
    }, 300) // Just the slide transition time
  })
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
    if (canGoForward.value) {
      showNextImage()
    }
  } else if (e.key === 'ArrowLeft' && hasCarouselImages.value) {
    if (canGoBack.value) {
      showPrevImage()
    }
  }
}

// Add carousel swiping functionality
const {
  transformStyle,
  isDragging,
  slideWidth,
  currentTranslate,
  handleTouchStart: handleCarouselTouchStart,
  handleTouchMove: handleCarouselTouchMove,
  handleTouchEnd: handleCarouselTouchEnd,
  initSlideWidth,
  setupResizeListener,
  isMobileOS
} = useCarouselSwipe(currentImageIndex, carouselImages)

// Clean up function for resize listener
let cleanupResizeListener = null

// Initialize modal element listener
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

// Clean up event listeners on unmount
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (cleanupResizeListener) {
    cleanupResizeListener()
  }
})

// Setup carousel width and resize listener after images are loaded
function setupCarouselDimensions() {
  nextTick(() => {
    if (isOpen.value && hasCarouselImages.value) {
      // Initialize slide width based on modal content
      const modalContent = document.querySelector('.modal-content')
      if (modalContent) {
        slideWidth.value = modalContent.offsetWidth

        // Set initial translation based on current index
        // This should happen instantly, regardless of mobile or desktop OS
        currentTranslate.value = -currentImageIndex.value * slideWidth.value
      }

      // Setup resize listener if not already done
      if (!cleanupResizeListener) {
        cleanupResizeListener = setupResizeListener('.modal-content')
      }
    }
  })
}

// Touch event handler wrappers
function handleTouchStart(event) {
  if (!hasCarouselImages.value) return
  handleCarouselTouchStart(event)
}

function handleTouchMove(event) {
  if (!hasCarouselImages.value) return
  handleCarouselTouchMove(event)
}

function handleTouchEnd(event) {
  if (!hasCarouselImages.value) return

  // Determine if current index will change by looking at isDragging
  // and touchMoved states before they get reset
  const wasDragging = isDragging.value

  // Run the standard touch end handler
  handleCarouselTouchEnd()

  // If we were dragging, start the transition effect
  if (wasDragging) {
    isTransitioning.value = true

    // Reset the transition state after the slide animation completes
    setTimeout(() => {
      isTransitioning.value = false
    }, 300) // Just the slide transition time
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
.image-modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  cursor: pointer;
}

/* Full bleed background that extends into all keepout areas */
.image-modal-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.97);
  width: 100vw; /* Full viewport width */
  height: 100vh; /* Full viewport height */
  height: 100dvh; /* Dynamic viewport height for modern browsers */
  /* Extend beyond safe areas */
  margin: 0;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}

/* Main modal content that respects safe areas */
.image-modal {
  position: absolute;
  /* Default values for non-iOS browsers */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 1001;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
}

/* iOS devices will have these values overridden by the @supports rule below */

.modal-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.images-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  will-change: transform;
  z-index: 10; /* Lower than navigation controls */
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0 40px;
}

/* Container for vertical centering */
.slide-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Wrapper for the image only */
.image-center-wrapper {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Ensure no vertical overflow constraints */
  min-height: 0;
}

.image-box {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Remove any implicit padding or margins */
  padding: 0;
  margin: 0;
}

.modal-image {
  max-width: min(calc(100% - 80px), 95vw); /* Space for arrows on sides */
  max-height: 70vh;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* Caption container positioned below the image */
.caption-container {
  position: absolute;
  bottom: 60px; /* Space above the counter in portrait mode */
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none; /* Let clicks pass through to modal */
  /* No transform effects to keep it static during slide animations */
  will-change: opacity;
  /* The transition is now defined separately for showing vs hiding */
}

/* Hide caption during swiping - instant hide, slow reveal */
.hide-caption {
  opacity: 0;
  transition: none; /* Override the fade-in transition for instant hiding */
}

/* Only apply the slow transition when coming back from hidden state */
.caption-container:not(.hide-caption) {
  transition: opacity 0.5s ease;
  transition-delay: 0.2s; /* Small delay after movement stops */
}

/* Caption styling - for portrait mode initially */
.modal-caption {
  width: 100%;
  max-width: min(calc(100% - 80px), 70vh); /* Restriction for portrait orientation */
  text-align: left;
  color: white;
  font-size: var(--font-size-sm);
  opacity: 0.7; /* Darker caption text */
  margin: 0;
  padding: 0;
  pointer-events: auto; /* Make caption text selectable */
}

.preload-image {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 4px; /* Match the default right positioning of .next-button */
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
  z-index: 1050; /* Higher than everything else */
  position: absolute; /* Position in modal */
}

.prev-button {
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
}

.next-button {
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
}

.prev-button:hover {
  transform: translateY(-50%) scale(1.1);
}

.next-button:hover {
  transform: translateY(-50%) scale(1.1);
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

.nav-icon-flipped {
  transform: scaleX(-1); /* Mirror the icon horizontally */
}

/* ----------------- BASE STYLES (MOBILE FIRST) ----------------- */
/* Default counter position (centered, for narrow/portrait views) */
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
  line-height: 1.2; /* Ensure consistent height */
}

/* Navigation button sizing - base size for small devices */
.nav-button {
  width: 40px;
  height: 40px;
}

.prev-button {
  left: 4px;
}

.next-button {
  right: 4px;
}

.nav-icon {
  width: 28px;
  height: 28px;
}

/* iOS safe area specific adjustments */
@supports (padding: env(safe-area-inset-left)) {
  .image-modal {
    /* Override defaults with safe area insets for iOS */
    top: env(safe-area-inset-top);
    left: env(safe-area-inset-left);
    right: env(safe-area-inset-right);
    bottom: env(safe-area-inset-bottom);
    width: calc(100% - env(safe-area-inset-left) - env(safe-area-inset-right));
    height: calc(100% - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  }

  /* Adjust button positions for iOS safe areas */
  .close-button {
    top: max(20px, env(safe-area-inset-top) + 10px);
    /* Important: Use the exact same calculation for right padding on close and next buttons */
    right: max(4px, env(safe-area-inset-right));
  }

  .prev-button {
    left: max(4px, env(safe-area-inset-left));
  }

  .next-button {
    /* Match this exactly with the close button's right value for alignment */
    right: max(4px, env(safe-area-inset-right));
  }
}

/* ----------------- MEDIUM SCREENS (SMALL TABLETS, PHONES IN LANDSCAPE) ----------------- */
@media (min-width: 601px) {
  /* Larger buttons for medium screens */
  .nav-button {
    width: 45px;
    height: 45px;
  }

  .prev-button {
    left: 10px;
  }

  .next-button {
    right: 10px;
  }

  /* Ensure close button aligns with next button on non-iOS */
  .close-button {
    right: 10px;
  }

  .nav-icon {
    width: 32px;
    height: 32px;
  }

  /* Landscape-style layout on medium width screens */
  .modal-image {
    max-height: 75vh; /* Use almost all available vertical space */
    max-width: 95vw /* More width for portrait images */
  }

  .carousel-slide {
    padding: 0 10px; /* Less padding for more space */
  }

  /* Position caption in lower left */
  .caption-container {
    bottom: 15px;
    left: 15px;
    justify-content: flex-start; /* Left align */
    width: 75%; /* Wider caption now that counter is moved to the right */
  }

  /* Remove max-width restriction for landscape mode */
  .modal-caption {
    max-width: 100%; /* Allow caption to use full width in landscape */
  }

  /* Adjust vertical centering */
  .image-center-wrapper {
    padding-bottom: 0;
  }

  /* Position counter in lower right at same height as caption */
  .image-counter {
    bottom: 15px;
    left: initial !important;
    right: 15px !important;
    transform: none !important;
  }
}

/* ----------------- LARGE SCREENS (DESKTOP, TABLETS) ----------------- */
@media (min-width: 1024px) {
  /* Larger navigation buttons for desktop */
  .nav-button {
    width: 50px;
    height: 50px;
  }

  .prev-button {
    left: 15px;
  }

  .next-button {
    right: 15px;
  }

  /* Maintain alignment between close and next buttons */
  .close-button {
    right: 15px;
  }

  .nav-icon {
    width: 36px;
    height: 36px;
  }

  /* Larger images for wide screens with safe margins */
  .modal-image {
    max-height: 90vh; /* Taller images for desktop */
    max-width: min(calc(100% - 120px), 95vw); /* Allow more width while keeping space for arrows */
  }

  /* More spacious layout */
  .carousel-slide {
    padding: 0 30px;
  }

  /* Wider caption area for desktop */
  .caption-container {
    width: 70%; /* Much wider caption for desktop */
  }

  .modal-caption {
    max-width: 100%; /* Full width within container */
  }
}
</style>
