'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useThemeConfig } from '@/components/themes/active-theme';
import { cn } from '@/lib/utils';

export interface Plasma3DLogoProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
  motion?: 'autoRotate' | 'cursorFollow' | 'cursorOrbit';
}

interface ThemePalette {
  fillLightColor: string;
  rimColor: string;
  modelColor: string;
  manualMaterialColor: string;
  glowGradient: string;
}

const THEME_PALETTES: Record<string, ThemePalette> = {
  amanah: {
    fillLightColor: '#38bdf8', // Soft Sky Blue (Clinical Amanah)
    rimColor: '#60a5fa', // Soft Blue / Indigo
    modelColor: '#f0f8ff', // Alice Blue Soft Chrome
    manualMaterialColor: '#38bdf8',
    glowGradient: 'from-sky-400/30 via-blue-500/20 to-indigo-500/20'
  },
  supabase: {
    fillLightColor: '#3ecf8e',
    rimColor: '#22c55e',
    modelColor: '#f0fdf4',
    manualMaterialColor: '#3ecf8e',
    glowGradient: 'from-emerald-400/30 via-teal-500/20 to-green-500/20'
  },
  claude: {
    fillLightColor: '#d97706',
    rimColor: '#f97316',
    modelColor: '#fffbeb',
    manualMaterialColor: '#d97706',
    glowGradient: 'from-amber-400/30 via-orange-500/20 to-rose-500/20'
  },
  whatsapp: {
    fillLightColor: '#25d366',
    rimColor: '#128c7e',
    modelColor: '#f0fdf4',
    manualMaterialColor: '#25d366',
    glowGradient: 'from-green-400/30 via-emerald-500/20 to-teal-500/20'
  },
  'astro-vista': {
    fillLightColor: '#a855f7',
    rimColor: '#ec4899',
    modelColor: '#faf5ff',
    manualMaterialColor: '#a855f7',
    glowGradient: 'from-purple-400/30 via-pink-500/20 to-indigo-500/20'
  },
  'blue-ocean': {
    fillLightColor: '#38bdf8',
    rimColor: '#2563eb',
    modelColor: '#f0f9ff',
    manualMaterialColor: '#38bdf8',
    glowGradient: 'from-sky-400/35 via-blue-500/25 to-cyan-500/20'
  },
  vercel: {
    fillLightColor: '#71717a',
    rimColor: '#a1a1aa',
    modelColor: '#f4f4f5',
    manualMaterialColor: '#52525b',
    glowGradient: 'from-zinc-400/30 via-slate-500/20 to-neutral-600/20'
  },
  mono: {
    fillLightColor: '#64748b',
    rimColor: '#94a3b8',
    modelColor: '#f8fafc',
    manualMaterialColor: '#475569',
    glowGradient: 'from-slate-400/25 via-zinc-400/20 to-neutral-500/20'
  },
  neobrutualism: {
    fillLightColor: '#f59e0b',
    rimColor: '#f97316',
    modelColor: '#fffbeb',
    manualMaterialColor: '#ea580c',
    glowGradient: 'from-amber-400/35 via-yellow-400/25 to-orange-500/25'
  },
  notebook: {
    fillLightColor: '#0d9488',
    rimColor: '#059669',
    modelColor: '#f0fdfa',
    manualMaterialColor: '#0f766e',
    glowGradient: 'from-teal-400/30 via-emerald-400/20 to-cyan-500/20'
  },
  'light-green': {
    fillLightColor: '#22c55e',
    rimColor: '#84cc16',
    modelColor: '#f0fdf4',
    manualMaterialColor: '#16a34a',
    glowGradient: 'from-emerald-400/30 via-green-400/20 to-lime-400/20'
  },
  zen: {
    fillLightColor: '#16a34a',
    rimColor: '#15803d',
    modelColor: '#f0fdf4',
    manualMaterialColor: '#14532d',
    glowGradient: 'from-emerald-500/30 via-green-600/20 to-teal-600/20'
  },
  default: {
    fillLightColor: '#38bdf8',
    rimColor: '#60a5fa',
    modelColor: '#f0f8ff',
    manualMaterialColor: '#38bdf8',
    glowGradient: 'from-sky-400/30 via-blue-500/20 to-indigo-500/20'
  }
};

let isGlobalScriptInjected = false;

function ensureScriptLoaded(onLoad: () => void) {
  if (typeof window === 'undefined') return;

  if (customElements.get('plasma-scene')) {
    onLoad();
    return;
  }

  const existingScript = document.querySelector('script[src*="plasma-scene.runtime.js"]');
  if (existingScript) {
    existingScript.addEventListener('load', onLoad);
    if (customElements.get('plasma-scene')) {
      onLoad();
    }
    return;
  }

  if (!isGlobalScriptInjected) {
    isGlobalScriptInjected = true;
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/assets/plasma/plasma-scene.runtime.js';
    script.onload = onLoad;
    document.head.appendChild(script);

    // Pre-warm scene JSON in browser cache
    fetch('/assets/plasma/scene.json').catch(() => {});
  }
}

// Immediate eager pre-load on client initialization
if (typeof window !== 'undefined') {
  ensureScriptLoaded(() => {});
}

/**
 * Master UI Component: Plasma3DLogo
 * Pre-rendered 3D Holographic Chromium WebGL scene with synchronized presence & skeleton fallback.
 */
export function Plasma3DLogo({ size, width, height, className, motion }: Plasma3DLogoProps) {
  const [isScriptReady, setIsScriptReady] = useState(() => {
    return typeof window !== 'undefined' && Boolean(customElements.get('plasma-scene'));
  });
  const [isSceneReady, setIsSceneReady] = useState(false);
  const sceneRef = useRef<HTMLElement | null>(null);

  // Safely consume active theme with fallback
  let activeTheme = 'amanah';
  try {
    const themeContext = useThemeConfig();
    if (themeContext?.activeTheme) {
      activeTheme = themeContext.activeTheme;
    }
  } catch {
    activeTheme = 'amanah';
  }

  const palette = useMemo(() => {
    return THEME_PALETTES[activeTheme] || THEME_PALETTES.default;
  }, [activeTheme]);

  // Pre-load Web Component script
  useEffect(() => {
    ensureScriptLoaded(() => setIsScriptReady(true));
  }, []);

  // Monitor plasma-ready custom event and dataset.ready
  useEffect(() => {
    if (!isScriptReady) return;

    const el = sceneRef.current;
    if (!el) return;

    if (el.dataset && el.dataset.ready === 'true') {
      setIsSceneReady(true);
      return;
    }

    const handleReady = () => setIsSceneReady(true);
    el.addEventListener('plasma-ready', handleReady);

    // Guard fallback: ensures presence if scene is cached/immediate
    const timer = setTimeout(() => {
      setIsSceneReady(true);
    }, 250);

    return () => {
      el.removeEventListener('plasma-ready', handleReady);
      clearTimeout(timer);
    };
  }, [isScriptReady]);

  const w = width ?? size;
  const h = height ?? size;

  const styleObj: React.CSSProperties = {
    ...(w !== undefined ? { width: typeof w === 'number' ? `${w}px` : w } : {}),
    ...(h !== undefined ? { height: typeof h === 'number' ? `${h}px` : h } : {})
  };

  return (
    <div
      style={styleObj}
      className={cn(
        'relative flex items-center justify-center select-none shrink-0 pointer-events-auto overflow-visible',
        className
      )}
    >
      {/* Ambient Radial Bloom Glow that reflects the active theme colors */}
      <div
        className={cn(
          'absolute inset-[-15%] rounded-full blur-2xl pointer-events-none opacity-80 transition-colors duration-500 bg-gradient-to-tr',
          palette.glowGradient
        )}
      />

      {/* Pre-render Skeleton: Prevents empty flash / absence of logo */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none',
          isSceneReady ? 'opacity-0' : 'opacity-100'
        )}
      >
        <div
          className={cn(
            'size-full rounded-full animate-pulse bg-gradient-to-tr border border-white/10',
            palette.glowGradient
          )}
        />
        <div className='absolute size-[72%] rounded-full bg-radial from-white/25 via-primary/20 to-transparent border border-white/20 shadow-inner animate-pulse' />
        <div className='absolute size-[35%] rounded-full bg-white/30 blur-xs animate-ping [animation-duration:2.5s]' />
      </div>

      {/* 3D WebGL Canvas Component */}
      {isScriptReady &&
        React.createElement('plasma-scene', {
          ref: sceneRef,
          background: 'transparent',
          src: '/assets/plasma/scene.json',
          ...(motion ? { motion } : {}),
          style: {
            width: '100%',
            height: '100%',
            display: 'block',
            background: 'transparent',
            overflow: 'visible',
            opacity: isSceneReady ? 1 : 0,
            transition: 'opacity 0.3s ease-out'
          }
        })}
    </div>
  );
}
