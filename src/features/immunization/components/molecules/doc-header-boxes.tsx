import * as React from 'react';
import { FormText } from '../atoms/form-typography';

export interface DocHeaderBoxesProps {
  topCode?: string;
  recordDigits?: (string | undefined)[];
}

export function DocHeaderBoxes({
  topCode = 'RM-01',
  recordDigits = []
}: DocHeaderBoxesProps) {
  // Always exactly 10 digit boxes
  const digits = Array.from({ length: 10 }, (_, i) => recordDigits[i] || '');

  return (
    <div className='flex flex-col items-end gap-1.5'>
      {/* Top Code Box (e.g. RM-01) */}
      <div className='w-16 h-6 border border-black flex items-center justify-center bg-white shadow-xs'>
        <FormText customPt={7.5} bold align='center'>
          {topCode}
        </FormText>
      </div>

      {/* 10 Individual Digit Boxes */}
      <div className='flex border border-black divide-x divide-black bg-white shadow-xs'>
        {digits.map((digit, idx) => (
          <div
            key={idx}
            className='w-5 h-7 flex items-center justify-center'
          >
            <FormText customPt={8} bold align='center'>
              {digit}
            </FormText>
          </div>
        ))}
      </div>
    </div>
  );
}
