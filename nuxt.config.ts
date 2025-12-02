// https://nuxt.com/docs/api/configuration/nuxt-config

const title = 'Jan Mikšík'
const description = 'Various profiles of Jan Mikšík'
const url = 'https://janmiksik.com/'
const twitter = '@MiksikJan'
const mainImage = 'https://janmiksik.com/soc-share.png'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: process.env.NODE_ENV === 'development'
  },
  srcDir: 'src/',
  ssr: false,
  nitro: {
    output: {
      dir: 'dist'
    }
  },
  app: {
    head: {
      title,
      meta: [
        // base
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        { name: 'description', content: description },
        { name: 'keywords', content: 'Jan Mikšík, profile, identity, social media, me' },
        { name: 'robots', content: 'index, follow' },
        { name: 'language', content: 'English' },
        { name: 'author', content: 'Jan Mikšík' },
        { name: 'generator', content: 'Nuxt.js' },

        // Open Graph (Facebook)
        { name: 'og:type', content: 'website' },
        { name: 'og:title', content: title },
        { name: 'og:description', content: description },
        { name: 'og:site_name', content: title },
        { name: 'og:url', content: url },
        { name: 'og:locale', content: 'en_US' },
        { name: 'og:image', content: mainImage },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:site', content: twitter },
        { name: 'twitter:creator', content: twitter },
        { name: 'twitter:image', content: mainImage },
      ],
      htmlAttrs: {
        lang: 'en'
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: url },
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: title,
            description: description,
            url: url,
            author: {
              '@type': 'Person',
              name: 'Jan Mikšík',
            },
            publisher: {
              '@type': 'Person',
              name: 'Jan Mikšík',
            },
            image: mainImage,
            inLanguage: 'en',
          }),
        },
      ],
    }
  },
  modules: [
    '@nuxt/image',
    '@vueuse/nuxt',
    '@nuxtjs/seo',
  ],
})
