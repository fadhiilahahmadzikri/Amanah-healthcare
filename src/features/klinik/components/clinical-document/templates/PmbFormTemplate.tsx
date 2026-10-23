import React from 'react';
import { DocumentPage } from './DocumentPage';
import { PmbHeader } from '../organisms/PmbHeader';
import { PmbIdentitySection } from '../organisms/PmbIdentitySection';
import { PmbAnamnesaSection } from '../organisms/PmbAnamnesaSection';
import { PmbObstetriSection } from '../organisms/PmbObstetriSection';
import { PmbKbSection } from '../organisms/PmbKbSection';
import type { PmbFormConfig, PmbFormData } from '../types';
import { defaultPmbConfig } from '../config/pmb-config';

export interface PmbFormTemplateProps {
  data?: PmbFormData | null;
  config?: PmbFormConfig;
}

export const PmbFormTemplate: React.FC<PmbFormTemplateProps> = ({
  data = null,
  config = defaultPmbConfig,
}) => {
  return (
    <DocumentPage>
      <PmbHeader config={config.header} allergy={data?.header?.allergy} />
      <PmbIdentitySection config={config.identity} data={data?.identity} />
      <PmbAnamnesaSection config={config.anamnesa} data={data?.anamnesa} />
      <PmbObstetriSection
        config={config.obstetri}
        data={data?.obstetriRows}
        pregnancyFields={data?.pregnancyFields}
      />
      <PmbKbSection config={config.kb} data={data?.kbRows} />
    </DocumentPage>
  );
};
