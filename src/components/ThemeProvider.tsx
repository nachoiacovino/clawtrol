'use client';

import { useEffect } from 'react';
import { getThemePreset, type ThemeMode } from '@/lib/themes';

interface ThemeProviderProps {
  preset?: string;
  mode?: ThemeMode;
  accent?: string;
}

export default function ThemeProvider({ preset, mode = 'dark', accent }: ThemeProviderProps) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const selectedPreset = getThemePreset(preset);

    Object.entries(selectedPreset.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.style.setProperty('--font-display', selectedPreset.fonts.display === 'orbitron' ? 'var(--font-display)' : 'var(--font-inter)');
    root.style.setProperty('--font-data', selectedPreset.fonts.data === 'jetbrains' ? 'var(--font-jetbrains)' : 'var(--font-inter)');

    if (accent) {
      root.style.setProperty('--accent-cyan', accent);
    }

    body.classList.toggle('theme-glow', selectedPreset.isGlow);
    body.classList.toggle('theme-clean', !selectedPreset.isGlow);
    body.setAttribute('data-theme-preset', selectedPreset.id);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyMode = () => {
      const isDark = mode === 'dark' || (mode === 'system' && media.matches);
      root.classList.toggle('dark', isDark);
      root.classList.toggle('light', !isDark);
    };

    applyMode();
    media.addEventListener('change', applyMode);

    return () => {
      media.removeEventListener('change', applyMode);
    };
  }, [preset, mode, accent]);

  return null;
}
