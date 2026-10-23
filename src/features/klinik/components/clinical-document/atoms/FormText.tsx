import React from 'react';

export interface FormTextProps {
  children: React.ReactNode;
  size?: 'title' | 'subtitle' | 'section' | 'body' | 'small' | 'identity' | 'custom';
  customPt?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

export const FormText: React.FC<FormTextProps> = ({
  children,
  size = 'body',
  customPt,
  bold = false,
  italic = false,
  underline = false,
  align = 'left',
  className = '',
  style: propStyle,
}) => {
  const ptMap: Record<string, number> = {
    title: 10,
    subtitle: 10,
    section: 8.2,
    body: 7.3,
    small: 6.8,
    identity: 6.6,
  };

  const finalPt = customPt ?? (ptMap[size] || 7.3);

  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <span
      style={{
        fontSize: `${finalPt}pt`,
        lineHeight: 1.18,
        ...propStyle,
      }}
      className={`font-serif text-black ${bold ? 'font-bold' : 'font-normal'} ${
        italic ? 'italic' : ''
      } ${underline ? 'underline underline-offset-2' : ''} ${alignClass} ${className}`}
    >
      {children}
    </span>
  );
};
