import { RuleDefinition, RuleId, GameConfig } from '@/types/game';

export const RULE_DEFINITIONS: RuleDefinition[] = [
  {
    id: 'multipleBalls',
    name: 'Multiple Balls',
    description: 'Add extra balls to the game',
    icon: '🔴',
    options: [
      {
        key: 'count',
        label: 'Ball Count',
        type: 'number',
        defaultValue: 2,
        min: 2,
        max: 5,
        step: 1,
      },
    ],
  },
  {
    id: 'obstacles',
    name: 'Obstacles',
    description: 'Add static obstacles in the playfield',
    icon: '🧱',
    options: [
      {
        key: 'count',
        label: 'Obstacle Count',
        type: 'number',
        defaultValue: 3,
        min: 1,
        max: 8,
        step: 1,
      },
    ],
  },
  {
    id: 'bonuses',
    name: 'Power-ups',
    description: 'Spawn bonus items with various effects',
    icon: '⭐',
  },
  {
    id: 'speedRamp',
    name: 'Speed Ramp',
    description: 'Ball speed increases over time',
    icon: '⚡',
    options: [
      {
        key: 'factor',
        label: 'Speed Factor',
        type: 'number',
        defaultValue: 1.2,
        min: 1.1,
        max: 2.0,
        step: 0.1,
      },
    ],
  },
  {
    id: 'shrinkingPaddle',
    name: 'Shrinking Paddle',
    description: 'Paddles shrink when you lose a point',
    icon: '📏',
  },
  {
    id: 'warpWalls',
    name: 'Warp Walls',
    description: 'Balls wrap from top to bottom',
    icon: '🌀',
  },
];

export function defaultGameConfig(): GameConfig {
  return {
    rules: RULE_DEFINITIONS.map((rule) => ({
      id: rule.id,
      enabled: false,
      options: rule.options
        ? Object.fromEntries(
            rule.options.map((opt) => [opt.key, opt.defaultValue])
          )
        : {},
    })),
  };
}
