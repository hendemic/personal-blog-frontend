import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

export function useCarouselSwipe(activeIndex, images) {
  const dragStartX = ref(0)
  const currentTranslate = ref(0)
  const isDragging = ref(false)
  const slideWidth = ref(0)
  const touchMoved = ref(false)
  let touchStartTime = 0
  
  // Mobile OS detection (iOS, Android)
  const isMobileOS = ref(false)
  
  // Initialize with SSR-safe detection
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    
    // iOS detection (iPhone, iPad, iPod)
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream
    
    // Android detection
    const isAndroid = /android/i.test(userAgent)
    
    isMobileOS.value = isIOS || isAndroid
  }

  // Computed property for the transform style that will animate the sliding
  const transformStyle = computed(() => {
    return {
      transform: `translateX(${currentTranslate.value}px)`,
      // Only apply animation transition on mobile OS devices
      transition: isDragging.value ? 'none' : (isMobileOS.value ? 'transform 0.25s ease-out' : 'none')
    }
  })

  // Initialize the slide width measurement
  function initSlideWidth(elementSelector) {
    // We need to wait for the DOM to be updated
    nextTick(() => {
      // Make sure the element exists before trying to get its width
      const element = document.querySelector(elementSelector)
      if (element) {
        slideWidth.value = element.offsetWidth
        
        // Set dragging to true momentarily for desktop to avoid transition
        if (!isMobileOS.value) {
          isDragging.value = true
        }
        
        // Initialize the current translate position based on activeIndex
        currentTranslate.value = -activeIndex.value * slideWidth.value
        
        // Reset dragging state after a short delay for desktop
        if (!isMobileOS.value) {
          setTimeout(() => {
            isDragging.value = false
          }, 50)
        }
      }
    })
  }

  // Set the current slide without animation (for initial setup)
  function setInitialPosition() {
    currentTranslate.value = -activeIndex.value * slideWidth.value
  }

  // Go to a specific slide with animation
  function goToSlide(index) {
    if (index >= 0 && index < images.value.length) {
      activeIndex.value = index
      
      // For desktop OS, make the transition instant
      if (!isMobileOS.value) {
        isDragging.value = true
        currentTranslate.value = -index * slideWidth.value
        // Reset dragging state after a short delay
        setTimeout(() => {
          isDragging.value = false
        }, 50)
      } else {
        // For mobile OS, use smooth transition
        isDragging.value = false
        
        // Only calculate slideWidth if it's not already set
        if (slideWidth.value === 0) {
          initSlideWidth('.carousel-main')
        }
  
        currentTranslate.value = -index * slideWidth.value
      }
    }
  }

  // Touch gesture handlers
  // Track both X and Y coordinates to determine swipe direction
  let touchStartY = 0
  let isHorizontalSwipe = false
  let hasDirectionLock = false

  function handleTouchStart(event) {
    // Get the touch starting position (both X and Y)
    dragStartX.value = event.touches[0].clientX
    touchStartY = event.touches[0].clientY
    
    // Reset state variables
    touchMoved.value = false
    touchStartTime = Date.now()
    isDragging.value = true
    isHorizontalSwipe = false
    hasDirectionLock = false
    
    // Always update the slideWidth in case the viewport has been resized
    if (event.currentTarget) {
      slideWidth.value = event.currentTarget.offsetWidth
    }
    
    // Set the initial translate position based on the active index
    // This ensures we're starting from the proper position
    currentTranslate.value = -activeIndex.value * slideWidth.value
  }

  function handleTouchMove(event) {
    if (!isDragging.value) return
    
    // Get current touch position
    const currentX = event.touches[0].clientX
    const currentY = event.touches[0].clientY
    
    // Calculate X and Y movement
    const diffX = currentX - dragStartX.value
    const diffY = currentY - touchStartY
    
    // If we haven't determined the dominant direction yet
    if (!hasDirectionLock) {
      // Determine if this is primarily a horizontal or vertical swipe
      // Using 20 degree angle (tan(20°) ≈ 0.36) to determine swipe direction
      isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY) * 1.5
      
      // Lock in the direction once we have significant movement
      if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
        hasDirectionLock = true
      }
    }
    
    // Only handle horizontal swipes; allow vertical scrolling to pass through
    if (isHorizontalSwipe) {
      // Apply resistance at the boundaries (first and last image)
      if ((activeIndex.value === 0 && diffX > 0) || 
          (activeIndex.value === images.value.length - 1 && diffX < 0)) {
        // Apply 40% of the movement at boundaries (creates resistance feel)
        currentTranslate.value = -activeIndex.value * slideWidth.value + (diffX * 0.4)
      } else {
        // Apply full movement within bounds
        currentTranslate.value = -activeIndex.value * slideWidth.value + diffX
      }
      
      // Mark as moved if there was significant movement
      touchMoved.value = true
      
      // Prevent page scrolling only for horizontal swipes
      event.preventDefault()
    }
  }

  function handleTouchEnd() {
    // Calculate swipe duration
    const touchDuration = Date.now() - touchStartTime
    
    // Only process swipe if it was horizontal
    if (isHorizontalSwipe) {
      // If it's a quick tap without movement, treat it as a click, not a swipe
      if (!touchMoved.value && touchDuration < 300) {
        // Reset position and stop dragging
        currentTranslate.value = -activeIndex.value * slideWidth.value
        isDragging.value = false
        return
      }
      
      // Get the final position relative to the active slide position
      const currentPosition = currentTranslate.value + (activeIndex.value * slideWidth.value)
      
      // Calculate movement as percentage of slide width
      const movePercentage = (Math.abs(currentPosition) / slideWidth.value) * 100
      
      // Determine if we should snap to the next/prev slide or return to current
      // If the user moved more than 20% of the width OR if it was a quick swipe
      const isSignificantSwipe = (movePercentage > 20) || 
                                (Math.abs(currentPosition) > 50 && touchDuration < 300)
                                
      if (isSignificantSwipe && touchMoved.value) {
        if (currentPosition > 0) {
          // Swiped right (previous)
          if (activeIndex.value > 0) {
            activeIndex.value--
          }
        } else if (currentPosition < 0) {
          // Swiped left (next)
          if (activeIndex.value < images.value.length - 1) {
            activeIndex.value++
          }
        }
      }
    }
    
    // Always snap to the current active index position
    currentTranslate.value = -activeIndex.value * slideWidth.value
    isDragging.value = false
  }

  // Function to handle window resize
  function handleResize(elementSelector) {
    const element = document.querySelector(elementSelector)
    if (element) {
      slideWidth.value = element.offsetWidth
      // Update translate position without animation
      isDragging.value = true
      currentTranslate.value = -activeIndex.value * slideWidth.value
      // Reset dragging state after a short delay
      setTimeout(() => {
        isDragging.value = false
      }, 50)
    }
  }
  
  // Function to set up resize listener
  function setupResizeListener(elementSelector) {
    const resizeHandler = () => handleResize(elementSelector)
    window.addEventListener('resize', resizeHandler)
    
    // Return cleanup function
    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }

  return {
    dragStartX,
    currentTranslate,
    isDragging,
    slideWidth,
    touchMoved,
    transformStyle,
    initSlideWidth,
    setInitialPosition,
    goToSlide,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleResize,
    setupResizeListener,
    isMobileOS
  }
}