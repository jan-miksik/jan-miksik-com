// https://nuxt.com/docs/api/configuration/nuxt-config

const title = 'Jan Mikšík'
const description = 'Various profiles of Jan Mikšík'
const url = 'https://janmiksik.com/'
const twitter = '@MiksikJan'
const mainImage = 'https://janmiksik.com/soc-share.png'

const structuredData = {
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
}

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

        // Open Graph (Facebook) - use 'property' not 'name' for OG tags
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:site_name', content: title },
        { property: 'og:url', content: url },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:image', content: mainImage },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/png' },

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
          innerHTML: JSON.stringify(structuredData),
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
