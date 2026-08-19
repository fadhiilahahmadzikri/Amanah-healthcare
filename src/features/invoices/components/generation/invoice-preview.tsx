import type { InvoiceDocumentData } from '../../api/types';
import { BarcodeArea } from './barcode-area';
import { ReceiptPaper } from './receipt-paper';
import { ReceiptSeparator } from './receipt-separator';
import { ThermalPrinterFrame } from './thermal-printer-frame';

type InvoicePreviewProps = {
  data: InvoiceDocumentData;
  qrCodeDataUrl?: string;
  barcodeDataUrl?: string;
  targetId?: string;
  isPrinting?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC'
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function InvoicePreview({
  data,
  qrCodeDataUrl,
  barcodeDataUrl,
  targetId,
  isPrinting
}: InvoicePreviewProps) {
  return (
    <ThermalPrinterFrame isPrinting={isPrinting}>
      <ReceiptPaper id={targetId}>
        <div className='text-center'>
          <p className='text-sm font-bold uppercase tracking-[0.24em]'>{data.seller.name}</p>
          <p className='mt-1 text-[10px]'>{data.seller.address}</p>
          <p className='text-[10px]'>{data.seller.phone}</p>
        </div>

        <ReceiptSeparator />

        <div className='grid grid-cols-2 gap-3 text-[11px]'>
          <InvoiceMeta label='Invoice' value={data.invoiceNumber} />
          <InvoiceMeta label='Status' value={data.status} />
          <InvoiceMeta label='Issued' value={formatDate(data.issuedAt)} />
          <InvoiceMeta label='Due' value={formatDate(data.dueDate)} />
        </div>

        <ReceiptSeparator />

        <div className='text-[11px]'>
          <p className='font-bold uppercase tracking-wide'>Bill To</p>
          <p className='mt-1 font-semibold'>{data.customer.name}</p>
          {data.customer.company && <p>{data.customer.company}</p>}
          {data.customer.email && <p>{data.customer.email}</p>}
          <p>{data.customer.address}</p>
        </div>

        <ReceiptSeparator />

        <div className='flex flex-col gap-3'>
          {data.items.map((item) => (
            <div key={item.id} className='grid grid-cols-[1fr_auto] gap-3'>
              <div className='min-w-0'>
                <p className='font-semibold'>{item.description}</p>
                <p className='text-[10px] text-slate-500'>
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <p className='font-semibold'>{formatCurrency(item.total)}</p>
            </div>
          ))}
        </div>

        <ReceiptSeparator />

        <div className='flex flex-col gap-1 text-[11px]'>
          <TotalRow label='Subtotal' value={data.totals.subtotal} />
          <TotalRow label='Tax' value={data.totals.tax} />
          {data.totals.shipping !== 0 && <TotalRow label='Shipping' value={data.totals.shipping} />}
          {data.totals.discount !== 0 && <TotalRow label='Discount' value={data.totals.discount} />}
          <div className='mt-2 flex justify-between border-t border-slate-300 pt-2 text-sm font-bold'>
            <span>Total</span>
            <span>{formatCurrency(data.totals.total)}</span>
          </div>
        </div>

        {data.notes && (
          <>
            <ReceiptSeparator />
            <p className='text-center text-[10px] text-slate-500'>{data.notes}</p>
          </>
        )}

        <BarcodeArea
          barcodeValue={data.codes.barcodeValue}
          barcodeDataUrl={barcodeDataUrl ?? data.codes.barcodeDataUrl}
          qrCodeDataUrl={qrCodeDataUrl ?? data.codes.qrCodeDataUrl}
          qrLabel='Invoice QR'
        />
      </ReceiptPaper>
    </ThermalPrinterFrame>
  );
}

function InvoiceMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-[9px] uppercase text-slate-500'>{label}</p>
      <p className='truncate font-semibold'>{value}</p>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div className='flex justify-between'>
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}
