import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { createElement } from 'react';
import { cn } from '@/features/public-site/lib/helpers';

type HealthcareHeadingElement = 'h1' | 'h2' | 'h3' | 'h4';
type HealthcareHeadingSize = 'hero' | 'display' | 'section' | 'subsection' | 'card' | 'compact';
type HealthcareTextElement = 'address' | 'blockquote' | 'div' | 'p' | 'span';
type HealthcareTextSize = 'lead' | 'body' | 'small' | 'caption';
type HealthcareEyebrowElement = 'p' | 'span';

type HealthcareHeadingProps = {
  as?: HealthcareHeadingElement;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLHeadingElement>;
  size?: HealthcareHeadingSize;
} & HTMLAttributes<HTMLHeadingElement>;

type HealthcareTextProps = {
  as?: HealthcareTextElement;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
  size?: HealthcareTextSize;
} & HTMLAttributes<HTMLElement>;

type HealthcareEyebrowProps = {
  as?: HealthcareEyebrowElement;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
} & HTMLAttributes<HTMLElement>;

const headingSizeClassNames = {
  card: 'amanah-type-card-title',
  compact: 'amanah-type-compact-title',
  display: 'amanah-type-display',
  hero: 'amanah-type-hero',
  section: 'amanah-type-section',
  subsection: 'amanah-type-subsection'
} satisfies Record<HealthcareHeadingSize, string>;

const textSizeClassNames = {
  body: 'amanah-type-body',
  caption: 'amanah-type-caption',
  lead: 'amanah-type-lead',
  small: 'amanah-type-small'
} satisfies Record<HealthcareTextSize, string>;

export function HealthcareHeading({
  as = 'h2',
  children,
  className,
  ref,
  size = 'section',
  ...props
}: HealthcareHeadingProps) {
  return createElement(
    as,
    {
      ...props,
      className: cn(headingSizeClassNames[size], className),
      ref
    },
    children
  );
}

export function HealthcareText({
  as = 'p',
  children,
  className,
  ref,
  size = 'body',
  ...props
}: HealthcareTextProps) {
  return createElement(
    as,
    {
      ...props,
      className: cn(textSizeClassNames[size], className),
      ref
    },
    children
  );
}

export function HealthcareEyebrow({
  as = 'p',
  children,
  className,
  ref,
  ...props
}: HealthcareEyebrowProps) {
  return createElement(
    as,
    {
      ...props,
      className: cn('amanah-type-eyebrow', className),
      ref
    },
    children
  );
}
