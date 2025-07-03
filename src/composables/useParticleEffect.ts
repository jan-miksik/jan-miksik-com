const PIXELS_GAP = 2

const MIN_FRICTION = 0.98;
const MAX_FRICTION = 0.995;

const MIN_VARIATION = 0.001;
const MAX_VARIATION = 0.005;

class Particle {
  public x: number;
  public y: number;
  public size: number;
  public color: string;
  public effect: Effect;
  public friction: number;
  private vx: number;
  private vy: number;
  private ease: number;
  private dx: number;
  private dy: number;
  private distance: number;
  private force: number;
  private angle: number;
  public originX: number;
  public originY: number;
  public active: boolean;

  constructor(effect: Effect, x: number, y: number, color: string, friction: number) {
    this.effect = effect;
    this.x = x;
    this.y = y;
    this.originX = Math.floor(x);
    this.originY = Math.floor(y);
    this.color = color;
    this.size = this.effect.gap;
    this.vx = 0;
    this.vy = 0;
    this.ease = 0.03;
    const variation = MIN_VARIATION + Math.random() * (MAX_VARIATION - MIN_VARIATION);
    this.friction = friction + variation;
    this.dx = 0;
    this.dy = 0;
    this.distance = 0;
    this.force = 0;
    this.angle = 0;
    this.active = false; // Start inactive
  }

  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.size, this.size);
  }

  update() {
    // If particle is not active, only check if it needs to return to origin
    if (!this.active) {
      const dx = this.originX - this.x;
      const dy = this.originY - this.y;
      const distanceFromOrigin = dx * dx + dy * dy;
      
      // Only activate return-to-origin behavior if particle is displaced
      if (distanceFromOrigin > 0.1) {
        this.x += dx * this.ease;
        this.y += dy * this.ease;
        return true;
      }
      return false;
    }

    // Active particle behavior remains the same
    this.dx = (this.effect.mouse.x ?? 0) - this.x;
    this.dy = (this.effect.mouse.y ?? 0) - this.y;
    this.distance = this.dx * this.dx + this.dy * this.dy;

    if (this.distance < this.effect.mouse.radius) {
      this.force = -this.effect.mouse.radius / this.distance;
      this.angle = Math.atan2(this.dy, this.dx);
      this.vx += this.force * Math.cos(this.angle);
      this.vy += this.force * Math.sin(this.angle);
    }

    // Update position
    this.x += (this.vx *= this.friction);
    this.y += (this.vy *= this.friction);

    // Add spring force back to original position
    const dx = this.originX - this.x;
    const dy = this.originY - this.y;
    this.x += dx * this.ease;
    this.y += dy * this.ease;

    // Check if particle should become inactive
    const distanceFromOrigin = dx * dx + dy * dy;
    if (distanceFromOrigin < 0.1 && Math.abs(this.vx) < 0.01 && Math.abs(this.vy) < 0.01) {
      this.active = false;
      this.x = this.originX;
      this.y = this.originY;
      this.vx = 0;
      this.vy = 0;
      return false;
    }

    return true;
  }
}

interface EffectProps {
  width: number;
  height: number;
  particlesArray: Particle[];
  centerX: number;
  centerY: number;
  gap: number;
  mouse: {
    radius: number;
    x: number | undefined;
    y: number | undefined;
  };
}

class Effect implements EffectProps {
  public width: number;
  public height: number;
  public particlesArray: Particle[];
  public centerX: number;
  public centerY: number;
  public gap: number;
  public mouse: { radius: number; x: number | undefined; y: number | undefined };
  private images: Array<{
    image: HTMLImageElement;
    x: number;
    y: number;
    width: number;
    height: number;
  }> = [];
  private needsRedraw: boolean = true;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.particlesArray = [];
    this.centerX = this.width * 0.5;
    this.centerY = this.height * 0.5;
    this.gap = PIXELS_GAP;
    this.mouse = {
      radius: 3000,
      x: undefined,
      y: undefined,
    };
  }

  addImage(image: HTMLImageElement, x: number, y: number) {
    this.images.push({ 
      image, 
      x, 
      y,
      width: image.width,
      height: image.height
    });
    this.initImage(image, x, y);
  }

  private initImage(image: HTMLImageElement, x: number, y: number) {
    try {
      const tempCanvas = document.createElement('canvas');
      
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        return;
      }

      tempCanvas.width = this.width;
      tempCanvas.height = this.height;
      
      tempCtx.drawImage(image, x, y);
      
      const pixels = tempCtx.getImageData(0, 0, this.width, this.height).data;
      
      const friction = MIN_FRICTION + Math.random() * (MAX_FRICTION - MIN_FRICTION);

      let particleCount = 0;
      for (let y = 0; y < this.height; y += this.gap) {
        for (let x = 0; x < this.width; x += this.gap) {
          const index = (y * this.width + x) * 4;
          const alpha = pixels[index + 3];
          
          if (alpha > 0) {
            const red = pixels[index];
            const green = pixels[index + 1];
            const blue = pixels[index + 2];
            const color = `rgb(${red},${green},${blue})`;
            this.particlesArray.push(new Particle(this, x, y, color, friction));
            particleCount++;
          }
        }
      }
    } catch (error) {
      console.error('[ParticleEffect] Error in initImage:', error);
    }
  }

  draw(context: CanvasRenderingContext2D) {
    // Only redraw if needed
    if (this.needsRedraw) {
      try {
        context.clearRect(0, 0, this.width, this.height);
        this.particlesArray.forEach(particle => particle.draw(context));
        this.needsRedraw = false;
      } catch (error) {
        console.error('[ParticleEffect] Error in draw:', error);
      }
    }
  }

  update() {
    let hasActiveParticles = false;
    const mouseRadiusSquared = this.mouse.radius ** 2;
    
    this.particlesArray.forEach(particle => {
      const dx = particle.x - (this.mouse.x ?? 0);
      const dy = particle.y - (this.mouse.y ?? 0);
      const distanceSquared = dx * dx + dy * dy;
      
      if (distanceSquared < mouseRadiusSquared) {
        particle.active = true;
        if (particle.update()) {
          hasActiveParticles = true;
          this.needsRedraw = true;
        }
      } else if (particle.active || particle.x !== particle.originX || particle.y !== particle.originY) {
        if (particle.update()) {
          hasActiveParticles = true;
          this.needsRedraw = true;
        }
      }
    });
    
    return hasActiveParticles;
  }

  startAnimation(context: CanvasRenderingContext2D) {
    let lastFrameTime = 0;
    const targetFrameInterval = 1000 / 60;
    let frameCount = 0;

    const animate = (timestamp: number) => {
      try {
        if (timestamp - lastFrameTime > targetFrameInterval) {
          lastFrameTime = timestamp;
          frameCount++;
          
          // Only update and draw if there are active particles or redraw is needed
          const hasActiveParticles = this.update();
          if (hasActiveParticles || this.needsRedraw) {
            this.draw(context);
          }
        }
        requestAnimationFrame(animate);
      } catch (error) {
        console.error('[ParticleEffect] Error in animation frame:', error);
        // Continue animation even if there's an error
        requestAnimationFrame(animate);
      }
    };

    animate(0);
  }

  // Update resize handling
  updateSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.needsRedraw = true;
  }
}

export function useParticleEffect(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  try {
    const getDocHeight = () => {
      const body = document.body;
      const html = document.documentElement;
      const MAX_HEIGHT_FALLBACK = 2300;
      
      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight,
        MAX_HEIGHT_FALLBACK,
      );
      
      return height;
    };

    // Proper canvas initialization
    const initializeCanvas = () => {
      try {
        const newWidth = window.innerWidth;
        const newHeight = getDocHeight();
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        canvas.style.height = `${newHeight}px`;
        
        // Initialize canvas context with a minimal draw to "warm it up"
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, 1, 1);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        return { width: newWidth, height: newHeight };
      } catch (error) {
        console.error('[ParticleEffect] Error in canvas initialization:', error);
        return null;
      }
    };

    // Initialize canvas immediately
    const canvasDimensions = initializeCanvas();
    if (!canvasDimensions) {
      return;
    }

    // Create effect instance
    let effect: Effect | null = null;
    let isInitialized = false;

    // Initialize the effect with a delay to ensure DOM is ready
    const initializeEffect = () => {
      effect = new Effect(canvasDimensions.width, canvasDimensions.height);

      // Start the animation
      effect.startAnimation(ctx);

      try {
        const observer = new ResizeObserver(() => {
          const dims = initializeCanvas();
          if (dims && effect) {
            effect.updateSize(dims.width, dims.height);
          }
        });
        observer.observe(document.body);
      } catch (error) {
        console.error('[ParticleEffect] Error setting up ResizeObserver:', error);
      }

      window.addEventListener('resize', () => {
        const dims = initializeCanvas();
        if (dims && effect) {
          effect.updateSize(dims.width, dims.height);
        }
      });

      window.addEventListener('mousemove', (event) => {
        if (effect) {
          effect.mouse.x = event.clientX;
          effect.mouse.y = event.clientY + window.scrollY;
        }
      });

      isInitialized = true;
    };

    // Initialize effect after a short delay to ensure DOM is ready
    setTimeout(initializeEffect, 100);

    // Return the add image function
    return (image: HTMLImageElement, position: { x: number, y: number }) => {
      const addImageWhenReady = () => {
        if (effect && isInitialized) {
          effect.addImage(image, position.x, position.y);
          const dims = initializeCanvas();
          if (dims) {
            effect.updateSize(dims.width, dims.height);
          }
        } else {
          // Wait a bit more if effect isn't ready
          setTimeout(addImageWhenReady, 50);
        }
      };

      addImageWhenReady();
      return position;
    };
    
  } catch (error) {
    console.error('[ParticleEffect] Error in particle effect:', error);
  }
}