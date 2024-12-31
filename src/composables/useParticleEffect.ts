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
  private originX: number;
  private originY: number;
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
    this.dx = (this.effect.mouse.x ?? 0) - this.x;
    this.dy = (this.effect.mouse.y ?? 0) - this.y;
    this.distance = this.dx * this.dx + this.dy * this.dy;

    // Check if particle should be active
    if (this.distance < this.effect.mouse.radius) {
      this.active = true;
    }

    // If particle is active, apply forces
    if (this.active) {
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
      }
    }
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
  private animationId: number | null = null;

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
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    tempCtx.drawImage(image, x, y);
    
    const pixels = tempCtx.getImageData(0, 0, this.width, this.height).data;
    const friction = MIN_FRICTION + Math.random() * (MAX_FRICTION - MIN_FRICTION);

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
        }
      }
    }
  }

  draw(context: CanvasRenderingContext2D) {
    this.particlesArray.forEach(particle => particle.draw(context));
  }

  update() {
    let hasActiveParticles = false;
    this.particlesArray.forEach(particle => {
      particle.update();
      if (particle.active) {
        hasActiveParticles = true;
      }
    });
    return hasActiveParticles;
  }

  // Add start and stop animation methods
  startAnimation(context: CanvasRenderingContext2D) {
    let lastFrameTime = 0;
    const targetFrameInterval = 1000 / 60;

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTime > targetFrameInterval) {
        lastFrameTime = timestamp;
        context.clearRect(0, 0, this.width, this.height);
        this.draw(context);
        this.update();
        // const hasActiveParticles = this.update();
        // Optional: log active particles state
        // console.log('Active particles:', hasActiveParticles);
      }
      requestAnimationFrame(animate);
    };

    animate(0);
  }

  stopAnimation() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

export function useParticleEffect(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  try {
    const getDocHeight = () => {
      const body = document.body;
      const html = document.documentElement;
      const MAX_HEIGHT_FALLBACK = 2300;
      
      return Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight,
        MAX_HEIGHT_FALLBACK,
      );
    };

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = getDocHeight();
      canvas.style.height = `${getDocHeight()}px`;
    };

    updateCanvasSize();
    const effect = new Effect(canvas.width, canvas.height);

    // Start the animation immediately after creating the effect
    effect.startAnimation(ctx);

    const observer = new ResizeObserver(() => {
      updateCanvasSize();
      effect.width = canvas.width;
      effect.height = canvas.height;
    });
    observer.observe(document.body);

    window.addEventListener('resize', () => {
      updateCanvasSize();
      effect.width = canvas.width;
      effect.height = canvas.height;
    });

    window.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      effect.mouse.x = event.clientX;
      effect.mouse.y = event.clientY + window.scrollY;
    });

    // Return function that adds images and updates canvas if needed
    return (image: HTMLImageElement, position: { x: number, y: number }) => {
      effect.addImage(image, position.x, position.y);
      updateCanvasSize();
      return position;
    };
    
  } catch (error) {
    console.error('Error in particle effect:', error);
  }
}