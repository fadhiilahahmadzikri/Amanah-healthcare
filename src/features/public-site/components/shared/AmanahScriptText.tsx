import type { ReactNode } from 'react';
import { cn } from '@/features/public-site/lib/helpers';

type AmanahScriptTextMask = 'line' | 'text';
type AmanahScriptTextElement = 'p' | 'span';
type AmanahScriptTextSize = 'accent' | 'hero' | 'inherit';

type AmanahScriptTextProps = {
  as?: AmanahScriptTextElement;
  children: ReactNode;
  className?: string;
  mask?: AmanahScriptTextMask;
  size?: AmanahScriptTextSize;
};

const scriptSizeClassNames = {
  accent: 'amanah-type-script-accent',
  hero: 'amanah-type-script-hero',
  inherit: ''
} satisfies Record<AmanahScriptTextSize, string>;

function getMaskAttributes(mask: AmanahScriptTextMask | undefined) {
  if (mask === 'line') {
    return { 'data-mask-line': true };
  }

  if (mask === 'text') {
    return { 'data-mask-text': true };
  }

  return {};
}

export function AmanahScriptText({
  as = 'span',
  children,
  className,
  mask,
  size = 'accent'
}: AmanahScriptTextProps) {
  const Component = as;
  const scriptClassName = cn(
    'font-amanah-script font-caveat',
    scriptSizeClassNames[size],
    mask !== undefined && 'will-change-transform',
    className,
    'inline-flex w-fit max-w-full overflow-visible leading-tight'
  );
  const maskAttributes = getMaskAttributes(mask);

  return (
    <Component {...maskAttributes} className={scriptClassName}>
      {children}
    </Component>
  );
}
