'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { GameConfig } from '@/types/game';
import { SCORE_BAR_HEIGHT } from '@/lib/game/constants';

interface GameCanvasProps {
  config: GameConfig;
  themeId?: string;
}

export function GameCanvas({ config, themeId }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<import('@/lib/game/GameEngine').GameEngine | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState<string>('playing');

  // Resize canvas to fill the window
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Start engine after canvas is sized
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let destroyed = false;

    // Wait one frame so the resize has applied
    const raf = requestAnimationFrame(() => {
      if (destroyed) return;
      import('@/lib/game/GameEngine').then(({ GameEngine }) => {
        if (destroyed || !canvas) return;
        const engine = new GameEngine(canvas, config, (state) => {
          setStatus(state.status);
          setIsPaused(state.status === 'paused');
        }, themeId);
        engineRef.current = engine;
        engine.start();
      });
    });

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      engineRef.current?.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
      />

      {/* HUD overlay — sits inside the score bar at the top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: SCORE_BAR_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          pointerEvents: 'none',
        }}
      >
        <Link
          href="/"
          style={{ pointerEvents: 'auto' }}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Menu
        </Link>

        <div className="text-slate-400 text-xs">
          {status === 'paused' && (
            <span className="text-yellow-400 font-semibold">PAUSED</span>
          )}
        </div>

        <button
          onClick={() => engineRef.current?.togglePause()}
          style={{ pointerEvents: 'auto' }}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>
    </div>
  );
}
