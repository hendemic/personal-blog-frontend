// Debug plugin to investigate image formats
export default defineNuxtPlugin(() => {
  const debug = (message, data) => {
    console.log(`[Image Debug] ${message}`, data)
  }

  window.checkImgSrc = () => {
    // Find all img tags on the page
    const imgTags = document.querySelectorAll('img')
    debug('Found img tags', imgTags.length)
    
    imgTags.forEach((img, index) => {
      debug(`Image ${index} src`, img.src)
      debug(`Image ${index} dimensions`, `${img.width}x${img.height}`)
      
      // Check if URL contains format identifiers
      const url = img.src
      if (url.includes('thumbnail_')) {
        debug(`Image ${index} format`, 'thumbnail')
      } else if (url.includes('xsmall_')) {
        debug(`Image ${index} format`, 'xsmall')
      } else if (url.includes('small_')) {
        debug(`Image ${index} format`, 'small')
      } else if (url.includes('medium_')) {
        debug(`Image ${index} format`, 'medium')
      } else if (url.includes('large_')) {
        debug(`Image ${index} format`, 'large') 
      } else if (url.includes('xlarge_')) {
        debug(`Image ${index} format`, 'xlarge')
      } else {
        debug(`Image ${index} format`, 'original (no format prefix)')
      }
    })
  }

  window.debugImageFormats = (image) => {
    debug('Image object', image)
    
    if (image && image.formats) {
      const formats = typeof image.formats === 'string' 
        ? JSON.parse(image.formats) 
        : image.formats
      
      debug('Available formats', formats)
      
      if (formats.thumbnail) {
        debug('Thumbnail URL', formats.thumbnail.url)
      }
      
      if (formats.xsmall) {
        debug('XSmall URL', formats.xsmall.url)
      }
      
      if (formats.small) {
        debug('Small URL', formats.small.url)
      }
      
      if (formats.medium) {
        debug('Medium URL', formats.medium.url)
      }
      
      if (formats.large) {
        debug('Large URL', formats.large.url)
      }
      
      if (formats.xlarge) {
        debug('XLarge URL', formats.xlarge.url)
      }
    } else {
      debug('No formats available', null)
    }
    
    debug('Original URL', image ? image.url : null)
  }
})