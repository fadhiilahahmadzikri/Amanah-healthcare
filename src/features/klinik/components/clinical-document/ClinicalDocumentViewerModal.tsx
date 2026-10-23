'use client';

import React from 'react';
import {
  ClinicalDocumentFullscreenReader,
  type ClinicalDocumentFullscreenReaderProps
} from './ClinicalDocumentFullscreenReader';

export type ClinicalDocumentViewerModalProps = ClinicalDocumentFullscreenReaderProps;

/**
 * Backward compatibility wrapper delegating to ClinicalDocumentFullscreenReader.
 * Ensures all clinical documents are rendered in true Fullscreen PDF Reader mode.
 */
export const ClinicalDocumentViewerModal: React.FC<ClinicalDocumentViewerModalProps> = (props) => {
  return <ClinicalDocumentFullscreenReader {...props} />;
};
