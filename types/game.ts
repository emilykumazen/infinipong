export type RuleId =
  | 'multipleBalls'
  | 'obstacles'
  | 'bonuses'
  | 'speedRamp'
  | 'shrinkingPaddle'
  | 'warpWalls';

export interface RuleOptionDef {
  key: string;
  label: string;
  type: 'number' | 'boolean';
  defaultValue: number | boolean;
  min?: number;
  max?: number;
  step?: number;
}

export interface RuleDefinition {
  id: RuleId;
  name: string;
  description: string;
  icon: string;
  options?: RuleOptionDef[];
}

export interface RuleConfig {
  id: RuleId;
  enabled: boolean;
  options: Record<string, number | boolean>;
}

export interface GameConfig {
  rules: RuleConfig[];
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export interface Score {
  left: number;
  right: number;
}

export interface GameState {
  status: GameStatus;
  score: Score;
  winner: 'left' | 'right' | null;
}
