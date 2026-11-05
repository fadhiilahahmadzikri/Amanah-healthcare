import React from 'react';
import { FormText } from '../atoms/FormText';
import { NumberBox } from '../atoms/NumberBox';

export interface CodeBoxesHeaderProps {
  topCode?: string;
  recordDigits?: (string | undefined)[];
}

export const CodeBoxesHeader: React.FC<CodeBoxesHeaderProps> = ({
  topCode = '',
  recordDigits = [],
}) => {
  const digits = Array.from({ length: 10 }, (_, i) => recordDigits[i] || '');

  return (
    <div className="flex flex-col items-end gap-[5px]">
      {/* Top Code Box (1120 dxa x 410 dxa in docucare) */}
      <div className="w-[75px] h-[27px] border border-black flex items-center justify-center bg-white">
        <FormText customPt={7.2} bold={Boolean(topCode)} align="center">
          {topCode}
        </FormText>
      </div>

      {/* 10 Digit Boxes (430 dxa x 540 dxa in docucare) */}
      <div className="flex items-center gap-[1px]">
        {digits.map((digit, idx) => (
          <NumberBox
            key={idx}
            digit={digit}
            width="23px"
            height="29px"
            customPt={7.2}
            bold={Boolean(digit)}
          />
        ))}
      </div>
    </div>
  );
};
