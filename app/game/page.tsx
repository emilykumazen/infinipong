'use client';

import { useGameStore } from '@/store/gameStore';
import { GameCanvas } from '@/components/game/GameCanvas';

export default function GamePage() {
  const config = useGameStore((s) => s.config);

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-8">
      <GameCanvas config={config} />
    </main>
  );
}
