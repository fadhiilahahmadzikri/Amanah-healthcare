import React from 'react';
import { DocumentPage } from './DocumentPage';
import { ImunisasiHeader } from '../organisms/ImunisasiHeader';
import { ImunisasiIdentitySection } from '../organisms/ImunisasiIdentitySection';
import { ImunisasiPreTableSection } from '../organisms/ImunisasiPreTableSection';
import { ImunisasiVaccineTableSection } from '../organisms/ImunisasiVaccineTableSection';
import type { ImunisasiFormConfig, ImunisasiFormData } from '../types';
import { defaultImunisasiConfig } from '../config/imunisasi-config';

export interface ImunisasiFormTemplateProps {
  data?: ImunisasiFormData | null;
  config?: ImunisasiFormConfig;
}

export const ImunisasiFormTemplate: React.FC<ImunisasiFormTemplateProps> = ({
  data = null,
  config = defaultImunisasiConfig,
}) => {
  return (
    <DocumentPage>
      <ImunisasiHeader config={config.header} data={data?.header} />
      <ImunisasiIdentitySection config={config.identity} data={data?.identity} />
      <ImunisasiPreTableSection config={config.preTable} data={data?.preTable} />
      <ImunisasiVaccineTableSection config={config.vaccineTable} data={data?.vaccineRows} />
    </DocumentPage>
  );
};
