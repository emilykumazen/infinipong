'use client';

import { useEffect, useRef, useState, RefObject } from 'react';
import { GameConfig, GameState } from '@/types/game';

export function useGameEngine(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  config: GameConfig
) {
  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    score: { left: 0, right: 0 },
    winner: null,
  });
  const engineRef = useRef<import('@/lib/game/GameEngine').GameEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    let destroyed = false;

    import('@/lib/game/GameEngine').then(({ GameEngine }) => {
      if (destroyed || !canvas) return;
      const engine = new GameEngine(canvas, config, (state) => {
        setGameState(state);
      });
      engineRef.current = engine;
      engine.start();
    });

    return () => {
      destroyed = true;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  return { gameState, engineRef };
}
