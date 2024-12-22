<template>
  <div>
    <h1 class="title">Name of all persons here is<br>
      Jan Mikšík</h1>
    <ClientOnly>
      <!-- Single canvas for all profiles -->
      <canvas ref="mainCanvas" class="fullscreen-canvas"></canvas>
      
      <!-- Profile sections with proper positioning -->
      <div class="profiles-container">
        <div 
          v-for="(profile, index) in randomizedProfiles" 
          :key="profile.profileFoto"
          class="profile-section"
        >
          <!-- Hidden image for particle effect -->
          <img 
            :ref="el => imageRefs[index] = el as HTMLImageElement"
            :src="profilesData[2].profileFoto"
            :alt="`Profile Photo ${index + 1}`"
            class="hidden-image"
          />
          
          <!-- Image placeholder to maintain layout -->
          <div class="image-placeholder"></div>
          
          <div class="profile-content">
            <p class="description" v-if="profile.description">
              <span class="description-text">{{ profile.description }}</span>
            </p>
            <div class="social-links">
              <span v-if="profile.social.linkedIn">
                <a :href="profile.social.linkedIn" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </span>
              <span v-if="profile.social.facebook">
                <a :href="profile.social.facebook" target="_blank" rel="noopener noreferrer">Facebook</a>
              </span>
              <span v-if="profile.social.github">
                <a :href="profile.social.github" target="_blank" rel="noopener noreferrer">Github</a>
              </span>
              <span v-if="profile.moreInfo">
                <a :href="profile.moreInfo" target="_blank" rel="noopener noreferrer">
                  {{ profile.moreInfoText }}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  </div> 
  <NuxtPage />
</template>

<script setup lang="ts">
import { profilesData } from '~/data'
import { ref, onMounted, nextTick } from 'vue'
import { useParticleEffect } from '~/composables/useParticleEffect'

const randomizedProfiles = ref<typeof profilesData>([...profilesData])
const mainCanvas = ref<HTMLCanvasElement | null>(null)
const imageRefs = ref<(HTMLImageElement | null)[]>([])

onMounted(() => {
  randomizedProfiles.value = [...profilesData].sort(() => Math.random() - 0.5)

  nextTick(() => {
    if (!mainCanvas.value) return
    
    const addImage = useParticleEffect(mainCanvas.value)
    if (!addImage) return
    
    // Calculate positions based on image placeholders
    imageRefs.value
      .filter((img): img is HTMLImageElement => img !== null)
      .forEach((image, index) => {
        const placeholder = document.querySelectorAll('.image-placeholder')[index]
        if (placeholder) {
          const rect = placeholder.getBoundingClientRect()
          addImage(image, rect.left, rect.top)
        }
      })
  })
})
</script>

<style scoped>
.profiles-container {
  position: relative
}

.profile-section {
  /* margin-bottom: 5rem;
  display: flex; */
  gap: 2rem;
}

.image-placeholder {
  width: 150px;
  height: 150px;
  flex-shrink: 0;
}

.profile-content {
  flex-grow: 1;
}

.description {
  margin: 0.5rem 0 0.1rem;
  max-width: 30rem;
  color: #333;
}

.description-text {
  display: inline-block;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: normal;
  hyphens: auto;
  line-height: 1.5;
}

.title {
  margin-bottom: 5rem;
  font-size: 2rem;
  color: #222;
  padding: 0 20px;
}

.social-links a {
  color: #0066cc;
  text-decoration: underline;
  margin-right: 1rem;
  padding: 0.5rem 0;
  display: inline-block;
}

.social-links a:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

.fullscreen-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.hidden-image {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>