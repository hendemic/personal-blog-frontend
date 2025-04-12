<template>
  <div class="post-list">
    <div v-if="error" class="error-message">Error loading posts: {{ error }}</div>
    <div v-else-if="!loading && posts.length === 0" class="empty-message">No posts found.</div>
    <template v-else-if="!loading">
      <Post 
        v-for="post in posts" 
        :key="post.slug" 
        :post="post" 
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'
import Post from '~/components/Post.vue'

const posts = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    // Use the runtime config which will use the correct URL for server or client
    const config = useRuntimeConfig()
    
    // Get the appropriate URL based on execution context
    const graphqlUrl = import.meta.server 
      ? config.graphqlUrl // Server-side (backend:1337)
      : config.public.graphqlUrl // Client-side (localhost:1337)
    
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query {
            posts(
              filters: { visible: { eq: true } },
              sort: "publishDate:desc"
            ) {
              title
              description
              publishDate
              slug
              visible
            }
          }
        `
      })
    })
    
    const result = await response.json()
    
    if (result.data?.posts) {
      // Filter again client-side to handle any posts without the visible field set
      let filteredPosts = result.data.posts.filter(post => post.visible !== false)
      
      // Sort by publishDate (newest first)
      filteredPosts.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
      
      posts.value = filteredPosts
    }
  } catch (err) {
    console.error('Error fetching posts:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.post-list {
  width: 100%;
}

.error-message,
.empty-message {
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.error-message {
  color: #cc0000;
}
</style>