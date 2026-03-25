import Matter from 'matter-js';
import { GameConfig, GameState, GameStatus } from '@/types/game';
import { GameTheme, THEMES, DEFAULT_THEME_ID } from './themes';
import {
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  PADDLE_SPEED,
  INITIAL_BALL_SPEED,
  WALL_THICKNESS,
  WINNING_SCORE,
  SCORE_BAR_HEIGHT,
} from './constants';

type BonusType = 'extraBall' | 'bigPaddle' | 'shrinkPaddle' | 'speedUp' | 'slowDown';

interface Bonus {
  body: Matter.Body;
  type: BonusType;
  createdAt: number;
}

const BONUS_COLORS: Record<BonusType, string> = {
  extraBall: '#10b981',
  bigPaddle: '#3b82f6',
  shrinkPaddle: '#ef4444',
  speedUp: '#f59e0b',
  slowDown: '#8b5cf6',
};

const BONUS_SYMBOLS: Record<BonusType, string> = {
  extraBall: '+',
  bigPaddle: '↑',
  shrinkPaddle: '↓',
  speedUp: '!',
  slowDown: '~',
};

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: GameConfig;
  private theme: GameTheme;
  private onStateChange: (state: GameState) => void;

  // Dynamic dimensions — read from the canvas element every frame
  private get W() { return this.canvas.width; }
  private get H() { return this.canvas.height; }
  // Play area starts below the score bar
  private get playTop() { return SCORE_BAR_HEIGHT; }
  private get playH() { return this.H - SCORE_BAR_HEIGHT; }

  private engine: Matter.Engine;
  private paddles: { left: Matter.Body; right: Matter.Body };
  private paddleHeight: number;
  private balls: Matter.Body[] = [];
  private obstacles: Matter.Body[] = [];
  private bonuses: Bonus[] = [];

  private keys: { [key: string]: boolean } = {};
  private animationFrameId: number | null = null;
  private status: GameStatus = 'idle';
  private score = { left: 0, right: 0 };
  private startTime: number = 0;
  private lastBonusSpawn: number = 0;

  private handleKeyDown!: (e: KeyboardEvent) => void;
  private handleKeyUp!: (e: KeyboardEvent) => void;

  constructor(
    canvas: HTMLCanvasElement,
    config: GameConfig,
    onStateChange: (state: GameState) => void,
    themeId?: string
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    this.ctx = ctx;
    this.config = config;
    this.theme = THEMES[(themeId as keyof typeof THEMES) ?? DEFAULT_THEME_ID] ?? THEMES[DEFAULT_THEME_ID];
    this.onStateChange = onStateChange;
    this.paddleHeight = PADDLE_HEIGHT;

    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 0 },
    });

    this.setupWalls();
    this.paddles = this.createPaddles();
    this.setupBalls();
    this.setupObstacles();
    this.setupCollisions();
    this.setupInputs();
  }

  private isRuleEnabled(id: string): boolean {
    return this.config.rules.find((r) => r.id === id)?.enabled ?? false;
  }

  private getRuleOption(id: string, key: string): number | boolean {
    const rule = this.config.rules.find((r) => r.id === id);
    return rule?.options[key] ?? 0;
  }

  private setupWalls() {
    const W = this.W, H = this.H;
    const wallTop = Matter.Bodies.rectangle(
      W / 2,
      this.playTop - WALL_THICKNESS / 2,
      W,
      WALL_THICKNESS,
      { isStatic: true, label: 'wallTop' }
    );
    const wallBottom = Matter.Bodies.rectangle(
      W / 2,
      H + WALL_THICKNESS / 2,
      W,
      WALL_THICKNESS,
      { isStatic: true, label: 'wallBottom' }
    );
    const wallLeft = Matter.Bodies.rectangle(
      -WALL_THICKNESS / 2,
      H / 2,
      WALL_THICKNESS,
      H,
      { isStatic: true, isSensor: true, label: 'wallLeft' }
    );
    const wallRight = Matter.Bodies.rectangle(
      W + WALL_THICKNESS / 2,
      H / 2,
      WALL_THICKNESS,
      H,
      { isStatic: true, isSensor: true, label: 'wallRight' }
    );

    Matter.Composite.add(this.engine.world, [wallTop, wallBottom, wallLeft, wallRight]);
  }

  private createPaddles() {
    const W = this.W, H = this.H;
    const midY = this.playTop + this.playH / 2;
    const leftPaddle = Matter.Bodies.rectangle(
      40,
      midY,
      PADDLE_WIDTH,
      this.paddleHeight,
      {
        isStatic: true,
        label: 'paddleLeft',
        restitution: 1.05,
        friction: 0,
      }
    );
    const rightPaddle = Matter.Bodies.rectangle(
      W - 40,
      midY,
      PADDLE_WIDTH,
      this.paddleHeight,
      {
        isStatic: true,
        label: 'paddleRight',
        restitution: 1.05,
        friction: 0,
      }
    );

    Matter.Composite.add(this.engine.world, [leftPaddle, rightPaddle]);
    return { left: leftPaddle, right: rightPaddle };
  }

  private setupBalls() {
    const multipleBalls = this.isRuleEnabled('multipleBalls');
    const ballCount = multipleBalls
      ? (this.getRuleOption('multipleBalls', 'count') as number)
      : 1;

    for (let i = 0; i < ballCount; i++) {
      this.spawnBall(i);
    }
  }

  private spawnBall(index?: number) {
    const x = this.W / 2 + (Math.random() - 0.5) * 100;
    const y = this.playTop + this.playH / 2 + (Math.random() - 0.5) * 100;

    const angle = (Math.random() - 0.5) * Math.PI / 3;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const vx = Math.cos(angle) * INITIAL_BALL_SPEED * direction;
    const vy = Math.sin(angle) * INITIAL_BALL_SPEED;

    const ball = Matter.Bodies.circle(x, y, BALL_RADIUS, {
      restitution: 1,
      friction: 0,
      frictionAir: 0,
      inertia: Infinity,
      label: `ball_${Date.now()}_${index ?? this.balls.length}`,
    });

    Matter.Body.setVelocity(ball, { x: vx, y: vy });
    Matter.Composite.add(this.engine.world, ball);
    this.balls.push(ball);
  }

  private setupObstacles() {
    if (!this.isRuleEnabled('obstacles')) return;

    const count = this.getRuleOption('obstacles', 'count') as number;
    const W = this.W, playTop = this.playTop, playH = this.playH;

    for (let i = 0; i < count; i++) {
      const x = W * 0.25 + Math.random() * W * 0.5;
      const y = playTop + playH * 0.1 + Math.random() * playH * 0.8;
      const width = 40 + Math.random() * 40;
      const height = 40 + Math.random() * 40;

      const obstacle = Matter.Bodies.rectangle(x, y, width, height, {
        isStatic: true,
        restitution: 1,
        label: `obstacle_${i}`,
      });

      Matter.Composite.add(this.engine.world, obstacle);
      this.obstacles.push(obstacle);
    }
  }

  private setupCollisions() {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      const pairs = event.pairs;

      for (const pair of pairs) {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        const ball = this.balls.find((b) => b === bodyA || b === bodyB);
        const wallLeft = bodyA.label === 'wallLeft' || bodyB.label === 'wallLeft' ? bodyA.label === 'wallLeft' ? bodyA : bodyB : null;
        const wallRight = bodyA.label === 'wallRight' || bodyB.label === 'wallRight' ? bodyA.label === 'wallRight' ? bodyA : bodyB : null;
        const bonus = this.bonuses.find((b) => b.body === bodyA || b.body === bodyB);
        const isPaddle = bodyA.label === 'paddleLeft' || bodyA.label === 'paddleRight' ||
                         bodyB.label === 'paddleLeft' || bodyB.label === 'paddleRight';

        if (ball && wallLeft) {
          this.handleScore('right', ball);
        } else if (ball && wallRight) {
          this.handleScore('left', ball);
        } else if (ball && bonus) {
          this.applyBonus(bonus.type);
          this.removeBonus(bonus);
        } else if (ball && isPaddle) {
          // paddle hit effect
          this.theme.onBallHit?.(this.ctx, ball.position.x, ball.position.y);
        }
      }
    });
  }

  private handleScore(scorer: 'left' | 'right', ball: Matter.Body) {
    this.score[scorer]++;

    // Fire score explosion effect at the ball's last position
    this.theme.onBallScore?.(this.ctx, ball.position.x, ball.position.y);

    Matter.Composite.remove(this.engine.world, ball);
    this.balls = this.balls.filter((b) => b !== ball);

    if (this.isRuleEnabled('shrinkingPaddle')) {
      const loser = scorer === 'left' ? 'right' : 'left';
      this.shrinkPaddle(loser);
    }

    if (this.score[scorer] >= WINNING_SCORE) {
      this.status = 'gameover';
      this.updateGameState();
      return;
    }

    if (this.balls.length === 0) {
      setTimeout(() => this.spawnBall(), 1000);
    }

    this.updateGameState();
  }

  private shrinkPaddle(side: 'left' | 'right') {
    this.paddleHeight = Math.max(30, this.paddleHeight - 10);

    const oldPaddle = this.paddles[side];
    Matter.Composite.remove(this.engine.world, oldPaddle);

    const newPaddle = Matter.Bodies.rectangle(
      oldPaddle.position.x,
      oldPaddle.position.y,
      PADDLE_WIDTH,
      this.paddleHeight,
      {
        isStatic: true,
        label: side === 'left' ? 'paddleLeft' : 'paddleRight',
        restitution: 1.05,
        friction: 0,
      }
    );

    this.paddles[side] = newPaddle;
    Matter.Composite.add(this.engine.world, newPaddle);
  }

  private applyBonus(type: BonusType) {
    switch (type) {
      case 'extraBall':
        this.spawnBall();
        break;
      case 'bigPaddle':
        this.resizePaddles(30);
        break;
      case 'shrinkPaddle':
        this.resizePaddles(-20);
        break;
      case 'speedUp':
        this.balls.forEach((ball) => {
          const velocity = ball.velocity;
          Matter.Body.setVelocity(ball, {
            x: velocity.x * 1.3,
            y: velocity.y * 1.3,
          });
        });
        break;
      case 'slowDown':
        this.balls.forEach((ball) => {
          const velocity = ball.velocity;
          Matter.Body.setVelocity(ball, {
            x: velocity.x * 0.7,
            y: velocity.y * 0.7,
          });
        });
        break;
    }
  }

  private resizePaddles(delta: number) {
    this.paddleHeight = Math.max(30, Math.min(180, this.paddleHeight + delta));

    ['left', 'right'].forEach((side) => {
      const oldPaddle = this.paddles[side as 'left' | 'right'];
      Matter.Composite.remove(this.engine.world, oldPaddle);

      const newPaddle = Matter.Bodies.rectangle(
        oldPaddle.position.x,
        oldPaddle.position.y,
        PADDLE_WIDTH,
        this.paddleHeight,
        {
          isStatic: true,
          label: side === 'left' ? 'paddleLeft' : 'paddleRight',
          restitution: 1.05,
          friction: 0,
        }
      );

      this.paddles[side as 'left' | 'right'] = newPaddle;
      Matter.Composite.add(this.engine.world, newPaddle);
    });
  }

  private removeBonus(bonus: Bonus) {
    Matter.Composite.remove(this.engine.world, bonus.body);
    this.bonuses = this.bonuses.filter((b) => b !== bonus);
  }

  private setupInputs() {
    this.handleKeyDown = (e: KeyboardEvent) => {
      this.keys[e.key] = true;
      if (e.key === 'p' || e.key === 'P') {
        this.togglePause();
      }
    };
    this.handleKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key] = false;
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private movePaddles() {
    let leftDy = 0;
    if (this.keys['w'] || this.keys['W']) leftDy -= PADDLE_SPEED;
    if (this.keys['s'] || this.keys['S']) leftDy += PADDLE_SPEED;

    const topBound = this.playTop + this.paddleHeight / 2;
    const botBound = this.H - this.paddleHeight / 2;

    const leftPaddle = this.paddles.left;
    const leftY = Math.max(topBound, Math.min(botBound, leftPaddle.position.y + leftDy));
    Matter.Body.setPosition(leftPaddle, { x: leftPaddle.position.x, y: leftY });

    let rightDy = 0;
    if (this.keys['ArrowUp']) rightDy -= PADDLE_SPEED;
    if (this.keys['ArrowDown']) rightDy += PADDLE_SPEED;

    const rightPaddle = this.paddles.right;
    const rightY = Math.max(topBound, Math.min(botBound, rightPaddle.position.y + rightDy));
    Matter.Body.setPosition(rightPaddle, { x: rightPaddle.position.x, y: rightY });
  }

  private getMaxSpeed(): number {
    if (!this.isRuleEnabled('speedRamp')) {
      return INITIAL_BALL_SPEED * 2;
    }

    const factor = this.getRuleOption('speedRamp', 'factor') as number;
    const elapsed = (Date.now() - this.startTime) / 60000;
    const maxSpeed = INITIAL_BALL_SPEED * Math.pow(factor, elapsed);
    return Math.min(maxSpeed, INITIAL_BALL_SPEED * 4);
  }

  private normalizeBallSpeeds() {
    const minSpeed = INITIAL_BALL_SPEED * 0.8;
    const maxSpeed = this.getMaxSpeed();

    this.balls.forEach((ball) => {
      const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
      if (speed < minSpeed) {
        const scale = minSpeed / speed;
        Matter.Body.setVelocity(ball, {
          x: ball.velocity.x * scale,
          y: ball.velocity.y * scale,
        });
      } else if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        Matter.Body.setVelocity(ball, {
          x: ball.velocity.x * scale,
          y: ball.velocity.y * scale,
        });
      }
    });
  }

  private updateBonuses() {
    if (!this.isRuleEnabled('bonuses')) return;
    if (this.status !== 'playing') return;

    const now = Date.now();

    if (now - this.lastBonusSpawn > 5000 && this.bonuses.length < 3) {
      this.spawnBonus();
      this.lastBonusSpawn = now;
    }

    this.bonuses = this.bonuses.filter((bonus) => {
      if (now - bonus.createdAt > 15000) {
        Matter.Composite.remove(this.engine.world, bonus.body);
        return false;
      }
      return true;
    });
  }

  private spawnBonus() {
    const types: BonusType[] = ['extraBall', 'bigPaddle', 'shrinkPaddle', 'speedUp', 'slowDown'];
    const type = types[Math.floor(Math.random() * types.length)];

    const x = this.W * 0.25 + Math.random() * this.W * 0.5;
    const y = this.playTop + this.playH * 0.1 + Math.random() * this.playH * 0.8;

    const body = Matter.Bodies.circle(x, y, 15, {
      isStatic: true,
      isSensor: true,
      label: `bonus_${type}`,
    });

    Matter.Composite.add(this.engine.world, body);
    this.bonuses.push({ body, type, createdAt: Date.now() });
  }

  private warpBalls() {
    if (!this.isRuleEnabled('warpWalls')) return;

    this.balls.forEach((ball) => {
      if (ball.position.y <= this.playTop - BALL_RADIUS) {
        Matter.Body.setPosition(ball, { x: ball.position.x, y: this.H + BALL_RADIUS - 1 });
      } else if (ball.position.y >= this.H + BALL_RADIUS) {
        Matter.Body.setPosition(ball, { x: ball.position.x, y: this.playTop - BALL_RADIUS + 1 });
      }
    });
  }

  private render() {
    const ctx = this.ctx;
    const t = this.theme;
    const W = this.W, H = this.H;
    const scoreBarH = SCORE_BAR_HEIGHT;

    // Background
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, W, H);

    // Score bar background (top strip)
    ctx.fillStyle = t.wallColor;
    ctx.fillRect(0, 0, W, scoreBarH);

    // Scanlines (retro effect)
    if (t.scanlines) {
      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, y, W, 2);
      }
    }

    // Center line (play area only)
    ctx.strokeStyle = t.centerLine;
    ctx.setLineDash([20, 20]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2, scoreBarH);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Score — vertically centered in the score bar
    const scoreMidY = scoreBarH / 2;
    ctx.fillStyle = t.scoreColor;
    ctx.font = t.scoreFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (t.id === 'retro') {
      ctx.shadowBlur = 10;
      ctx.shadowColor = t.scoreColor;
    }
    ctx.fillText(this.score.left.toString(), W / 4, scoreMidY);
    ctx.fillText(this.score.right.toString(), (W * 3) / 4, scoreMidY);
    ctx.shadowBlur = 0;

    // Paddles
    if (t.paddleGlow) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = t.paddleGlow;
    }
    this.drawRoundedRect(this.paddles.left, t.leftPaddle);
    this.drawRoundedRect(this.paddles.right, t.rightPaddle);
    ctx.shadowBlur = 0;

    // Balls
    this.balls.forEach((ball, i) => {
      ctx.shadowBlur = t.ballShadowBlur;
      ctx.shadowColor = t.ballGlow(i);
      ctx.fillStyle = t.ballFill(i);
      ctx.beginPath();
      ctx.arc(ball.position.x, ball.position.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Obstacles
    this.obstacles.forEach((obs) => {
      ctx.fillStyle = t.obstacleFill;
      ctx.strokeStyle = t.obstacleStroke;
      ctx.lineWidth = 2;
      if (t.id === 'retro') {
        ctx.shadowBlur = 6;
        ctx.shadowColor = t.obstacleStroke;
      }
      const width = obs.bounds.max.x - obs.bounds.min.x;
      const height = obs.bounds.max.y - obs.bounds.min.y;
      ctx.fillRect(obs.bounds.min.x, obs.bounds.min.y, width, height);
      ctx.strokeRect(obs.bounds.min.x, obs.bounds.min.y, width, height);
      ctx.shadowBlur = 0;
    });

    // Bonuses
    this.bonuses.forEach((bonus) => {
      ctx.fillStyle = BONUS_COLORS[bonus.type];
      ctx.shadowBlur = 10;
      ctx.shadowColor = BONUS_COLORS[bonus.type];
      ctx.beginPath();
      ctx.arc(bonus.body.position.x, bonus.body.position.y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = t.id === 'minimalist' || t.id === 'pastel' ? '#000' : '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(BONUS_SYMBOLS[bonus.type], bonus.body.position.x, bonus.body.position.y);
    });

    // Paused overlay
    if (this.status === 'paused') {
      ctx.fillStyle = t.overlayBg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = t.overlayText;
      ctx.font = t.overlayFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PAUSED', W / 2, H / 2 - 30);
      ctx.font = t.overlayFont.replace(/\d+px/, '24px').replace('bold ', '');
      ctx.fillText('Press P to resume', W / 2, H / 2 + 28);
    }

    // Game over overlay
    if (this.status === 'gameover') {
      ctx.fillStyle = t.overlayBg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = t.overlayText;
      ctx.font = t.overlayFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const winnerText = this.score.left >= WINNING_SCORE ? 'LEFT WINS!' : 'RIGHT WINS!';
      ctx.fillText(winnerText, W / 2, H / 2 - 30);
      ctx.font = t.overlayFont.replace(/\d+px/, '32px').replace('bold ', '');
      ctx.fillText(
        `${this.score.left} - ${this.score.right}`,
        W / 2,
        H / 2 + 46
      );
    }

    // Theme particle / effect layer — drawn on top of everything
    this.theme.onUpdate?.(ctx);
  }

  private drawRoundedRect(body: Matter.Body, color: string) {
    const ctx = this.ctx;
    const width = PADDLE_WIDTH;
    const height = this.paddleHeight;
    const x = body.position.x - width / 2;
    const y = body.position.y - height / 2;
    const radius = 4;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  private gameLoop = () => {
    if (this.status === 'playing') {
      this.movePaddles();
      this.warpBalls();
      this.updateBonuses();
      Matter.Engine.update(this.engine, 1000 / 60);
      this.normalizeBallSpeeds();
    }

    this.render();

    if (this.status !== 'idle') {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  };

  private updateGameState() {
    const state: GameState = {
      status: this.status,
      score: { ...this.score },
      winner:
        this.status === 'gameover'
          ? this.score.left >= WINNING_SCORE
            ? 'left'
            : 'right'
          : null,
    };
    this.onStateChange(state);
  }

  start() {
    if (this.status === 'idle') {
      this.status = 'playing';
      this.startTime = Date.now();
      this.lastBonusSpawn = Date.now();
      this.updateGameState();
      this.gameLoop();
    }
  }

  togglePause() {
    if (this.status === 'playing') {
      this.status = 'paused';
    } else if (this.status === 'paused') {
      this.status = 'playing';
    }
    this.updateGameState();
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    Matter.Engine.clear(this.engine);
    Matter.Composite.clear(this.engine.world, false, true);
  }
}
