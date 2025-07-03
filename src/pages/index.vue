<template>
  <div class="janmiksik-com-banner">janmiksik.com</div>
  <div class="main-container">
    <h1 class="title"><span class="title-part-a">Name of all persons here is</span>
      <span class="title-part-b">Jan Mikšík</span></h1>
    <ClientOnly>
      <!-- Canvas only shows on desktop -->
      <!-- <Suspense> -->
      <canvas 
        v-if="!isMobile" 
        ref="mainCanvas" 
        class="fullscreen-canvas"
      ></canvas>
        <!-- <template #fallback>
          <div class="loading">Loading...</div>
        </template> -->
      <!-- </Suspense> -->
      
      <div class="profiles-container">
        <div 
          v-for="(profile, index) in randomizedProfiles" 
          :key="profile.profileFoto"
          class="profile-section"
          :style="`left: ${imagePositions[index]?.x}px; top: ${imagePositions[index]?.y}px`"
        >
          <!-- Show normal image on mobile -->
          <img 
            v-if="isMobile"
            :src="profile.profileFoto"
            :alt="`Profile Photo ${index + 1}`"
            class="profile-image"
          />
          <!-- Hidden image for particle effect on desktop -->
          <img 
            v-else
            :ref="(el: any) => imageRefs[index] = el as HTMLImageElement"
            :src="profile.profileFoto"
            :alt="`Profile Photo ${index + 1}`"
            class="hidden-image"
          />
          
          <!-- Image placeholder only needed for desktop -->
          <div v-if="!isMobile" class="image-placeholder"></div>
          
          <div class="profile-content">
            <p class="description" v-if="profile.description">
              <span class="description-text">{{ profile.description }}</span>
            </p>
            <div class="social-links">
              <span v-if="profile.social.linkedIn" @click.stop="preventOpen">
                <a :href="profile.social.linkedIn" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </span>
              <span v-if="profile.social.facebook" @click.stop="preventOpen">
                <a :href="profile.social.facebook" target="_blank" rel="noopener noreferrer">Facebook</a>
              </span>
              <span v-if="profile.social.github" @click.stop="preventOpen">
                <a :href="profile.social.github" target="_blank" rel="noopener noreferrer">Github</a>
              </span>
              <span v-if="profile.moreInfo" @click.stop="preventOpen">
                <a :href="profile.moreInfo" target="_blank" rel="noopener noreferrer">
                  {{ profile.moreInfoText }}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
    <span @click.stop="preventOpen" class="edit-request">If you are Jan Miksik and want to somehow edit your profile or like to add your profile, you can send request to <a href="mailto:edit@janmiksik.com">edit@janmiksik.com</a></span>
  </div> 
  <NuxtPage />
</template>

<script setup lang="ts">
import { profilesData } from '~/data'
import { useParticleEffect } from '~/composables/useParticleEffect'
import { findValidPosition } from '~/composables/useFindValidPosition'

const randomizedProfiles = ref<typeof profilesData>([...profilesData])
const mainCanvas = ref<HTMLCanvasElement | null>(null)
const imageRefs = ref<(HTMLImageElement | null)[]>([])
const isMobile = ref(false)
const imagePositions = ref<Array<{ x: number; y: number }>>([])
// const isCanvasReady = ref(false)

const preventOpen = (e: Event) => {
  e.preventDefault()
  alert('You are viewing the exhibition version of janmiksik.com. External links are disabled in this version. To access the fully functional site, please visit janmiksik.com on your device.')
}


onMounted(() => {
  // Check if device is mobile
  isMobile.value = window.innerWidth <= 768
  
  // Update isMobile on resize
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768
  })

  if (isMobile.value) return;

  randomizedProfiles.value = [...profilesData].sort(() => Math.random() - 0.5)

  nextTick(async () => {
    const existingPositions: Array<{ x: number, y: number, width: number, height: number }> = [];

    // First, position all text blocks
    randomizedProfiles.value.forEach((profile, index) => {
      const textWidth = 164;
      const textHeight = 150;
      
      const position = findValidPosition(textWidth, textHeight, existingPositions);
      
      existingPositions.push({
        ...position,
        width: textWidth,
        height: textHeight
      });
      imagePositions.value[index] = position;
    });


    if (!mainCanvas.value) return;
    const addImage = useParticleEffect(mainCanvas.value);
    if (!addImage) return;

    // Then, add images to match text positions
    imageRefs.value
      .filter((img): img is HTMLImageElement => img !== null)
      .forEach((image, index) => {
        const textPosition = imagePositions.value[index];

        const imagePosition = {
          x: textPosition.x,
          y: textPosition.y
        };
        addImage(image, imagePosition);
      });
  });
})
</script>

<style scoped>

.main-container {
  font-family: system-ui !important;
  min-height: 2300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.profile-section {
  width: 300px;
  position: absolute;
}

.profile-content {
  position: absolute;
  top: 100%;
  left: 0;
  margin-left: -7px;
  margin-top: -15px;
  z-index: -1;
  width: 167px;
  text-align: justify;
  line-height: 20px;
  font-size: 15px;
  z-index: 1;
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
}

.title {
  color: #222;
  font-size: 2rem;

  margin-bottom: 5rem;
  margin-top: 3.5rem;
  margin-left: 1rem;

  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.title-part-a {
  font-size: 1.5rem;
  opacity: 0.6;
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

.profile-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  margin-bottom: 1rem;
}

.edit-request {
  font-size: 0.8rem;
  opacity: 0.8;
  opacity: 0.65;
  position: relative;
  padding-bottom: 2rem;
  padding-left: 1rem;
}

/* Mobile styles */
@media (max-width: 768px) {
  .profile-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 5rem;
    gap: 0;
    position: relative;
    z-index: 1;
  }

  .profile-content {
    position: static;
    margin-top: 0;
    width: 160px;
    margin-left: -3px;
    text-align: justify;
    line-height: 18px;
    font-size: 15px;
  }

  .description {
    margin: 0 auto;
  }

  .title {
    text-align: center;
    font-size: 1.7rem;
  }

  .social-links a {
    white-space: nowrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

.janmiksik-com-banner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background-color: #3b3b3f;
  color: #fff;
  font-family: system-ui;
  text-align: center;
  align-content: center;
  border-bottom: 1px solid #303034;
  font-size: 1.25rem;
}
</style>