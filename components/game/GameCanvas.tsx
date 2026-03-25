'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { GameConfig } from '@/types/game';
import { useGameEngine } from '@/hooks/useGameEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/lib/game/constants';

interface GameCanvasProps {
  config: GameConfig;
  themeId?: string;
}

export function GameCanvas({ config, themeId }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, engineRef } = useGameEngine(canvasRef, config, themeId);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* HUD bar */}
      <div className="flex items-center justify-between w-full max-w-[900px] px-2">
        <Link
          href="/"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Menu
        </Link>
        <div className="text-slate-400 text-xs">
          {gameState.status === 'paused' && (
            <span className="text-yellow-400 font-semibold">PAUSED</span>
          )}
          {gameState.status === 'playing' && (
            <span>P — pause</span>
          )}
        </div>
        <button
          onClick={() => engineRef.current?.togglePause()}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          {gameState.status === 'paused' ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      {/* Canvas wrapper — scales down on narrow screens */}
      <div
        className="relative"
        style={{
          width: '100%',
          maxWidth: CANVAS_WIDTH,
        }}
      >
        <div
          style={{
            position: 'relative',
            paddingBottom: `${(CANVAS_HEIGHT / CANVAS_WIDTH) * 100}%`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '12px',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* Controls reminder */}
      <p className="text-slate-500 text-xs">
        W/S — Left paddle &nbsp;|&nbsp; ↑↓ — Right paddle &nbsp;|&nbsp; P — Pause
      </p>
    </div>
  );
}
