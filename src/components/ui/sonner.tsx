'use client';

import React from 'react';
import { StaggeredToaster, type StaggeredToasterProps } from './toaster';
import { toast as sonnerToast } from 'sonner';

export type ToasterProps = StaggeredToasterProps;

/**
 * Universal Toaster Component
 * Mounted globally in src/app/layout.tsx.
 * Renders the Staggered Layered Toaster with OKLCH theming, responsive top-right (desktop)
 * and top-center fluid (mobile) positioning, and GSAP animations.
 */
export const Toaster: React.FC<ToasterProps> = (props) => {
  return <StaggeredToaster {...props} />;
};

export const toast = sonnerToast;
export { StaggeredToaster };
