// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'http://localhost:1337',
      graphqlUrl: process.env.GRAPHQL_URL || 'http://localhost:1337/graphql'
    }
  }
})
