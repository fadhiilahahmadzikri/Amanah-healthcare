'use client';

import * as React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { BlurryChar } from '../atoms/blurry-char.atom';
import { TypingCursor } from '../atoms/typing-cursor.atom';
import { cn } from '@/lib/utils';

export interface BlurryTypingTextProps {
  text: string;
  onCycleEnd: () => void;
  className?: string;
  charClassName?: string;
}

export function BlurryTypingText({
  text,
  onCycleEnd,
  className,
  charClassName
}: BlurryTypingTextProps) {
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const charRefs = React.useRef<(HTMLSpanElement | null)[]>([]);

  // Split text into characters
  const characters = React.useMemo(() => text.split(''), [text]);

  // Reset refs when text changes
  charRefs.current = [];

  useGSAP(
    () => {
      const elements = charRefs.current.filter((el): el is HTMLSpanElement => Boolean(el));
      if (elements.length === 0) return;

      // 1. Initial State: Blurry & hidden
      gsap.set(elements, {
        opacity: 0,
        filter: 'blur(8px)',
        y: 6
      });

      const tl = gsap.timeline({
        onComplete: () => {
          onCycleEnd();
        }
      });

      // 2. Typing In with Staggered Blur-to-Sharp
      tl.to(elements, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        stagger: 0.045,
        duration: 0.35,
        ease: 'power2.out'
      })
        // 3. Hold phase for readability (~2.2s)
        .to({}, { duration: 2.2 })
        // 4. Smooth dissolve out with subtle blur
        .to(elements, {
          opacity: 0,
          filter: 'blur(6px)',
          y: -4,
          stagger: 0.018,
          duration: 0.22,
          ease: 'power2.in'
        });

      return () => {
        tl.kill();
      };
    },
    { dependencies: [text], scope: containerRef }
  );

  return (
    <span ref={containerRef} className={cn('inline-flex items-center flex-wrap', className)}>
      {characters.map((char, index) => (
        <BlurryChar
          key={`${text}-${index}-${char}`}
          ref={(el) => {
            charRefs.current[index] = el;
          }}
          char={char}
          className={charClassName}
        />
      ))}
      <TypingCursor />
    </span>
  );
}
