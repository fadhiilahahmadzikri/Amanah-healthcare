'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { TrayItem } from '../atoms/tray-item';
import type { SideTrayItem } from '../side-tray.types';

export interface TrayNavListProps<T extends string = string> {
  items: SideTrayItem<T>[];
  activeKey: T;
  onSelect: (key: T) => void;
  className?: string;
}

export function TrayNavList<T extends string = string>({
  items,
  activeKey,
  onSelect,
  className
}: TrayNavListProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Keyboard navigation support: ArrowUp / ArrowDown / Home / End
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const enabledItems = items.filter((item) => !item.disabled);
      if (enabledItems.length === 0) return;

      const currentIndex = enabledItems.findIndex((item) => item.key === activeKey);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < enabledItems.length - 1 ? currentIndex + 1 : 0;
        const nextKey = enabledItems[nextIndex]?.key;
        if (nextKey !== undefined) onSelect(nextKey);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : enabledItems.length - 1;
        const prevKey = enabledItems[prevIndex]?.key;
        if (prevKey !== undefined) onSelect(prevKey);
      } else if (e.key === 'Home') {
        e.preventDefault();
        const firstKey = enabledItems[0]?.key;
        if (firstKey !== undefined) onSelect(firstKey);
      } else if (e.key === 'End') {
        e.preventDefault();
        const lastKey = enabledItems[enabledItems.length - 1]?.key;
        if (lastKey !== undefined) onSelect(lastKey);
      }
    },
    [activeKey, items, onSelect]
  );

  return (
    <div
      ref={containerRef}
      role='tablist'
      aria-orientation='vertical'
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex-1 overflow-y-auto p-2.5 space-y-1.5 focus:outline-none scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent',
        className
      )}
    >
      {items.map((item) => (
        <TrayItem
          key={item.key}
          item={item}
          isActive={item.key === activeKey}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
