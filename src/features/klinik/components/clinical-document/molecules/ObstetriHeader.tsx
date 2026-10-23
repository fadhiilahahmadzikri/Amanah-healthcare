import React from 'react';
import { FormText } from '../atoms/FormText';

export interface ObstetriHeaderProps {
  title: string;
  pregnancyFields: string[];
  fieldValues?: Record<string, string>;
  titlePt?: number;
  fieldPt?: number;
}

export const ObstetriHeader: React.FC<ObstetriHeaderProps> = ({
  title,
  pregnancyFields,
  fieldValues = {},
  titlePt = 8.2,
  fieldPt = 7.2,
}) => {
  return (
    <div className="flex items-baseline gap-4 my-[3px]">
      <div className="shrink-0">
        <FormText customPt={titlePt} bold>
          {title}
        </FormText>
      </div>

      <div className="flex items-center gap-3">
        {pregnancyFields.map((field) => (
          <div key={field} className="flex items-baseline gap-1">
            <FormText customPt={fieldPt} bold>
              {field} :
            </FormText>
            <div className="w-[32px] border-b border-dotted border-[#777777] text-center min-h-[14px]">
              <FormText customPt={fieldPt} bold>
                {fieldValues[field] || '\u00A0'}
              </FormText>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
