<template>
  <div class="container">
    <div v-if="loading" class="content">
      <p class="loading">Loading...</p>
    </div>
    <div v-else-if="error" class="content">
      <p class="error">{{ error }}</p>
    </div>
    <div v-else class="content">
      <h1 class="title">{{ landingPage?.Title || 'Welcome' }}</h1>
      <p class="description">{{ landingPage?.Description || 'Coming soon' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'

const landingPage = ref({ Title: 'Welcome', Description: 'Coming soon' })
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    // Use the runtime config which will use the correct URL for server or client
    const config = useRuntimeConfig()
    console.log('Using GraphQL URL:', config.graphqlUrl || config.public.graphqlUrl)
    
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
            landingPage {
              data {
                attributes {
                  Title
                  Description
                }
              }
            }
          }
        `
      })
    })
    
    const result = await response.json()
    
    if (result.data?.landingPage?.data?.attributes) {
      landingPage.value = result.data.landingPage.data.attributes
    }
  } catch (err) {
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

.content {
  text-align: center;
  max-width: 800px;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  letter-spacing: -0.025em;
}

.description {
  font-size: 1.25rem;
  line-height: 1.7;
  max-width: 36rem;
  margin: 0 auto;
  opacity: 0.9;
}

.loading {
  font-size: 1.5rem;
  opacity: 0.7;
}

.error {
  color: #f56565;
  font-size: 1.5rem;
}
</style>