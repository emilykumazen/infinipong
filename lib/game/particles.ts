export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;      // 0..1, decreasing
  decay: number;     // per frame
  size: number;
  color: string;
  // optional per-particle draw override
  draw?: (ctx: CanvasRenderingContext2D, p: Particle) => void;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  emit(p: Omit<Particle, 'life'> & { life?: number }) {
    this.particles.push({ life: 1, ...p });
  }

  /** Call once per frame. Returns number of live particles. */
  update(ctx: CanvasRenderingContext2D): number {
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // gravity
      p.life -= p.decay;
      if (p.draw) {
        p.draw(ctx, p);
      } else {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    return this.particles.length;
  }

  clear() {
    this.particles = [];
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

export function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

// ─── Preset burst emitters ─────────────────────────────────────────────────────

/** Classic ember sparks — default / dark theme */
export function emitEmbers(ps: ParticleSystem, x: number, y: number, color: string, count = 22) {
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(1.5, 5.5);
    ps.emit({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - rand(1, 3),
      decay: rand(0.018, 0.035),
      size: rand(2, 5),
      color,
    });
  }
}

/** Retro pixel burst — square pixels, single green color */
export function emitPixels(ps: ParticleSystem, x: number, y: number, color: string, count = 18) {
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(2, 6);
    const sz = randInt(3, 7);
    ps.emit({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      decay: rand(0.02, 0.04),
      size: sz,
      color,
      draw(ctx, p) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      },
    });
  }
}

/** Neon shockwave ring — expanding stroke circle */
export function emitShockwave(ps: ParticleSystem, x: number, y: number, color: string) {
  // Single "particle" that expands outward
  ps.emit({
    x, y,
    vx: 0, vy: 0,
    decay: 0.03,
    size: 0, // used as radius growth tracker via life
    color,
    draw(ctx, p) {
      const radius = (1 - p.life) * 80 + 10;
      ctx.globalAlpha = Math.max(0, p.life * 0.8);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3 * p.life;
      ctx.shadowBlur = 20;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    },
  });
  // inner sparks too
  for (let i = 0; i < 14; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(3, 8);
    ps.emit({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      decay: rand(0.025, 0.05),
      size: rand(2, 4),
      color,
    });
  }
}

/** Pastel petals — soft circles drifting up */
export function emitPetals(ps: ParticleSystem, x: number, y: number, count = 18) {
  const colors = ['#f9a8d4', '#c4b5fd', '#93c5fd', '#86efac', '#fcd34d'];
  for (let i = 0; i < count; i++) {
    const angle = rand(-Math.PI, 0); // upward fan
    const speed = rand(1, 4);
    ps.emit({
      x, y,
      vx: Math.cos(angle) * speed + rand(-1, 1),
      vy: Math.sin(angle) * speed - rand(0.5, 2),
      decay: rand(0.012, 0.025),
      size: rand(4, 9),
      color: colors[randInt(0, colors.length - 1)],
      draw(ctx, p) {
        ctx.globalAlpha = Math.max(0, p.life * 0.85);
        ctx.fillStyle = p.color;
        // petal = slightly elongated oval
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.vx * 0.3);
        ctx.scale(1, 1.5);
        ctx.beginPath();
        ctx.arc(0, 0, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.globalAlpha = 1;
      },
    });
  }
}

/** Minimalist — clean white/black squares flying out */
export function emitSquares(ps: ParticleSystem, x: number, y: number, color: string, count = 14) {
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(2, 6);
    const sz = randInt(4, 10);
    ps.emit({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      decay: rand(0.022, 0.04),
      size: sz,
      color,
      draw(ctx, p) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        const s = p.size * p.life;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        ctx.globalAlpha = 1;
      },
    });
  }
}
