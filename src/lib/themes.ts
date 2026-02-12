export type ThemePresetId = 'nova' | 'midnight' | 'catppuccin' | 'solar';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemePreset {
  id: ThemePresetId;
  label: string;
  fonts: {
    display: 'orbitron' | 'inter';
    data: 'jetbrains' | 'inter';
  };
  isGlow: boolean;
  variables: Record<string, string>;
}

export const themePresets: Record<ThemePresetId, ThemePreset> = {
  nova: {
    id: 'nova',
    label: 'Nova',
    fonts: { display: 'orbitron', data: 'jetbrains' },
    isGlow: true,
    variables: {
      '--bg-primary': '#050508',
      '--bg-secondary': '#0a0a10',
      '--bg-card': '#0c0c14',
      '--bg-elevated': '#10101c',
      '--border-dim': 'rgba(0, 255, 200, 0.08)',
      '--border-accent': 'rgba(0, 255, 200, 0.2)',
      '--text-primary': '#e8eef4',
      '--text-secondary': '#9aa8b8',
      '--text-dim': '#5c6b7a',
      '--accent-cyan': '#00ffc8',
      '--accent-green': '#00ff6a',
      '--accent-red': '#ff3b5c',
      '--accent-yellow': '#ffd600',
      '--accent-purple': '#b44dff',
      '--accent-orange': '#ff8a00',
      '--glow-cyan': '0 0 20px rgba(0, 255, 200, 0.3)',
      '--glow-green': '0 0 20px rgba(0, 255, 106, 0.3)',
      '--glow-red': '0 0 20px rgba(255, 59, 92, 0.3)',
    },
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight',
    fonts: { display: 'inter', data: 'inter' },
    isGlow: false,
    variables: {
      '--bg-primary': '#0f172a',
      '--bg-secondary': '#1e293b',
      '--bg-card': '#1e293b',
      '--bg-elevated': '#334155',
      '--border-dim': 'rgba(148, 163, 184, 0.18)',
      '--border-accent': 'rgba(59, 130, 246, 0.32)',
      '--text-primary': '#e2e8f0',
      '--text-secondary': '#cbd5e1',
      '--text-dim': '#94a3b8',
      '--accent-cyan': '#3b82f6',
      '--accent-green': '#22c55e',
      '--accent-red': '#ef4444',
      '--accent-yellow': '#f59e0b',
      '--accent-purple': '#818cf8',
      '--accent-orange': '#fb923c',
      '--glow-cyan': 'none',
      '--glow-green': 'none',
      '--glow-red': 'none',
    },
  },
  catppuccin: {
    id: 'catppuccin',
    label: 'Catppuccin',
    fonts: { display: 'inter', data: 'inter' },
    isGlow: false,
    variables: {
      '--bg-primary': '#1e1e2e',
      '--bg-secondary': '#181825',
      '--bg-card': '#313244',
      '--bg-elevated': '#45475a',
      '--border-dim': '#45475a',
      '--border-accent': '#585b70',
      '--text-primary': '#cdd6f4',
      '--text-secondary': '#a6adc8',
      '--text-dim': '#7f849c',
      '--accent-cyan': '#89dceb',
      '--accent-green': '#a6e3a1',
      '--accent-red': '#f38ba8',
      '--accent-yellow': '#f9e2af',
      '--accent-purple': '#cba6f7',
      '--accent-orange': '#fab387',
      '--glow-cyan': 'none',
      '--glow-green': 'none',
      '--glow-red': 'none',
    },
  },
  solar: {
    id: 'solar',
    label: 'Solar',
    fonts: { display: 'inter', data: 'inter' },
    isGlow: false,
    variables: {
      '--bg-primary': '#fdf6e3',
      '--bg-secondary': '#eee8d5',
      '--bg-card': '#ffffff',
      '--bg-elevated': '#f7f0df',
      '--border-dim': 'rgba(88, 110, 117, 0.2)',
      '--border-accent': 'rgba(38, 139, 210, 0.35)',
      '--text-primary': '#073642',
      '--text-secondary': '#586e75',
      '--text-dim': '#93a1a1',
      '--accent-cyan': '#268bd2',
      '--accent-green': '#859900',
      '--accent-red': '#dc322f',
      '--accent-yellow': '#b58900',
      '--accent-purple': '#6c71c4',
      '--accent-orange': '#cb4b16',
      '--glow-cyan': 'none',
      '--glow-green': 'none',
      '--glow-red': 'none',
    },
  },
};

export const DEFAULT_THEME_PRESET: ThemePresetId = 'nova';

export function getThemePreset(preset?: string): ThemePreset {
  if (!preset) return themePresets[DEFAULT_THEME_PRESET];
  return themePresets[preset as ThemePresetId] ?? themePresets[DEFAULT_THEME_PRESET];
}
