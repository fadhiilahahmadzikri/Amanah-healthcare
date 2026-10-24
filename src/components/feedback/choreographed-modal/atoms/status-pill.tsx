'use client';

import React from 'react';

export interface StatusPillAtomProps {
  text: string;
  className?: string;
}

/**
 * Atom: StatusPillAtom
 * Dynamic status capsule honoring active theme variables without hardcoding.
 */
export function StatusPillAtom({ text, className }: StatusPillAtomProps) {
  return (
    <span
      style={{
        backgroundColor: 'var(--theme-pill-bg, var(--primary-subtle))',
        color: 'var(--theme-pill-text, var(--primary))',
        borderColor: 'var(--theme-pill-border, transparent)'
      }}
      className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold tracking-wide border shadow-2xs ${className || ''}`}
    >
      {text}
    </span>
  );
}
