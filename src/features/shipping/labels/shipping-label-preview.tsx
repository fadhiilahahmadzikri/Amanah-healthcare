'use client';

import Image from 'next/image';

import type { ShippingLabelData } from './types';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function ShippingLabelPreview({
  data,
  targetId,
  qrCodeDataUrl,
  barcodeDataUrl
}: {
  data: ShippingLabelData;
  targetId?: string;
  qrCodeDataUrl?: string;
  barcodeDataUrl?: string;
}) {
  const barcodeSrc = barcodeDataUrl ?? data.codes.barcodeDataUrl;
  const qrCodeSrc = qrCodeDataUrl ?? data.codes.qrCodeDataUrl;

  return (
    <div className='rounded-lg border bg-muted/40 p-4'>
      <div
        id={targetId}
        className='mx-auto w-full max-w-[520px] bg-white p-4 text-slate-950 shadow-sm'
      >
        <div className='grid grid-cols-[1fr_auto] gap-3 border-b-4 border-slate-950 pb-3'>
          <div>
            <p className='text-2xl font-black tracking-tight'>{data.courier.name}</p>
            <p className='text-xs font-semibold uppercase tracking-[0.24em]'>
              {data.courier.service} · {data.routeCode}
            </p>
          </div>
          <div className='border-2 border-slate-950 px-3 py-2 text-center'>
            <p className='text-[10px] font-bold uppercase'>Route</p>
            <p className='text-xl font-black'>{data.routeCode}</p>
          </div>
        </div>

        <div className='grid grid-cols-[1fr_116px] gap-4 border-b border-slate-300 py-4'>
          <div>
            <p className='text-[10px] font-bold uppercase tracking-wide text-slate-500'>
              Tracking Number
            </p>
            <p className='text-lg font-black tracking-wide'>{data.trackingNumber}</p>
            {barcodeSrc ? (
              <Image
                src={barcodeSrc}
                alt={`${data.trackingNumber} barcode`}
                width={320}
                height={64}
                unoptimized
                className='mt-2 h-16 w-full object-contain'
              />
            ) : (
              <div className='mt-2 flex h-16 items-center justify-center border border-dashed text-xs text-slate-500'>
                Generating barcode
              </div>
            )}
          </div>
          <div className='text-center'>
            {qrCodeSrc ? (
              <Image
                src={qrCodeSrc}
                alt='Shipping tracking QR code'
                width={96}
                height={96}
                unoptimized
                className='mx-auto size-24 object-contain'
              />
            ) : (
              <div className='mx-auto size-24 border border-dashed' />
            )}
            <p className='mt-1 text-[10px] font-semibold uppercase text-slate-500'>Scan Track</p>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3 border-b border-slate-300 py-4'>
          <AddressBlock
            title='Sender'
            name={data.sender.name}
            phone={data.sender.phone}
            address={data.sender.address}
          />
          <AddressBlock
            title='Receiver'
            name={data.receiver.name}
            phone={data.receiver.phone}
            address={data.receiver.address}
          />
        </div>

        <div className='grid grid-cols-3 gap-2 border-b border-slate-300 py-3 text-sm'>
          <LabelStat label='Payment' value={data.payment.method} />
          <LabelStat label='COD' value={formatCurrency(data.payment.codAmount)} />
          <LabelStat label='Weight' value={`${data.package.weightKg} kg`} />
        </div>

        <div className='py-3'>
          <p className='mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500'>Items</p>
          {data.lineItems.map((item) => (
            <div key={item.id} className='flex justify-between gap-3 text-sm'>
              <span className='font-semibold'>
                {item.quantity}x {item.name}
              </span>
              <span>{formatCurrency(item.value)}</span>
            </div>
          ))}
          <p className='mt-2 text-xs text-slate-500'>{data.package.note}</p>
        </div>

        <div className='border-t-4 border-slate-950 pt-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em]'>
          Marketplace resi preview · frontend prototype
        </div>
      </div>
    </div>
  );
}

function AddressBlock({
  title,
  name,
  phone,
  address
}: {
  title: string;
  name: string;
  phone?: string;
  address: string;
}) {
  return (
    <div className='min-w-0'>
      <p className='text-[10px] font-bold uppercase tracking-wide text-slate-500'>{title}</p>
      <p className='mt-1 text-sm font-black'>{name}</p>
      {phone && <p className='text-xs'>{phone}</p>}
      <p className='mt-1 text-xs leading-relaxed'>{address}</p>
    </div>
  );
}

function LabelStat({ label, value }: { label: string; value: string }) {
  return (
    <div className='border border-slate-300 p-2'>
      <p className='text-[10px] font-bold uppercase text-slate-500'>{label}</p>
      <p className='font-black'>{value}</p>
    </div>
  );
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}
