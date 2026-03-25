'use client';

import { useRouter } from 'next/navigation';
import { RuleSelector } from '@/components/ui/RuleSelector';
import { ThemeSelector } from '@/components/ui/ThemeSelector';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-6xl font-black tracking-tight mb-2">
          <span className="text-blue-400">Infini</span>
          <span className="text-red-400">Pong</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Pong, but with rules. Lots of rules.
        </p>
      </div>

      {/* Theme Selector */}
      <div className="w-full max-w-3xl mb-8">
        <ThemeSelector />
      </div>

      {/* Rule Selector */}
      <div className="w-full max-w-3xl mb-10">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 text-center">
          Choose your rules
        </h2>
        <RuleSelector />
      </div>

      {/* Start button */}
      <button
        onClick={() => router.push('/game')}
        className="bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-bold text-xl px-12 py-4 rounded-2xl transition-colors shadow-lg shadow-blue-500/30"
      >
        Start Game
      </button>

      {/* Controls */}
      <p className="mt-8 text-slate-500 text-sm">
        W / S — Left paddle &nbsp;&nbsp;|&nbsp;&nbsp; ↑ ↓ — Right paddle &nbsp;&nbsp;|&nbsp;&nbsp; P — Pause
      </p>
    </main>
  );
}
