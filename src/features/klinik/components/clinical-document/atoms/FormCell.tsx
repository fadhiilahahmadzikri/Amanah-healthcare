import React from 'react';

export interface FormCellProps {
  children?: React.ReactNode;
  widthPercent?: number;
  widthPx?: string;
  colSpan?: number;
  rowSpan?: number;
  borderTop?: boolean | 'dashed' | 'double';
  borderBottom?: boolean | 'dashed' | 'double' | 'thick';
  borderLeft?: boolean | 'dashed' | 'double';
  borderRight?: boolean | 'dashed' | 'double';
  borders?: 'all' | 'none' | 'box' | 'custom';
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  className?: string;
  style?: React.CSSProperties;
  padding?: string;
}

export const FormCell: React.FC<FormCellProps> = ({
  children,
  widthPercent,
  widthPx,
  colSpan,
  rowSpan,
  borderTop = true,
  borderBottom = true,
  borderLeft = true,
  borderRight = true,
  borders = 'custom',
  align = 'left',
  verticalAlign = 'middle',
  className = '',
  style: propStyle,
  padding = 'px-[2px] py-[1px]',
}) => {
  const getBorderStyle = (b: boolean | 'dashed' | 'double' | 'thick' | undefined) => {
    if (!b) return 'border-none';
    if (b === 'dashed') return 'border-dashed border-[#777777]';
    if (b === 'double') return 'border-double border-black border-b-[3px]';
    if (b === 'thick') return 'border-solid border-black border-b-[2px]';
    return 'border-solid border-black border-[0.75px]';
  };

  let borderClasses = '';
  if (borders === 'all') {
    borderClasses = 'border border-black';
  } else if (borders === 'none') {
    borderClasses = 'border-none';
  } else {
    const t = borderTop ? `border-t ${getBorderStyle(borderTop)}` : 'border-t-0';
    const b = borderBottom ? `border-b ${getBorderStyle(borderBottom)}` : 'border-b-0';
    const l = borderLeft ? `border-l ${getBorderStyle(borderLeft)}` : 'border-l-0';
    const r = borderRight ? `border-r ${getBorderStyle(borderRight)}` : 'border-r-0';
    borderClasses = `${t} ${b} ${l} ${r}`;
  }

  const vAlignClass =
    verticalAlign === 'top'
      ? 'align-top'
      : verticalAlign === 'bottom'
        ? 'align-bottom'
        : 'align-middle';

  const hAlignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  const style: React.CSSProperties = {
    ...(widthPercent !== undefined ? { width: `${widthPercent}%` } : {}),
    ...(widthPx !== undefined ? { width: widthPx } : {}),
    ...propStyle,
  };

  return (
    <td
      colSpan={colSpan}
      rowSpan={rowSpan}
      style={style}
      className={`border-collapse ${borderClasses} ${padding} ${vAlignClass} ${hAlignClass} ${className}`}
    >
      {children}
    </td>
  );
};
