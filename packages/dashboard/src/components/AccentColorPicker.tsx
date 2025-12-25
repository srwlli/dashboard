'use client';

import { useAccentColor, ACCENT_COLORS, type AccentColor } from '@/contexts/AccentColorContext';

/**
 * AccentColorPicker Component
 * Allows users to select accent color from 6 neon preset options
 * Updates CSS variables in real-time
 */
export function AccentColorPicker() {
  const { accentColor, setAccentColor } = useAccentColor();

  return (
    <div className="space-y-4">
      {/* Label */}
      <div>
        <label className="text-sm uppercase tracking-widest text-ind-text-muted font-mono mb-3 font-bold block">
          Accent Color
        </label>
        <p className="text-xs text-ind-text-muted mb-4">
          Choose a neon color for highlights and accents
        </p>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-6 gap-3">
        {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => (
          <button
            key={color}
            onClick={() => setAccentColor(color)}
            className={`
              relative w-full aspect-square rounded-lg border-2 transition-all cursor-pointer
              ${accentColor === color
                ? 'border-ind-accent ring-4 ring-offset-2'
                : 'border-ind-border hover:border-ind-text-muted'}
              active:translate-y-0.5 hover:scale-105
            `}
            style={{
              backgroundColor: ACCENT_COLORS[color].base,
              boxShadow: accentColor === color
                ? `0 0 20px ${ACCENT_COLORS[color].base}80`
                : 'none',
            }}
            title={color.charAt(0).toUpperCase() + color.slice(1)}
            aria-label={`${color.charAt(0).toUpperCase() + color.slice(1)} accent color`}
            aria-pressed={accentColor === color}
          >
            {/* Checkmark for selected color */}
            {accentColor === color && (
              <span className="absolute inset-0 flex items-center justify-center text-2xl text-white drop-shadow-lg">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Current selection display */}
      <div className="text-xs text-ind-text-muted font-mono pt-2">
        Current: <span className="text-ind-text capitalize font-bold">{accentColor}</span>
      </div>
    </div>
  );
}

export default AccentColorPicker;
