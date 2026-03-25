'use client';

import { useGameStore } from '@/store/gameStore';
import { RULE_DEFINITIONS } from '@/lib/game/ruleRegistry';

export function RuleSelector() {
  const { config, toggleRule, setRuleOption } = useGameStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
      {RULE_DEFINITIONS.map((rule) => {
        const ruleConfig = config.rules.find((r) => r.id === rule.id)!;
        const isEnabled = ruleConfig.enabled;

        return (
          <div
            key={rule.id}
            className={`rounded-xl border p-4 transition-all duration-200 ${
              isEnabled
                ? 'bg-slate-800 border-slate-600 shadow-lg shadow-slate-900/50'
                : 'bg-slate-900 border-slate-800 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{rule.icon}</span>
                <div>
                  <div className="font-semibold text-white text-sm">{rule.name}</div>
                  <div className="text-xs text-slate-400">{rule.description}</div>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={() => toggleRule(rule.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isEnabled ? 'bg-blue-500' : 'bg-slate-600'
                }`}
                aria-label={`Toggle ${rule.name}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Options */}
            {isEnabled && rule.options && rule.options.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-slate-700 pt-3">
                {rule.options.map((opt) => {
                  const value = ruleConfig.options[opt.key] as number;
                  return (
                    <div key={opt.key} className="flex items-center gap-3">
                      <label className="text-xs text-slate-300 w-24 shrink-0">
                        {opt.label}
                      </label>
                      <input
                        type="range"
                        min={opt.min}
                        max={opt.max}
                        step={opt.step ?? 1}
                        value={value}
                        onChange={(e) =>
                          setRuleOption(rule.id, opt.key, parseFloat(e.target.value))
                        }
                        className="flex-1 accent-blue-400"
                      />
                      <span className="text-xs text-blue-300 w-8 text-right font-mono">
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
