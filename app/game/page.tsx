'use client';

import { useGameStore } from '@/store/gameStore';
import { GameCanvas } from '@/components/game/GameCanvas';

export default function GamePage() {
  const config = useGameStore((s) => s.config);
  const themeId = useGameStore((s) => s.themeId);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0f' }}>
      <GameCanvas config={config} themeId={themeId} />
    </div>
  );
}
