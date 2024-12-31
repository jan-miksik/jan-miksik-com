const GAP = 2

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
  }
  draw(context: CanvasRenderingContext2D){
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.size, this.size)
  }
  update() {
    this.dx = (this.effect.mouse.x ?? 0) - this.x
    this.dy = (this.effect.mouse.y ?? 0) - this.y
    this.distance = this.dx * this.dx  + this.dy * this.dy
    this.force = -this.effect.mouse.radius / this.distance;

    if (this.distance < this.effect.mouse.radius){
      this.angle = Math.atan2(this.dy, this.dx);
      this.vx += this.force * Math.cos(this.angle);
      this.vy += this.force * Math.sin(this.angle);
    }

    this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
    this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
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
  private frame: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.particlesArray = [];
    this.centerX = this.width * 0.5;
    this.centerY = this.height * 0.5;
    this.gap = GAP;
    this.frame = 0;
    this.mouse = {
      radius: 3000,
      x: undefined,
      y: undefined,
    };
  }

  private checkCollision(x: number, y: number, width: number, height: number): boolean {
    const padding = 150; // Extra space between images
    
    for (const img of this.images) {
      // Check if rectangles overlap
      if (!(x + width + padding < img.x || 
            x > img.x + img.width + padding || 
            y + height + padding < img.y || 
            y > img.y + img.height + padding)) {
        return true; // Collision detected
      }
    }
    return false; // No collision
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
    // Create temporary canvas to read image data
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    tempCtx.drawImage(image, x, y);
    
    const pixels = tempCtx.getImageData(0, 0, this.width, this.height).data;
    const friction = MIN_FRICTION + Math.random() * (MAX_FRICTION - MIN_FRICTION); // Random friction between 0.9 and 0.993

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

  draw(context: CanvasRenderingContext2D){
    this.particlesArray.forEach(particle => particle.draw(context))
  }
  update(){
    this.particlesArray.forEach(particle => particle.update())

    // optimization
    // this.frame++;
    // this.particlesArray.forEach((particle, index) => {
    //   if (index % 2 === this.frame % 2) particle.update(); // Update half the particles per frame
    // });
  }
}

export function useParticleEffect(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  try {
    // Get full document height
    const getDocHeight = () => {
      const body = document.body;
      const html = document.documentElement;
      
      return Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight,
        2300
      );
    };

    // Set initial canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = getDocHeight();
      canvas.style.height = `${getDocHeight()}px`;
    };

    updateCanvasSize();
    const effect = new Effect(canvas.width, canvas.height);

    // Update canvas size when content changes
    const observer = new ResizeObserver(() => {
      updateCanvasSize();
      effect.width = canvas.width;
      effect.height = canvas.height;
    });
    observer.observe(document.body);

    // Handle window resize
    window.addEventListener('resize', () => {
      updateCanvasSize();
      effect.width = canvas.width;
      effect.height = canvas.height;
    });

    // Update mouse coordinates with scroll position
    window.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      effect.mouse.x = event.clientX;
      effect.mouse.y = event.clientY + window.scrollY;
    });

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      effect.draw(ctx);
      effect.update();
      requestAnimationFrame(animate);
    }
    animate();

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