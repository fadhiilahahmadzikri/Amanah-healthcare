'use client';

import { useCallback, useMemo, useState } from 'react';

import { AdaptiveSheet } from '@/components/sheets/adaptive-sheet';
import type { DocumentCodes } from '@/lib/documents/codes';
import type { OnboardingData } from '../api/types';
import { buildShippingLabelData } from './label-data';
import { ShippingLabelActions } from './shipping-label-actions';
import { ShippingLabelPreview } from './shipping-label-preview';

export function ShippingLabelSheet({
  open,
  onOpenChange,
  record
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: OnboardingData | null;
}) {
  const [codes, setCodes] = useState<DocumentCodes | null>(null);
  const label = useMemo(() => (record ? buildShippingLabelData(record) : null), [record]);
  const targetId = label ? `shipping-label-${label.id}` : 'shipping-label-preview';
  const handleCodesReady = useCallback((nextCodes: DocumentCodes) => {
    setCodes(nextCodes);
  }, []);

  if (!label) {
    return null;
  }

  return (
    <AdaptiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={`Resi ${label.trackingNumber}`}
      subtitle='Shipping Label'
      description={`${label.courier.name} ${label.courier.service}`}
      width={620}
      side='right'
      sheetContent={
        <ShippingLabelPreview
          data={label}
          targetId={targetId}
          qrCodeDataUrl={codes?.qrCodeDataUrl}
          barcodeDataUrl={codes?.barcodeDataUrl}
        />
      }
      footer={
        <ShippingLabelActions data={label} targetId={targetId} onCodesReady={handleCodesReady} />
      }
    />
  );
}
