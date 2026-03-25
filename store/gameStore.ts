import { create } from 'zustand';
import { GameConfig, GameState, RuleId } from '@/types/game';
import { defaultGameConfig } from '@/lib/game/ruleRegistry';
import { ThemeId, DEFAULT_THEME_ID } from '@/lib/game/themes';

interface GameStore {
  config: GameConfig;
  themeId: ThemeId;
  gameState: GameState;
  setConfig: (config: GameConfig) => void;
  setTheme: (id: ThemeId) => void;
  updateGameState: (state: GameState) => void;
  toggleRule: (id: RuleId) => void;
  setRuleOption: (id: RuleId, key: string, value: number | boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  config: defaultGameConfig(),
  themeId: DEFAULT_THEME_ID,
  gameState: { status: 'idle', score: { left: 0, right: 0 }, winner: null },

  setConfig: (config) => set({ config }),
  setTheme: (themeId) => set({ themeId }),

  updateGameState: (gameState) => set({ gameState }),

  toggleRule: (id) =>
    set((state) => ({
      config: {
        ...state.config,
        rules: state.config.rules.map((r) =>
          r.id === id ? { ...r, enabled: !r.enabled } : r
        ),
      },
    })),

  setRuleOption: (id, key, value) =>
    set((state) => ({
      config: {
        ...state.config,
        rules: state.config.rules.map((r) =>
          r.id === id
            ? { ...r, options: { ...r.options, [key]: value } }
            : r
        ),
      },
    })),
}));
