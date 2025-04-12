<template>
  <div class="text-block" v-html="formattedText"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  block: {
    type: Object,
    required: true
  }
})

// Process the text to convert line breaks to paragraphs and handle lists
const formattedText = computed(() => {
  if (!props.block.text) return ''
  
  // Check if the content already has HTML tags
  if (props.block.text.includes('<p>') || props.block.text.includes('<div>')) {
    // Content already has HTML structure, return as is
    return props.block.text
  }
  
  let content = props.block.text
  let result = ''
  
  // Split the content by double line breaks to identify paragraphs
  const sections = content.split(/\n\s*\n/).filter(s => s.trim() !== '')
  
  // Process each section (paragraph or potential list)
  sections.forEach(section => {
    // Check if this section looks like a list (several lines starting with - or *)
    const lines = section.split('\n')
    const bulletPattern = /^\s*[-*]\s+(.+)$/
    const isListCandidate = lines.length > 1 && lines.filter(line => bulletPattern.test(line)).length > 1
    
    if (isListCandidate) {
      // Count how many lines match bullet pattern
      const bulletLines = lines.filter(line => bulletPattern.test(line))
      
      // If most lines have bullets, treat as a list
      if (bulletLines.length > lines.length * 0.5) {
        // Create an unordered list
        const listItems = lines
          .map(line => {
            const match = line.match(bulletPattern)
            if (match) {
              return `<li>${match[1]}</li>`
            }
            // Non-bullet lines within a list section get wrapped in a list item too
            return line.trim() ? `<li>${line}</li>` : ''
          })
          .filter(item => item) // Remove empty items
          .join('')
        
        result += `<ul>${listItems}</ul>`
      } else {
        // Not enough bullet points, treat as regular paragraph
        result += `<p>${section.replace(/\n/g, '<br>')}</p>`
      }
    } else {
      // Regular paragraph
      result += `<p>${section.replace(/\n/g, '<br>')}</p>`
    }
  })
  
  return result
})
</script>

<style scoped>
.text-block {
  margin-bottom: var(--spacing-xl);
  line-height: 1.7;
  font-size: var(--font-size-base);
}

/* Target heading and paragraph spacing within rich text content */
:deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
  margin-top: var(--spacing-xl);
  margin-bottom: 0.1rem !important; /* Force very minimal spacing with !important */
}

:deep(p) {
  margin-top: 0.1rem !important; /* Reduce spacing from the top as well */
  margin-bottom: var(--spacing-md);
}

:deep(a) {
  color: var(--color-primary);
  text-decoration: none;
}

:deep(a:hover) {
  text-decoration: underline;
}

:deep(ul), :deep(ol) {
  padding-left: 1.2rem; /* Minimal indentation for bullets themselves */
  margin-left: 0; /* Remove left margin */
  margin-bottom: var(--spacing-md);
}

:deep(li) {
  margin-bottom: var(--spacing-sm);
}

:deep(blockquote) {
  border-left: 4px solid var(--color-border);
  padding-left: var(--spacing-md);
  font-style: italic;
  margin: var(--spacing-lg) 0;
}

:deep(code) {
  font-family: monospace;
  background-color: var(--color-background);
  padding: 2px 4px;
  border-radius: var(--border-radius-sm);
}
</style>