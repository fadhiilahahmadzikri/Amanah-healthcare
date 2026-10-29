import React from 'react';
import { icons, Clock, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Check if string contains emoji characters
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

export function resolveLucideIcon(iconName: string): LucideIcon | null {
  const clean = iconName.replace(/^lucide:/i, '').trim();
  const iconsDict = icons as Record<string, LucideIcon>;

  // 1. Direct match (e.g. "SunMedium", "Stethoscope")
  if (iconsDict[clean]) {
    return iconsDict[clean];
  }

  // 2. PascalCase conversion (e.g. "sun-medium" -> "SunMedium", "stethoscope" -> "Stethoscope")
  const pascal = clean
    .split(/[-_ ]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  if (iconsDict[pascal]) {
    return iconsDict[pascal];
  }

  // 3. Case-insensitive search across keys
  const lower = clean.toLowerCase();
  const foundKey = Object.keys(icons).find((k) => k.toLowerCase() === lower);
  if (foundKey && iconsDict[foundKey]) {
    return iconsDict[foundKey];
  }

  return null;
}

export interface ShiftIconDisplayProps {
  icon?: string | null;
  fallback?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ShiftIconDisplay({
  icon,
  fallback,
  className = '',
  size = 'md'
}: ShiftIconDisplayProps) {
  const sizeClasses = {
    sm: 'size-6 text-xs',
    md: 'size-8 text-sm',
    lg: 'size-10 text-base'
  }[size];

  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 20
  }[size];

  const cleanIcon = icon?.trim();

  // 1. If it's an emoji: render directly
  if (cleanIcon && EMOJI_REGEX.test(cleanIcon)) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-lg bg-primary/10 select-none shadow-2xs transition-transform shrink-0',
          sizeClasses,
          className
        )}
        aria-hidden='true'
      >
        <span className='leading-none text-sm sm:text-base'>{cleanIcon}</span>
      </div>
    );
  }

  // 2. If it's a Lucide icon identifier (or prefix lucide:):
  if (cleanIcon) {
    const LucideComponent = resolveLucideIcon(cleanIcon);
    if (LucideComponent) {
      return (
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary select-none shadow-2xs transition-transform shrink-0',
            sizeClasses,
            className
          )}
          aria-hidden='true'
        >
          <LucideComponent size={iconSizes} />
        </div>
      );
    }
  }

  // 3. Fallback: codePrefix badge or default Clock icon
  if (fallback && fallback.trim()) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary font-bold tracking-wider select-none shadow-2xs transition-transform shrink-0',
          sizeClasses,
          className
        )}
        aria-hidden='true'
      >
        <span className='leading-none text-[10px] font-mono'>{fallback.trim().toUpperCase()}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary select-none shadow-2xs transition-transform shrink-0',
        sizeClasses,
        className
      )}
      aria-hidden='true'
    >
      <Clock size={iconSizes} />
    </div>
  );
}
