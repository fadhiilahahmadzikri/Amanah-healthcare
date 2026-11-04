import * as React from 'react';
import { cn } from '@/lib/utils';
import { FormText } from './form-typography';

export interface DottedFieldLineProps {
  label?: string;
  value?: string | null;
  placeholder?: string;
  customPt?: number;
  boldValue?: boolean;
  boldLabel?: boolean;
  minHeight?: string;
  className?: string;
}

export function DottedFieldLine({
  label,
  value,
  placeholder,
  customPt = 7.2,
  boldValue = false,
  boldLabel = false,
  minHeight = '18px',
  className
}: DottedFieldLineProps) {
  const displayValue = value?.trim() || placeholder || '';

  return (
    <div
      className={cn('flex items-baseline w-full overflow-hidden', className)}
      style={{ minHeight }}
    >
      {label ? (
        <span className='shrink-0 mr-1.5'>
          <FormText customPt={customPt} bold={boldLabel}>
            {label}
          </FormText>
        </span>
      ) : null}

      <div className='flex-1 border-b border-dotted border-neutral-400 pb-[1px] min-w-0'>
        {displayValue ? (
          <FormText
            customPt={customPt}
            bold={boldValue}
            className={cn('truncate block', !value && 'text-neutral-400 italic')}
          >
            {displayValue}
          </FormText>
        ) : (
          <span className='block h-[10px]' />
        )}
      </div>
    </div>
  );
}
