import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  customPt?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  children: React.ReactNode;
}

export function FormText({
  customPt = 7.2,
  bold = false,
  italic = false,
  underline = false,
  align = 'left',
  className,
  children,
  style,
  ...props
}: FormTextProps) {
  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <span
      className={cn(
        'font-serif leading-tight text-black inline-block',
        bold && 'font-bold',
        italic && 'italic',
        underline && 'underline',
        alignClass,
        className
      )}
      style={{
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: `${customPt * 1.333}px`,
        ...style
      }}
      {...props}
    >
      {children}
    </span>
  );
}
