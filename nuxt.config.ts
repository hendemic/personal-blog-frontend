// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      meta: [
        { name: 'viewport-fit', content: 'cover' },
        { name: 'text-size-adjust', content: '100%' }
      ]
    }
  },

  css: [
    '~/assets/css/theme.css',
    '~/assets/css/typography.css',
    '~/assets/css/layout.scss'
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
    '~/plugins/theme.client.js',
    '~/plugins/image-debug.client.js'
  ],

  // Add image module
  modules: [
    '@nuxt/image'
  ],

  // No global SCSS imports - using explicit imports for simplicity

  // Configure image module
  image: {
    // Use the ipx provider (supports remote URLs)
    provider: 'ipx',

    // Configure quality
    quality: 100,

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
      'nyc3.digitaloceanspaces.com',
      'mrh-strapi-blog.nyc3.cdn.digitaloceanspaces.com'
    ],

    // Improved loading experience with simpler presets
    presets: {
      modal: {
        modifiers: {
          format: 'jpeg',
          quality: 80,
          width: 1800
        }
      },
      carousel: {
        modifiers: {
          format: 'jpeg',
          quality: 70,
          width: 1200
        }
      },
      thumbnail: {
        modifiers: {
          format: 'webp',
          quality: 40,
          width: 150,
          height: 150
        }
      },
      blog: {
        modifiers: {
          format: 'jpeg',
          quality: 80,
          width: 1200
        }
      }
    },

    // Configure placeholders for progressive loading
    placeholder: false

  }
})
