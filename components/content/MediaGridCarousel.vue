<template>
  <div class="carousel-container">
    <!-- Use CSS-only approach by removing Vue class binding -->
    <div 
      class="carousel-main"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div v-if="images.length > 0" class="active-image-container">
        <!-- Use NuxtImg with array syntax for placeholder -->
        <NuxtImg 
          :src="images[activeIndex].image.url"
          :alt="images[activeIndex].image.alternativeText || images[activeIndex].caption || ''"
          preset="carousel"
          loading="eager"
          preload
          :placeholder="[100, 60, 30, 15]"
          :key="activeIndex"
          class="active-image"
          @click="openModal(images[activeIndex].image, images[activeIndex].caption)"
        />

        <!-- Also preload previous and next images for instant switching -->
        <NuxtImg 
          v-if="prevImageUrl"
          :src="prevImageUrl"
          preset="carousel"
          width="1"
          height="1"
          class="preload-image"
          preload
        />
        <NuxtImg 
          v-if="nextImageUrl"
          :src="nextImageUrl"
          preset="carousel"
          width="1"
          height="1" 
          class="preload-image"
          preload
        />
      </div>
    </div>
    
    <div class="thumbnails-container" :class="sizeClass">
      <div 
        v-for="(image, index) in images" 
        :key="index"
        class="thumbnail" 
        :class="{ 'active': index === activeIndex }"
        @click="setActiveImage(index)"
      >
        <!-- Use NuxtImg for thumbnails with array placeholder -->
        <NuxtImg 
          :src="image.image.url"
          :alt="image.caption || ''"
          preset="thumbnail"
          loading="lazy"
          :placeholder="[50, 50, 40, 8]"
          class="thumbnail-image"
        />
      </div>
    </div>
    
    <ImageModal ref="imageModal" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import ImageModal from '~/components/ImageModal.vue'
const img = useImage()

const props = defineProps({
  block: {
    type: Object,
    required: true
  }
})

const activeIndex = ref(0)
const imageModal = ref(null)

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

// We no longer need manual preloading as we're using the NuxtImg preload prop
// The computed properties below will identify which images to preload

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

function setActiveImage(index) {
  activeIndex.value = index
}

function openModal(imageData, captionText) {
  if (imageModal.value) {
    // For carousel images, use the openCarousel function with all images
    imageModal.value.openCarousel(images.value, activeIndex.value)
  }
}

// Touch gesture handling
let touchStartX = 0
let touchEndX = 0
let touchMoved = false
let touchStartTime = 0

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX
  touchEndX = touchStartX // Initialize end position
  touchMoved = false // Reset movement flag
  touchStartTime = Date.now() // Record start time
}

function handleTouchMove(event) {
  touchEndX = event.touches[0].clientX
  
  // Mark as moved if there was significant movement
  if (Math.abs(touchEndX - touchStartX) > 10) {
    touchMoved = true
  }
}

function handleTouchEnd() {
  // Calculate time of touch
  const touchDuration = Date.now() - touchStartTime
  
  // If it's a quick tap without movement, ignore it
  if (!touchMoved && touchDuration < 300) {
    return
  }
  
  // Determine swipe direction (left or right)
  const swipeThreshold = 100 // Minimum distance for a swipe to be registered
  const swipeDistance = touchEndX - touchStartX
  
  // Calculate swipe as a percentage of screen width
  const screenWidth = window.innerWidth
  const swipePercentage = (Math.abs(swipeDistance) / screenWidth) * 100
  
  // Require either 100px absolute distance OR 15% of screen width
  if (Math.abs(swipeDistance) < swipeThreshold && swipePercentage < 15) {
    // Not a significant swipe - ignore
    return
  }
  
  // Ensure there was actual movement and not just a small value
  if (touchEndX === touchStartX || !touchMoved) {
    return
  }
  
  if (swipeDistance > 0) {
    // Swiped right - go to previous image
    if (activeIndex.value > 0) {
      activeIndex.value--
    }
  } else {
    // Swiped left - go to next image
    if (activeIndex.value < images.value.length - 1) {
      activeIndex.value++
    }
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

.active-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.active-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
  transition: opacity 0.2s;
  
  /* Prevent alt text from showing while placeholder is visible */
  color: transparent !important;
}

.active-image:hover {
  opacity: 0.9;
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