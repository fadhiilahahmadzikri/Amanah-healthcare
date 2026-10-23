import React from 'react';

export interface DoubleDividerProps {
  className?: string;
}

export const DoubleDivider: React.FC<DoubleDividerProps> = ({ className = '' }) => {
  return (
    <div
      className={`w-full border-b-[3px] border-double border-black my-[2px] ${className}`}
    />
  );
};
