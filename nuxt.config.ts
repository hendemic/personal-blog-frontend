// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  css: [
    '~/assets/css/theme.css',
    '~/assets/css/layout.css'
  ],
  
  runtimeConfig: {
    // Private config (server-side only)
    apiUrl: process.env.NUXT_PRIVATE_API_URL || 'http://backend:1337',
    graphqlUrl: process.env.NUXT_PRIVATE_GRAPHQL_URL || 'http://backend:1337/graphql',
    
    // Public config (exposed to client)
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:1337',
      graphqlUrl: process.env.NUXT_PUBLIC_GRAPHQL_URL || 'http://localhost:1337/graphql'
    }
  }
})
