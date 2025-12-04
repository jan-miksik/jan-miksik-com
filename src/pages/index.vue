<template>
  <div class="main-container">
    <h1 class="title"><span class="title-part-a">Name of all persons here is</span>
      <span class="title-part-b">Jan Mikšík</span>
    </h1>
      <ClientOnly>
        <!-- Canvas only shows on desktop -->
        <canvas 
          v-if="!isMobile" 
          ref="mainCanvas" 
          class="fullscreen-canvas"
        ></canvas>
        
        <div class="profiles-container">
        <div 
          v-for="(profile, index) in randomizedProfiles" 
          :key="profile.profileFoto"
          class="profile-section"
          :style="{
            left: `${imagePositions[index]?.x}px`,
            top: `${imagePositions[index]?.y}px`
          }"
        >
          <!-- Show normal image on mobile -->
          <img 
            v-if="isMobile"
            :src="profile.profileFoto"
            v-bind="getImageAttributes(profile)"
            class="profile-image"
            loading="lazy"
            @load="handleImageLoad"
            @error="handleImageError"
          />
          <!-- Hidden image for particle effect on desktop -->
          <img 
            v-else
            :ref="(el) => setImageRef(el, index)"
            :src="profile.profileFoto"
            v-bind="getImageAttributes(profile)"
            class="hidden-image"
            @load="handleImageLoad"
            @error="handleImageError"
          />
          
          <!-- Image placeholder only needed for desktop -->
          <div v-if="!isMobile" class="image-placeholder"></div>
          
          <div class="profile-content">
            <p class="description" v-if="profile.description">
              <span class="description-text">{{ profile.description }}</span>
            </p>
            <nav class="social-links" aria-label="Social media links">
              <span v-if="profile.social.linkedIn">
                <a 
                  :href="profile.social.linkedIn" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile"
                >LinkedIn</a>
              </span>
              <span v-if="profile.social.facebook">
                <a 
                  :href="profile.social.facebook" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Facebook profile"
                >Facebook</a>
              </span>
              <span v-if="profile.social.github">
                <a 
                  :href="profile.social.github" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                >Github</a>
              </span>
              <span v-if="profile.moreInfo">
                <a 
                  :href="profile.moreInfo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  :aria-label="profile.moreInfoText || 'More info'"
                >
                  {{ profile.moreInfoText }}
                </a>
              </span>
            </nav>
          </div>
        </div>
      </div>
      </ClientOnly>
    <p class="edit-request" aria-label="Contact information for profile edits">
      If you are Jan Miksik and want to somehow edit your profile or like to add your profile, you can send request to 
      <a href="mailto:edit@janmiksik.com" aria-label="Send email to edit@janmiksik.com">edit@janmiksik.com</a>
    </p>
  </div> 
  <NuxtPage />
</template>

<script setup lang="ts">
import { profilesData } from '~/data'
import { useParticleEffect } from '~/composables/useParticleEffect'
import { findValidPosition } from '~/composables/useFindValidPosition'
import { LAYOUT, CANVAS } from '~/constants'
import { logError } from '~/lib/errorHandler'

const randomizedProfiles = ref<typeof profilesData>([...profilesData])
const mainCanvas = ref<HTMLCanvasElement | null>(null)
const imageRefs = ref<(HTMLImageElement | null)[]>([])
const isMobile = ref(false)
const imagePositions = ref<Array<{ x: number; y: number }>>([])

const setImageRef = (el: Element | ComponentPublicInstance | null, index: number): void => {
  if (el && el instanceof HTMLImageElement) {
    imageRefs.value[index] = el
  }
}

const minHeight = `${LAYOUT.PAGE_MIN_HEIGHT}px`
const mobileBreakpoint = `${LAYOUT.MOBILE_BREAKPOINT}px`
const profileImageWidth = `${CANVAS.PROFILE_IMAGE_WIDTH}px`
const profileImageHeight = `${CANVAS.PROFILE_IMAGE_HEIGHT}px`
const canvasZIndex = CANVAS.CANVAS_Z_INDEX

// Store cleanup function for particle effect
let particleEffectCleanup: (() => void) | null = null

// Handle resize for mobile detection
const handleResize = () => {
  isMobile.value = window.innerWidth <= LAYOUT.MOBILE_BREAKPOINT
}

// Helper function to get common image attributes (alt)
const getImageAttributes = (profile: typeof profilesData[0]) => ({
  alt: `Profile photo of Jan Mikšík${profile.description ? ` - ${profile.description}` : ''}`,
})

// Handle image load
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) {
    img.classList.add('loaded')
  }
}

// Handle image error
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) {
    logError('Image', new Error('Failed to load image'), img.src)
    img.classList.add('error')
  }
}

// Fisher-Yates shuffle algorithm for true random distribution
const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
};

onMounted(() => {
  // Check if device is mobile
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth <= LAYOUT.MOBILE_BREAKPOINT
    
    // Update isMobile on resize
    window.addEventListener('resize', handleResize)
  }

  if (isMobile.value) return;

  randomizedProfiles.value = shuffle(profilesData)

  nextTick(async () => {
    const existingPositions: Array<{ x: number, y: number, width: number, height: number }> = [];

    // First, position all text blocks
    randomizedProfiles.value.forEach((profile, index) => {
      const position = findValidPosition(LAYOUT.PROFILE_TEXT_WIDTH, LAYOUT.PROFILE_TEXT_HEIGHT, existingPositions);
      
      existingPositions.push({
        ...position,
        width: LAYOUT.PROFILE_TEXT_WIDTH,
        height: LAYOUT.PROFILE_TEXT_HEIGHT
      });
      imagePositions.value[index] = position;
    });


    if (!mainCanvas.value) return;
    const particleEffect = useParticleEffect(mainCanvas.value);
    if (!particleEffect) return;

    // Check for errors
    if (particleEffect.error.value) {
      logError('ParticleEffect', particleEffect.error.value, 'Initialization error');
      return;
    }

    // Store cleanup function
    particleEffectCleanup = particleEffect.cleanup;

    // Then, add images to match text positions
    imageRefs.value
      .filter((img): img is HTMLImageElement => img !== null)
      .forEach((image, index) => {
        const textPosition = imagePositions.value[index];

        const imagePosition = {
          x: textPosition?.x ?? 0,
          y: textPosition?.y ?? 0
        };
        particleEffect.addImage(image, imagePosition);
        
        // Check for errors after adding image
        if (particleEffect.error.value) {
          logError('ParticleEffect', particleEffect.error.value, 'Error adding image');
        }
      });
  });
})

// Cleanup before unmount
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  // Cleanup particle effect if it was initialized
  if (particleEffectCleanup) {
    particleEffectCleanup()
    particleEffectCleanup = null
  }
})
</script>

<style scoped>

.main-container {
  font-family: system-ui !important;
  min-height: v-bind('minHeight');
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
  margin-top: 1rem;
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
  z-index: v-bind('canvasZIndex');
}

.hidden-image {
  display: none;
}

.profile-image {
  width: v-bind('profileImageWidth');
  height: v-bind('profileImageHeight');
  object-fit: cover;
  margin-bottom: 1rem;
}

.edit-request {
  font-size: 0.8rem;
  opacity: 0.65;
  position: relative;
  padding-bottom: 2rem;
  padding-left: 1rem;
}

/* Mobile styles */
@media (max-width: v-bind('mobileBreakpoint')) {
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
</style>