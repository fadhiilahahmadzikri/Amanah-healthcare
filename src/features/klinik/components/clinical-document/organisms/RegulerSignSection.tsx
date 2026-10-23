import React from 'react';
import { FormText } from '../atoms/FormText';

export interface RegulerSignSectionProps {
  doctorName?: string;
  patientName?: string;
  registrationDate?: string;
}

export const RegulerSignSection: React.FC<RegulerSignSectionProps> = ({
  doctorName,
  patientName,
  registrationDate,
}) => {
  return (
    <div className="w-full mt-auto pt-4">
      <div className="w-full flex justify-between items-start text-[7.5pt]">
        {/* Left: Patient / Guardian Signature */}
        <div className="w-48 text-center flex flex-col items-center">
          <FormText customPt={7.2}>Pasien / Wali Yang Bersangkutan,</FormText>
          <div className="h-16 flex items-end justify-center w-full">
            {/* Signature space */}
          </div>
          <div className="w-44 border-b border-black my-1" />
          <FormText customPt={7.2} bold>
            {patientName ? `( ${patientName} )` : '( ................................................. )'}
          </FormText>
        </div>

        {/* Right: Examining Doctor Signature */}
        <div className="w-56 text-center flex flex-col items-center">
          <FormText customPt={7.2}>
            Sleman, {registrationDate || '........................ 202...'}
          </FormText>
          <FormText customPt={7.2}>Dokter Pemeriksa,</FormText>
          <div className="h-14 flex items-end justify-center w-full">
            {/* Signature space */}
          </div>
          <div className="w-48 border-b border-black my-1" />
          <FormText customPt={7.2} bold>
            {doctorName ? `( ${doctorName} )` : '( ................................................. )'}
          </FormText>
          <FormText customPt={6.5} className="text-gray-600">
            SIP: Klinik Amanah Healthcare
          </FormText>
        </div>
      </div>
    </div>
  );
};
