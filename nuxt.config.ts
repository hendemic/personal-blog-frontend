// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      meta: [
        { name: 'viewport-fit', content: 'cover' }
      ]
    }
  },
  
  css: [
    '~/assets/css/theme.css',
    '~/assets/css/typography.css',
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
  },
  
  // Register client-side plugins
  plugins: [
    '~/plugins/theme.client.js'
  ],
  
  // Add image module
  modules: [
    '@nuxt/image'
  ],
  
  // Configure image module
  image: {
    // Configure Strapi provider
    provider: 'strapi',
    strapi: {
      baseURL: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:1337'
    },
    
    // Configure quality
    quality: 85,
    
    // Define image sizes
    screens: {
      thumbnail: 300,
      xsm: 500,
      sm: 800,
      md: 1200,
      lg: 1600,
      xl: 2000,
      xxl: 2500
    },
    
    // Format preference (WebP with JPEG fallback)
    format: ['webp', 'jpg', 'jpeg', 'png'],
    
    // Add support for Digital Ocean Spaces CDN
    domains: [
      process.env.DO_SPACE_BASE_URL
    ],
    
    // Improved loading experience
    presets: {
      blog: {
        modifiers: {
          format: 'webp',
          quality: 90,
          blur: 10
        }
      },
      thumbnail: {
        modifiers: {
          format: 'webp',
          quality: 85,
          width: 400,
          height: 400
        }
      }
    }
  }
})
