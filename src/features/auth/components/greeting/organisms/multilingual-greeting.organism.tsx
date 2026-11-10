'use client';

import * as React from 'react';
import { GREETINGS_CONFIG, type GreetingItem } from '../greeting-languages.config';
import { BlurryTypingText } from '../molecules/blurry-typing-text.molecule';
import { cn } from '@/lib/utils';

export interface MultilingualGreetingProps {
  greetings?: readonly GreetingItem[];
  className?: string;
  charClassName?: string;
}

export function MultilingualGreeting({
  greetings = GREETINGS_CONFIG,
  className,
  charClassName
}: MultilingualGreetingProps) {
  const [index, setIndex] = React.useState(0);

  const currentItem = greetings[index] || greetings[0];

  const handleCycleEnd = React.useCallback(() => {
    setIndex((prev) => (prev + 1) % greetings.length);
  }, [greetings.length]);

  return (
    <span
      className={cn('inline-flex items-center', className)}
      aria-label={currentItem.text}
      role='heading'
      aria-level={2}
    >
      <BlurryTypingText
        key={currentItem.id}
        text={currentItem.text}
        onCycleEnd={handleCycleEnd}
        charClassName={charClassName}
      />
    </span>
  );
}
