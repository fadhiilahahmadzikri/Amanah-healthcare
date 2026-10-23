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
    <div className="flex flex-col items-end gap-[3px]">
      {/* Top Code Box */}
      <div className="w-[60px] h-[19px] border border-black flex items-center justify-center bg-white">
        <FormText customPt={7.5} bold={Boolean(topCode)} align="center">
          {topCode}
        </FormText>
      </div>

      {/* 10 Digit Boxes */}
      <div className="flex items-center gap-[1px]">
        {digits.map((digit, idx) => (
          <NumberBox
            key={idx}
            digit={digit}
            width="17px"
            height="21px"
            bold={Boolean(digit)}
          />
        ))}
      </div>
    </div>
  );
};
