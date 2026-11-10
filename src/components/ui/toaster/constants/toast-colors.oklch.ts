import type { ToastColorTokens, ToastType } from '../types';

/**
 * OKLCH Color Tokens for Staggered Toaster
 * Handcrafted perceptually uniform OKLCH palettes for Light & Dark themes.
 * Agnostic, high contrast, WCAG compliant.
 */

export const TOAST_OKLCH_LIGHT: Record<ToastType, ToastColorTokens> = {
  success: {
    layer1: 'oklch(0.65 0.22 142)', // Vibrant lime/emerald peek
    layer2: 'oklch(0.80 0.16 142)', // Medium pastel step
    panelBg: 'oklch(0.965 0.045 142)', // Soft crisp mint panel
    panelBorder: 'oklch(0.84 0.09 142)',
    textColor: 'oklch(0.15 0.08 142)', // Deep forest green text (high contrast WCAG AAA)
    descriptionColor: 'oklch(0.28 0.07 142)',
    iconColor: 'oklch(0.42 0.18 142)'
  },
  error: {
    layer1: 'oklch(0.55 0.22 28)', // Crimson red peek
    layer2: 'oklch(0.72 0.17 28)', // Coral tint step
    panelBg: 'oklch(0.965 0.04 28)', // Soft rose panel
    panelBorder: 'oklch(0.86 0.08 28)',
    textColor: 'oklch(0.18 0.08 28)', // Deep maroon text
    descriptionColor: 'oklch(0.32 0.07 28)',
    iconColor: 'oklch(0.48 0.20 28)'
  },
  info: {
    layer1: 'oklch(0.55 0.20 255)', // Vibrant royal blue peek
    layer2: 'oklch(0.74 0.15 255)', // Sky blue step
    panelBg: 'oklch(0.965 0.04 255)', // Ice blue panel
    panelBorder: 'oklch(0.86 0.07 255)',
    textColor: 'oklch(0.16 0.08 255)', // Deep midnight navy text
    descriptionColor: 'oklch(0.30 0.07 255)',
    iconColor: 'oklch(0.46 0.18 255)'
  },
  warning: {
    layer1: 'oklch(0.68 0.18 65)', // Amber peek
    layer2: 'oklch(0.82 0.14 75)', // Golden tint step
    panelBg: 'oklch(0.97 0.05 80)', // Warm pastel amber panel
    panelBorder: 'oklch(0.86 0.08 75)',
    textColor: 'oklch(0.18 0.08 65)', // Deep espresso amber text
    descriptionColor: 'oklch(0.32 0.07 65)',
    iconColor: 'oklch(0.48 0.18 65)'
  },
  loading: {
    layer1: 'oklch(0.55 0.04 260)',
    layer2: 'oklch(0.75 0.02 260)',
    panelBg: 'oklch(0.97 0.01 260)',
    panelBorder: 'oklch(0.86 0.02 260)',
    textColor: 'oklch(0.16 0.02 260)',
    descriptionColor: 'oklch(0.32 0.02 260)',
    iconColor: 'oklch(0.42 0.04 260)'
  },
  default: {
    layer1: 'oklch(0.55 0.04 260)',
    layer2: 'oklch(0.75 0.02 260)',
    panelBg: 'oklch(0.97 0.01 260)',
    panelBorder: 'oklch(0.86 0.02 260)',
    textColor: 'oklch(0.16 0.02 260)',
    descriptionColor: 'oklch(0.32 0.02 260)',
    iconColor: 'oklch(0.42 0.04 260)'
  }
};

export const TOAST_OKLCH_DARK: Record<ToastType, ToastColorTokens> = {
  success: {
    layer1: 'oklch(0.32 0.12 142)', // Deep emerald accent peek
    layer2: 'oklch(0.48 0.16 142)', // Vibrant green step
    panelBg: 'oklch(0.17 0.035 142)', // Sleek dark emerald dashboard panel
    panelBorder: 'oklch(0.30 0.06 142)',
    textColor: 'oklch(0.97 0.03 142)', // Crisp, luminous, high-contrast light emerald text
    descriptionColor: 'oklch(0.85 0.04 142)',
    iconColor: 'oklch(0.78 0.16 142)'
  },
  error: {
    layer1: 'oklch(0.35 0.14 28)',
    layer2: 'oklch(0.52 0.18 28)',
    panelBg: 'oklch(0.17 0.04 28)', // Dark crimson slate panel
    panelBorder: 'oklch(0.32 0.08 28)',
    textColor: 'oklch(0.97 0.03 28)',
    descriptionColor: 'oklch(0.85 0.04 28)',
    iconColor: 'oklch(0.78 0.18 28)'
  },
  info: {
    layer1: 'oklch(0.35 0.12 255)',
    layer2: 'oklch(0.52 0.16 255)',
    panelBg: 'oklch(0.17 0.04 255)', // Midnight blue slate panel
    panelBorder: 'oklch(0.30 0.07 255)',
    textColor: 'oklch(0.97 0.03 255)',
    descriptionColor: 'oklch(0.85 0.04 255)',
    iconColor: 'oklch(0.78 0.16 255)'
  },
  warning: {
    layer1: 'oklch(0.38 0.12 65)',
    layer2: 'oklch(0.56 0.16 75)',
    panelBg: 'oklch(0.18 0.04 70)', // Dark bronze/amber slate panel
    panelBorder: 'oklch(0.34 0.07 70)',
    textColor: 'oklch(0.97 0.03 75)',
    descriptionColor: 'oklch(0.85 0.04 75)',
    iconColor: 'oklch(0.80 0.16 75)'
  },
  loading: {
    layer1: 'oklch(0.28 0.03 260)',
    layer2: 'oklch(0.44 0.04 260)',
    panelBg: 'oklch(0.16 0.02 260)',
    panelBorder: 'oklch(0.28 0.03 260)',
    textColor: 'oklch(0.97 0.01 260)',
    descriptionColor: 'oklch(0.82 0.02 260)',
    iconColor: 'oklch(0.74 0.04 260)'
  },
  default: {
    layer1: 'oklch(0.28 0.03 260)',
    layer2: 'oklch(0.44 0.04 260)',
    panelBg: 'oklch(0.16 0.02 260)',
    panelBorder: 'oklch(0.28 0.03 260)',
    textColor: 'oklch(0.97 0.01 260)',
    descriptionColor: 'oklch(0.82 0.02 260)',
    iconColor: 'oklch(0.74 0.04 260)'
  }
};

export function getToastColors(type: ToastType = 'default', isDark = false): ToastColorTokens {
  const palette = isDark ? TOAST_OKLCH_DARK : TOAST_OKLCH_LIGHT;
  return palette[type] || palette.default;
}
