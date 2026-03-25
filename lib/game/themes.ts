export type ThemeId = 'default' | 'retro' | 'minimalist' | 'neon' | 'pastel';

export interface GameTheme {
  id: ThemeId;
  name: string;
  description: string;
  icon: string;
  // Background
  bg: string;
  // Top/bottom wall strips
  wallColor: string;
  // Center dashed line
  centerLine: string;
  // Score text
  scoreColor: string;
  scoreFont: string;
  // Paddles
  leftPaddle: string;
  rightPaddle: string;
  paddleGlow: string; // '' = no glow
  // Balls: function of ball index returning {fill, glow}
  ballFill: (i: number) => string;
  ballGlow: (i: number) => string;
  ballShadowBlur: number;
  // Obstacles
  obstacleFill: string;
  obstacleStroke: string;
  // Overlays
  overlayBg: string;
  overlayText: string;
  overlayFont: string;
  // Scanlines effect
  scanlines: boolean;
}

export const THEMES: Record<ThemeId, GameTheme> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'The classic dark space look',
    icon: '🌑',
    bg: '#0a0a0f',
    wallColor: '#1e293b',
    centerLine: 'rgba(255,255,255,0.15)',
    scoreColor: 'rgba(255,255,255,0.9)',
    scoreFont: 'bold 48px monospace',
    leftPaddle: '#60a5fa',
    rightPaddle: '#f87171',
    paddleGlow: '',
    ballFill: (i) => `hsl(${(i * 60) % 360}, 70%, 60%)`,
    ballGlow: (i) => `hsl(${(i * 60) % 360}, 70%, 50%)`,
    ballShadowBlur: 15,
    obstacleFill: '#475569',
    obstacleStroke: '#64748b',
    overlayBg: 'rgba(0,0,0,0.8)',
    overlayText: '#ffffff',
    overlayFont: 'bold 56px sans-serif',
    scanlines: false,
  },

  retro: {
    id: 'retro',
    name: 'Retro',
    description: 'Green phosphor CRT terminal',
    icon: '📺',
    bg: '#0d1a0d',
    wallColor: '#1a3a1a',
    centerLine: 'rgba(0,255,0,0.2)',
    scoreColor: '#00ff41',
    scoreFont: 'bold 48px "Courier New", monospace',
    leftPaddle: '#00ff41',
    rightPaddle: '#00cc33',
    paddleGlow: '#00ff41',
    ballFill: () => '#00ff41',
    ballGlow: () => '#00ff41',
    ballShadowBlur: 20,
    obstacleFill: '#0a2e0a',
    obstacleStroke: '#00ff41',
    overlayBg: 'rgba(0,15,0,0.9)',
    overlayText: '#00ff41',
    overlayFont: 'bold 56px "Courier New", monospace',
    scanlines: true,
  },

  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean white on black, no distractions',
    icon: '⬜',
    bg: '#ffffff',
    wallColor: '#e5e5e5',
    centerLine: 'rgba(0,0,0,0.1)',
    scoreColor: 'rgba(0,0,0,0.25)',
    scoreFont: 'bold 64px "Helvetica Neue", sans-serif',
    leftPaddle: '#000000',
    rightPaddle: '#000000',
    paddleGlow: '',
    ballFill: () => '#000000',
    ballGlow: () => 'transparent',
    ballShadowBlur: 0,
    obstacleFill: '#cccccc',
    obstacleStroke: '#aaaaaa',
    overlayBg: 'rgba(255,255,255,0.92)',
    overlayText: '#000000',
    overlayFont: 'bold 56px "Helvetica Neue", sans-serif',
    scanlines: false,
  },

  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Synthwave vibes, glowing everything',
    icon: '🌈',
    bg: '#0d001a',
    wallColor: '#1a0033',
    centerLine: 'rgba(255,0,255,0.2)',
    scoreColor: '#ff00ff',
    scoreFont: 'bold 48px monospace',
    leftPaddle: '#00ffff',
    rightPaddle: '#ff00ff',
    paddleGlow: '#ff00ff',
    ballFill: (i) => ['#ff00ff', '#00ffff', '#ffff00', '#ff6600', '#00ff88'][i % 5],
    ballGlow: (i) => ['#ff00ff', '#00ffff', '#ffff00', '#ff6600', '#00ff88'][i % 5],
    ballShadowBlur: 25,
    obstacleFill: '#1a0033',
    obstacleStroke: '#8800ff',
    overlayBg: 'rgba(13,0,26,0.9)',
    overlayText: '#ff00ff',
    overlayFont: 'bold 56px monospace',
    scanlines: false,
  },

  pastel: {
    id: 'pastel',
    name: 'Pastel',
    description: 'Soft and dreamy colors',
    icon: '🌸',
    bg: '#fdf4ff',
    wallColor: '#e9d8fd',
    centerLine: 'rgba(167,139,250,0.3)',
    scoreColor: '#c084fc',
    scoreFont: 'bold 48px "Georgia", serif',
    leftPaddle: '#93c5fd',
    rightPaddle: '#f9a8d4',
    paddleGlow: '',
    ballFill: (i) => ['#c4b5fd', '#93c5fd', '#86efac', '#fda4af', '#fcd34d'][i % 5],
    ballGlow: (i) => ['#c4b5fd', '#93c5fd', '#86efac', '#fda4af', '#fcd34d'][i % 5],
    ballShadowBlur: 8,
    obstacleFill: '#ddd6fe',
    obstacleStroke: '#a78bfa',
    overlayBg: 'rgba(253,244,255,0.92)',
    overlayText: '#7c3aed',
    overlayFont: 'bold 56px "Georgia", serif',
    scanlines: false,
  },
};

export const THEME_LIST: GameTheme[] = Object.values(THEMES);

export const DEFAULT_THEME_ID: ThemeId = 'default';
