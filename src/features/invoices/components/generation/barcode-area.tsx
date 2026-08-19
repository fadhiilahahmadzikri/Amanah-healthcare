import Image from 'next/image';

import { ReceiptSeparator } from './receipt-separator';

export function BarcodeArea({
  barcodeDataUrl,
  qrCodeDataUrl,
  barcodeValue,
  qrLabel
}: {
  barcodeDataUrl?: string;
  qrCodeDataUrl?: string;
  barcodeValue: string;
  qrLabel: string;
}) {
  return (
    <>
      <ReceiptSeparator />
      <div className='flex items-end justify-between gap-4'>
        <div className='min-w-0 flex-1'>
          {barcodeDataUrl ? (
            <Image
              src={barcodeDataUrl}
              alt={`${barcodeValue} barcode`}
              width={260}
              height={56}
              unoptimized
              className='h-14 w-full object-contain'
            />
          ) : (
            <div className='flex h-14 items-center justify-center rounded border border-dashed text-[10px] text-slate-500'>
              Generating barcode
            </div>
          )}
          <p className='mt-1 truncate text-center text-[10px] tracking-[0.24em]'>{barcodeValue}</p>
        </div>
        <div className='w-20 shrink-0 text-center'>
          {qrCodeDataUrl ? (
            <Image
              src={qrCodeDataUrl}
              alt={qrLabel}
              width={80}
              height={80}
              unoptimized
              className='mx-auto size-20 object-contain'
            />
          ) : (
            <div className='size-20 rounded border border-dashed' />
          )}
          <p className='mt-1 text-[9px] uppercase text-slate-500'>{qrLabel}</p>
        </div>
      </div>
    </>
  );
}
