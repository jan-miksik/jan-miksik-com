// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: process.env.NODE_ENV === 'development'
  },
  srcDir: 'src/',
  ssr: false,
  app: {
    head: {
      title: 'Jan Mikšík',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Various profiles of Jan Mikšík' },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      htmlAttrs: {
        lang: 'en'
      }
    }
  },
  modules: [
    '@nuxt/image',
  ],
})
