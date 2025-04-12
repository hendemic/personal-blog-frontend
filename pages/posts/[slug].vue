<template>
  <div class="container">
    <div class="content">
      <div v-if="loading" class="loading"></div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <article v-else-if="post" class="post">
        <div class="post-header">
          <div class="post-date">{{ formattedDate }}</div>
          <h1 class="post-title">{{ post.title }}</h1>
        </div>
        
        <DynamicContent :blocks="post.content || []" />
        
        <PostNavigation 
          :current-slug="slug" 
          :previous-post="previousPost" 
          :next-post="nextPost" 
        />
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'
import DynamicContent from '~/components/DynamicContent.vue'
import PostNavigation from '~/components/PostNavigation.vue'

const route = useRoute()
const slug = route.params.slug

const post = ref(null)
const loading = ref(true)
const error = ref(null)
const previousPost = ref(null)
const nextPost = ref(null)

// Format date as "Month DD, YYYY"
const formattedDate = computed(() => {
  if (!post.value?.publishDate) return ''
  
  const date = new Date(post.value.publishDate)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
})

onMounted(async () => {
  try {
    const config = useRuntimeConfig()
    const graphqlUrl = import.meta.server 
      ? config.graphqlUrl 
      : config.public.graphqlUrl
    
    // Fetch the current post
    const postQuery = `
      query GetPostBySlug($slug: String!) {
        posts(filters: { slug: { eq: $slug } }) {
          title
          description
          publishDate
          content {
            __typename
            ... on ComponentContentBlockHeadingBlock {
              heading
              level
            }
            ... on ComponentContentBlockTextBlock {
              text
            }
            ... on ComponentContentBlockImageBlock {
              caption
              image {
                url
                width
                height
                alternativeText
              }
            }
          }
        }
      }
    `
    
    const postResponse = await fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: postQuery,
        variables: { slug }
      })
    })
    
    const postResult = await postResponse.json()
    
    if (postResult.errors) {
      throw new Error(postResult.errors[0].message)
    }
    
    if (postResult.data?.posts && postResult.data.posts.length > 0) {
      post.value = postResult.data.posts[0]
      
      // Fetch all posts to determine next/previous
      const allPostsQuery = `
        query GetAllPosts {
          posts(sort: "publishDate:desc") {
            title
            slug
            publishDate
          }
        }
      `
      
      const allPostsResponse = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: allPostsQuery
        })
      })
      
      const allPostsResult = await allPostsResponse.json()
      
      if (allPostsResult.data?.posts && allPostsResult.data.posts.length > 0) {
        const posts = allPostsResult.data.posts
        const currentIndex = posts.findIndex(p => p.slug === slug)
        
        if (currentIndex > 0) {
          nextPost.value = posts[currentIndex - 1]
        }
        
        if (currentIndex < posts.length - 1) {
          previousPost.value = posts[currentIndex + 1]
        }
      }
    } else {
      throw new Error('Post not found')
    }
  } catch (err) {
    console.error('Error fetching post:', err)
    error.value = `Error loading post: ${err.message}`
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.post {
  width: 100%;
}

.post-header {
  margin-bottom: var(--spacing-2xl);
}

.post-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.post-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  margin-top: 0; /* Reset the top margin from global styles */
}

.error {
  color: red;
  padding: var(--spacing-xl);
}

@media (max-width: 768px) {
  .post-title {
    font-size: calc(var(--font-size-3xl) * var(--mobile-scale-ratio));
  }
}
</style>