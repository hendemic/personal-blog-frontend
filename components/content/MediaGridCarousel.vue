<template>
  <div class="carousel-container">
    <div
      class="carousel-main"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- This wrapper will slide horizontally based on touch/swipe -->
      <div v-if="images.length > 0" class="images-wrapper" :style="transformStyle">
        <!-- Create a slide for each image in the carousel -->
        <div
          v-for="(image, idx) in images"
          :key="idx"
          class="carousel-slide"
        >
          <NuxtImg
            :src="image.image.url"
            :alt="image.image.alternativeText || image.caption || ''"
            preset="carousel"
            :loading="idx === activeIndex ? 'lazy' : 'lazy'"
            :preload="idx >= activeIndex - 1 && idx <= activeIndex + 1"
            class="carousel-image"
            @click="openModal(image.image, image.caption)"
          />
        </div>
      </div>

      <!-- Hidden preload element for modal display -->
      <!-- <div class="preload-container">
        <NuxtImg
          v-if="images[activeIndex]?.image?.url"
          :src="images[activeIndex].image.url"
          preset="modal"
          class="preload-image"
          preload
        />
      </div> -->
    </div>

    <div class="thumbnails-container" :class="sizeClass">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="thumbnail"
        :class="{ 'active': index === activeIndex }"
        @click="setActiveImage(index)"
      >
        <!-- Thumbnail image -->
        <NuxtImg
          :src="image.image.url"
          :alt="image.caption || ''"
          preset="thumbnail"
          loading="eager"
          class="thumbnail-image"
        />
      </div>
    </div>

    <ImageModal ref="imageModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import ImageModal from '~/components/ImageModal.vue'
import { useCarouselSwipe } from '~/composables/useCarouselSwipe'
const img = useImage()

const props = defineProps({
  block: {
    type: Object,
    required: true
  }
})

const activeIndex = ref(0)
const imageModal = ref(null)

// Get images from props
const images = computed(() => {
  const imagesList = props.block.images || []

  // Debug ALL image formats in console
  if (typeof window !== 'undefined' && window.debugImageFormats && imagesList.length > 0) {
    console.log('DEBUG: All image formats and URLS:')
    imagesList.forEach((img, idx) => {
      console.log(`Image ${idx}:`, {
        url: img.image.url,
        formats: img.image.formats,
        alternativeText: img.image.alternativeText,
        caption: img.caption
      })
    })
  }

  return imagesList
})

// No size classes needed anymore as flex layout will auto-adjust
const sizeClass = computed(() => '')

// Compute previous image URL for preloading (if available)
const prevImageUrl = computed(() => {
  if (!images.value || images.value.length <= 1 || activeIndex.value <= 0) return null
  return images.value[activeIndex.value - 1].image.url
})

// Compute next image URL for preloading (if available)
const nextImageUrl = computed(() => {
  if (!images.value || images.value.length <= 1 || activeIndex.value >= images.value.length - 1) return null
  return images.value[activeIndex.value + 1].image.url
})

// Using our reusable carousel swipe composable
const {
  transformStyle,
  isDragging,
  slideWidth,
  goToSlide,
  initSlideWidth,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  setupResizeListener,
  isMobileOS
} = useCarouselSwipe(activeIndex, images)

// Clean up function for event listeners
let cleanupResizeListener = null

// Initialize slideWidth and set up resize listener when component mounts
onMounted(() => {
  initSlideWidth('.carousel-main')

  // Set up resize listener and store cleanup function
  cleanupResizeListener = setupResizeListener('.carousel-main')
})

// Clean up event listeners when component is unmounted
onUnmounted(() => {
  if (cleanupResizeListener) {
    cleanupResizeListener()
  }
})

function setActiveImage(index) {
  // Both mobile and desktop use the same goToSlide function now
  // as the transition behavior is handled inside it
  goToSlide(index)

  // Ensure the width is properly set in case it wasn't already
  if (slideWidth.value === 0) {
    const carousel = document.querySelector('.carousel-main')
    if (carousel) {
      slideWidth.value = carousel.offsetWidth
    }
  }
}

function openModal(imageData, captionText) {
  if (imageModal.value) {
    // For carousel images, use the openCarousel function with all images
    imageModal.value.openCarousel(images.value, activeIndex.value)
  }
}
</script>

<style scoped>
.carousel-container {
  width: 100%;
  margin: var(--spacing-xl) 0;
}

.carousel-main {
  position: relative;
  width: 100%;
  /* Default 3:2 aspect ratio for desktop */
  aspect-ratio: 3/2;
  margin-bottom: var(--spacing-md);
  overflow: hidden;
  /* Fallback for browsers that don't support aspect-ratio */
  height: 0;
  padding-bottom: 66.67%; /* 3:2 aspect ratio as padding-bottom percentage */
}

.images-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  will-change: transform; /* Hint to browser for GPU acceleration */
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
  transition: opacity 0.2s;

  /* Prevent alt text from showing while placeholder is visible */
  color: transparent !important;
}

.carousel-image:hover {
  opacity: 0.9;
}

.preload-container {
  position: absolute;
  overflow: hidden;
  height: 0;
  width: 0;
  opacity: 0;
}

.preload-image {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}


.caption {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
  font-style: italic;
}

.thumbnails-container {
  display: flex;
  flex-wrap: nowrap;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding-bottom: var(--spacing-sm);
  scrollbar-width: thin;
  width: 100%;
}

.thumbnail {
  flex: 1;
  cursor: pointer;
  /* Square thumbnails */
  aspect-ratio: 1/1;
  transition: all 0.2s ease;
  min-width: 0; /* Allow flex items to shrink below content size */
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.2s ease;

  /* Prevent alt text from showing while placeholder is visible */
  color: transparent !important;
}

.thumbnail:not(.active) {
  opacity: 0.5;
}

.thumbnail.active {
  opacity: 1;
}

/* Hide scrollbar but keep functionality */
.thumbnails-container::-webkit-scrollbar {
  height: 4px;
}

.thumbnails-container::-webkit-scrollbar-track {
  background: var(--color-background-secondary);
}

.thumbnails-container::-webkit-scrollbar-thumb {
  background: var(--color-text-secondary);
  border-radius: 2px;
}

@media (max-width: 768px) {
  .carousel-main {
    /* Force 4:5 vertical aspect ratio on mobile (taller than wide) */
    aspect-ratio: 4/5;
    /* Override the 3:2 padding with 4:5 vertical ratio for browsers without aspect-ratio */
    padding-bottom: 125%; /* 4:5 ratio as padding (5/4 = 1.25 = 125%) */
  }
}
</style>
