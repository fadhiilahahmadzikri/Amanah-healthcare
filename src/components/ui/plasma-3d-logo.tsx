'use client';

import React, { useEffect, useState, useRef, useMemo, useId } from 'react';
import { useThemeConfig } from '@/components/themes/active-theme';
import { cn } from '@/lib/utils';

export interface Plasma3DLogoProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
  motion?: 'autoRotate' | 'cursorFollow' | 'cursorOrbit';
}

export interface ThemePalette {
  fillLightColor: string;
  rimColor: string;
  modelColor: string;
  manualMaterialColor: string;
  glowGradient: string;
}

export const THEME_PALETTES: Record<string, ThemePalette> = {
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

/**
 * Exact Gary Cat geometry exported from Plasma Studio scene.json
 * Features complete cat silhouette, pointed ears, whiskers, facial cutouts, and chest contour.
 */
export const GARY_CAT_SVG_PATH =
  'M 91.000,14.631 C 89.500,15.819 83.272,20.647 82.000,21.761 C 80.728,22.875 77.330,26.063 75.736,28.000 C 74.142,29.937 64.788,41.917 62.876,45.000 C 60.964,48.083 54.117,61.814 52.794,65.000 C 51.471,68.186 47.966,80.192 47.000,83.230 C 46.667,83.206 47.333,84.118 45.000,83.083 C 42.667,82.048 21.417,71.832 19.000,70.808 C 16.583,69.784 16.417,70.717 16.000,70.794 C 15.583,70.871 14.347,71.381 14.000,71.732 C 13.653,72.082 11.970,74.394 11.842,75.000 C 11.714,75.606 12.200,78.463 12.463,79.000 C 12.726,79.537 10.705,79.723 15.000,81.439 C 19.295,83.155 59.500,97.894 64.000,99.592 C 68.500,101.290 68.493,101.534 69.000,101.818 C 69.507,102.102 70.015,102.652 70.080,103.000 C 70.145,103.348 69.833,105.500 69.783,106.000 C 69.319,106.213 68.982,107.811 67.000,107.277 C 65.018,106.743 47.917,100.234 46.000,99.592 C 44.083,98.950 44.333,99.577 44.000,99.575 C 43.802,101.145 42.976,108.156 42.809,109.000 C 42.643,109.844 43.567,109.474 42.000,109.704 C 40.433,109.935 26.667,111.356 24.000,111.771 C 21.333,112.186 11.387,114.253 10.000,114.689 C 8.613,115.124 7.631,116.557 7.355,117.000 C 7.079,117.443 6.551,119.450 6.689,120.000 C 6.826,120.550 8.557,123.242 9.000,123.602 C 9.443,123.962 10.417,124.652 12.000,124.322 C 13.583,123.992 25.833,120.198 28.000,119.643 C 30.167,119.088 36.000,117.932 38.000,117.663 C 40.000,117.393 49.845,116.463 52.000,116.408 C 54.155,116.352 61.882,116.901 63.859,117.000 C 63.970,117.500 64.605,119.583 64.527,120.000 C 64.449,120.417 64.631,121.715 62.920,122.000 C 61.209,122.285 45.661,123.257 44.000,123.424 C 42.339,123.590 43.153,123.904 42.984,124.000 C 42.986,124.307 42.754,124.843 43.000,125.843 C 43.246,126.843 45.218,134.320 45.935,136.000 C 46.652,137.680 50.361,144.333 51.606,146.000 C 52.852,147.667 59.182,154.487 60.882,156.000 C 62.581,157.513 70.323,163.061 72.000,164.151 C 73.677,165.240 79.417,168.319 81.000,169.072 C 82.583,169.825 89.000,172.499 91.000,173.187 C 93.000,173.875 103.000,176.818 105.000,177.326 C 107.000,177.834 113.333,179.030 115.000,179.285 C 116.667,179.539 122.833,180.258 125.000,180.377 C 127.167,180.497 137.750,180.893 141.000,180.716 C 144.250,180.538 160.333,178.963 164.000,178.244 C 167.667,177.525 182.083,173.163 185.000,172.088 C 187.917,171.012 196.836,166.593 199.000,165.336 C 201.164,164.079 209.101,158.611 210.968,157.000 C 212.834,155.389 219.949,148.000 221.394,146.000 C 222.838,144.000 227.585,134.833 228.301,133.000 C 229.018,131.167 229.709,125.500 229.991,124.000 C 228.992,123.803 225.583,122.956 224.000,122.819 C 222.417,122.682 212.294,122.592 211.000,122.357 C 209.706,122.122 208.893,120.393 208.471,120.000 C 208.583,119.500 209.029,117.500 209.141,117.000 C 211.117,116.901 218.845,116.352 221.000,116.408 C 223.155,116.463 233.000,117.393 235.000,117.663 C 237.000,117.932 242.833,119.086 245.000,119.640 C 247.167,120.194 259.417,123.985 261.000,124.314 C 262.583,124.644 263.621,123.791 264.000,123.598 C 264.379,123.405 265.372,122.466 265.549,122.000 C 265.725,121.534 266.164,118.494 266.118,118.000 C 266.072,117.506 265.260,116.343 265.000,116.068 C 264.740,115.793 264.250,115.046 263.000,114.701 C 261.750,114.356 252.667,112.348 250.000,111.929 C 247.333,111.510 232.648,109.917 231.000,109.673 C 229.352,109.429 230.394,109.867 230.228,109.000 C 230.061,108.133 229.205,100.894 229.000,99.273 C 225.167,100.607 208.083,106.659 206.000,107.277 C 203.917,107.896 204.276,106.880 204.000,106.690 C 203.724,106.501 202.776,105.317 202.693,105.000 C 202.610,104.683 202.724,103.239 203.000,102.892 C 203.276,102.545 201.417,102.626 206.000,100.838 C 210.583,99.050 253.500,83.190 258.000,81.436 C 262.500,79.682 259.728,80.157 260.000,79.787 C 260.272,79.418 261.197,77.482 261.258,77.000 C 261.319,76.518 260.921,74.438 260.732,74.000 C 260.544,73.562 259.394,72.023 259.000,71.745 C 258.606,71.467 256.583,70.674 256.000,70.663 C 255.417,70.651 254.333,70.576 252.000,71.611 C 249.667,72.646 230.093,82.134 228.000,83.083 C 225.907,84.032 227.072,83.014 226.886,83.000 C 226.556,81.667 225.015,75.833 224.902,75.000 C 224.790,74.167 223.359,76.113 225.534,73.000 C 227.709,69.887 246.756,43.537 251.000,37.645 C 247.167,37.482 233.083,36.651 228.000,36.669 C 222.917,36.688 196.667,37.453 190.000,37.865 C 183.333,38.278 154.583,40.855 148.000,41.623 C 141.417,42.391 114.279,46.805 111.000,47.086 C 107.721,47.368 110.153,47.507 108.656,45.000 C 107.158,42.493 94.499,19.531 93.028,17.000 C 91.557,14.469 91.338,15.026 91.000,14.631 Z M 89.181,69.000 C 89.948,68.970 95.432,69.238 97.000,69.640 C 98.568,70.041 106.380,72.956 108.000,73.820 C 109.620,74.683 115.659,79.318 116.445,80.000 C 117.231,80.682 117.370,81.583 117.435,82.000 C 117.500,82.417 117.521,84.500 117.225,85.000 C 116.930,85.500 114.326,87.721 113.890,88.000 C 113.455,88.279 112.324,88.377 112.000,88.350 C 111.676,88.323 110.583,88.132 110.000,87.679 C 109.417,87.226 105.917,83.657 105.000,82.916 C 104.083,82.175 100.417,79.469 99.000,78.787 C 97.583,78.104 88.992,75.293 88.000,74.728 C 87.008,74.162 87.111,72.394 87.093,72.000 C 87.076,71.606 87.616,70.250 87.790,70.000 C 87.964,69.750 88.413,69.030 89.181,69.000 Z M 179.660,69.000 C 180.993,68.657 182.538,68.614 183.000,68.697 C 183.462,68.781 184.973,69.641 185.210,70.000 C 185.447,70.359 185.890,72.583 185.846,73.000 C 185.802,73.417 185.670,74.518 184.683,75.000 C 183.696,75.482 175.890,77.691 174.000,78.787 C 172.110,79.883 163.241,87.382 162.000,88.150 C 160.759,88.918 159.575,88.179 159.110,88.000 C 158.644,87.821 156.706,86.500 156.411,86.000 C 156.116,85.500 155.553,82.500 155.565,82.000 C 155.577,81.500 156.267,80.350 156.553,80.000 C 156.840,79.650 158.129,78.394 159.000,77.795 C 159.871,77.196 165.278,73.541 167.000,72.808 C 168.722,72.075 178.327,69.343 179.660,69.000 Z M 135.419,89.000 C 136.503,88.933 141.118,89.560 142.000,89.776 C 142.882,89.992 145.476,91.239 146.000,91.591 C 146.524,91.943 147.903,93.599 148.284,94.000 C 148.160,94.167 147.897,94.850 147.540,95.000 C 147.183,95.150 144.444,95.629 144.000,95.795 C 143.556,95.962 142.800,96.422 142.217,97.000 C 141.634,97.578 137.518,102.249 137.000,102.726 C 136.482,103.203 136.583,103.252 136.000,102.726 C 135.417,102.200 130.833,97.037 130.000,96.415 C 129.167,95.792 126.440,95.457 126.000,95.256 C 125.560,95.054 124.935,94.209 124.721,94.000 C 125.435,93.429 128.109,90.991 129.000,90.575 C 129.891,90.158 134.336,89.067 135.419,89.000 Z M 135.769,107.000 C 136.465,106.310 136.795,106.762 137.000,106.715 C 137.667,107.587 140.250,111.150 141.000,111.946 C 141.750,112.741 144.917,115.555 146.000,116.259 C 147.083,116.963 152.500,119.902 154.000,120.390 C 155.500,120.877 162.500,122.049 164.000,122.114 C 165.500,122.178 170.917,121.380 172.000,121.161 C 173.083,120.942 176.167,119.766 177.000,119.486 C 177.093,119.572 177.466,119.914 177.559,120.000 C 176.153,127.000 170.170,158.147 169.123,162.000 C 168.077,165.853 165.844,165.627 165.000,166.233 C 164.156,166.839 160.667,168.770 159.000,169.273 C 157.333,169.776 147.667,172.027 145.000,172.269 C 142.333,172.511 129.333,172.344 127.000,172.175 C 124.667,172.005 118.250,170.546 117.000,170.231 C 115.750,169.917 112.833,168.797 112.000,168.400 C 111.167,168.003 107.677,166.003 107.000,165.470 C 106.323,164.937 104.841,165.789 103.877,162.000 C 102.912,158.211 96.836,127.000 95.428,120.000 C 95.523,119.914 95.905,119.570 96.000,119.484 C 96.833,119.763 99.917,120.941 101.000,121.160 C 102.083,121.379 107.500,122.177 109.000,122.113 C 110.500,122.048 117.363,120.982 119.000,120.390 C 120.637,119.797 127.248,116.116 128.645,115.000 C 130.042,113.884 135.072,107.690 135.769,107.000 Z M 128.000,154.926 C 126.333,155.103 120.083,156.337 119.000,156.685 C 117.917,157.033 115.667,158.698 115.000,159.101 C 115.000,159.408 114.901,160.704 115.000,160.946 C 115.099,161.188 115.441,161.706 116.191,162.000 C 116.941,162.294 122.433,164.187 124.000,164.471 C 125.567,164.754 132.917,165.403 135.000,165.403 C 137.083,165.403 147.250,164.714 149.000,164.471 C 150.750,164.227 155.222,162.852 156.000,162.480 C 156.778,162.107 157.945,160.413 158.334,160.000 C 157.945,159.593 156.695,157.916 156.000,157.556 C 155.305,157.195 151.417,155.925 150.000,155.675 C 148.583,155.426 140.833,154.623 139.000,154.560 C 137.167,154.498 129.667,154.749 128.000,154.926 Z';

/**
 * High-fidelity 2D Gary Cat Vector
 * Adapts dynamically to current theme with metallic gradients, lighting highlights, and drop shadows.
 */
export function GaryCatIcon({
  className,
  palette,
  id = 'gary-cat'
}: {
  className?: string;
  palette: ThemePalette;
  id?: string;
}) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 274 191'
      className={cn('size-full select-none pointer-events-none drop-shadow-md', className)}
      aria-label='Gary 3D Cat Logo'
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1='15%' y1='0%' x2='85%' y2='100%'>
          <stop offset='0%' stopColor={palette.modelColor} />
          <stop offset='40%' stopColor={palette.fillLightColor} />
          <stop offset='100%' stopColor={palette.rimColor} />
        </linearGradient>
        <filter id={`${id}-glow`} x='-20%' y='-20%' width='140%' height='140%'>
          <feDropShadow
            dx='0'
            dy='2'
            stdDeviation='3.5'
            floodColor={palette.fillLightColor}
            floodOpacity='0.45'
          />
        </filter>
      </defs>
      <path
        fill={`url(#${id}-grad)`}
        filter={`url(#${id}-glow)`}
        fillRule='evenodd'
        d={GARY_CAT_SVG_PATH}
      />
    </svg>
  );
}

let isGlobalScriptInjected = false;

/**
 * Strict WebGL2 verification.
 * Attaches a temporary webglcontextcreationerror listener to prevent unhandled browser warnings.
 */
export function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    let errorOccurred = false;
    const onContextCreationError = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      errorOccurred = true;
    };
    canvas.addEventListener('webglcontextcreationerror', onContextCreationError, { once: true });

    // Three.js r184 in plasma-scene strictly requires webgl2:
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      powerPreference: 'high-performance'
    });

    canvas.removeEventListener('webglcontextcreationerror', onContextCreationError);
    return Boolean(gl && !errorOccurred);
  } catch {
    return false;
  }
}

function ensureScriptLoaded(onLoad: () => void) {
  if (typeof window === 'undefined') return;
  if (!isWebGLSupported()) return;

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

/**
 * Master UI Component: Plasma3DLogo
 * Pre-rendered 3D Holographic Chromium WebGL scene of Gary the Cat with synchronized presence & 2D fallback.
 */
export function Plasma3DLogo({ size, width, height, className, motion }: Plasma3DLogoProps) {
  const [hasWebGL, setHasWebGL] = useState(false);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const sceneRef = useRef<HTMLElement | null>(null);
  const uniqueId = useId().replace(/:/g, '-');

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

  // Safely verify WebGL on client mount before loading script
  useEffect(() => {
    const supported = isWebGLSupported();
    setHasWebGL(supported);
    if (supported) {
      ensureScriptLoaded(() => setIsScriptReady(true));
    }
  }, []);

  // Monitor plasma-ready custom event and dataset.ready / plasma-error
  useEffect(() => {
    if (!hasWebGL || !isScriptReady) return;

    const el = sceneRef.current;
    if (!el) return;

    if (el.dataset && el.dataset.ready === 'true') {
      setIsSceneReady(true);
      return;
    }

    const handleReady = () => setIsSceneReady(true);
    const handleError = () => {
      // If WebGL fails inside web component, revert to 2D cat gracefully
      setHasWebGL(false);
    };

    el.addEventListener('plasma-ready', handleReady);
    el.addEventListener('plasma-error', handleError);

    // Guard fallback: ensures presence if scene is cached/immediate
    const timer = setTimeout(() => {
      setIsSceneReady(true);
    }, 350);

    return () => {
      el.removeEventListener('plasma-ready', handleReady);
      el.removeEventListener('plasma-error', handleError);
      clearTimeout(timer);
    };
  }, [hasWebGL, isScriptReady]);

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
      {/* Ambient Radial Bloom Glow that reflects active theme colors */}
      <div
        className={cn(
          'absolute inset-[-15%] rounded-full blur-2xl pointer-events-none opacity-80 transition-colors duration-500 bg-gradient-to-tr',
          palette.glowGradient
        )}
      />

      {/* Pre-render Skeleton / Glow */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none',
          hasWebGL && isSceneReady ? 'opacity-0' : 'opacity-100'
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

      {/* 2D Gary Cat Vector Avatar: displayed as foundation and fallback whenever 3D is inactive or preparing */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center pointer-events-none p-1 transition-opacity duration-500 z-10',
          hasWebGL && isSceneReady ? 'opacity-0' : 'opacity-100'
        )}
      >
        <GaryCatIcon palette={palette} id={`gary-cat-${uniqueId}`} />
      </div>

      {/* 3D WebGL Canvas Component - Only render if WebGL2 is supported */}
      {hasWebGL &&
        isScriptReady &&
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
            transition: 'opacity 0.4s ease-out'
          }
        })}
    </div>
  );
}
