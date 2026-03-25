'use client';

import { useGameStore } from '@/store/gameStore';
import { THEME_LIST, ThemeId } from '@/lib/game/themes';

export function ThemeSelector() {
  const themeId = useGameStore((s) => s.themeId);
  const setTheme = useGameStore((s) => s.setTheme);

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 text-center">
        Choose a theme
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {THEME_LIST.map((theme) => {
          const active = themeId === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id as ThemeId)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 text-center
                ${active
                  ? 'border-blue-500 bg-slate-800 shadow-lg shadow-blue-500/20 scale-[1.04]'
                  : 'border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800'
                }`}
            >
              {/* Mini preview swatch */}
              <div
                className="w-full h-10 rounded-lg flex items-center justify-center gap-1 overflow-hidden"
                style={{ background: theme.bg, border: `2px solid ${theme.wallColor}` }}
              >
                <div
                  className="w-2 h-6 rounded-sm"
                  style={{ background: theme.leftPaddle }}
                />
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: theme.ballFill(0) }}
                />
                <div
                  className="w-2 h-6 rounded-sm"
                  style={{ background: theme.rightPaddle }}
                />
              </div>
              <span className="text-lg">{theme.icon}</span>
              <span className={`text-xs font-semibold ${active ? 'text-white' : 'text-slate-300'}`}>
                {theme.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
