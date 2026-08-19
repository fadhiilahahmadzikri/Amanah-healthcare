'use client';

import { useMemo, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  EditFormActions,
  EditFormField,
  EditFormFieldGrid,
  EditFormLineItems,
  EditFormNotes,
  EditFormSection,
  EditFormTotals
} from '@/components/forms/edit-form-shell';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useInvoiceStore, type Invoice, type InvoiceStatus } from '../store/invoice-store';

type InvoiceEditPageProps = {
  invoiceId: string;
};

type CustomerOption = Pick<
  Invoice,
  'customerName' | 'customerEmail' | 'customerAvatarUrl' | 'company' | 'address'
>;

type InvoiceLineItemFormValue = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type InvoiceFormState = {
  customerEmail: string;
  status: InvoiceStatus;
  dueDate: string;
  tax: number;
  notes: string;
  items: InvoiceLineItemFormValue[];
};

const INVOICE_STATUS_OPTIONS: InvoiceStatus[] = ['PAID', 'PENDING', 'OVERDUE', 'CANCELLED'];

export function InvoiceEditPage({ invoiceId }: InvoiceEditPageProps) {
  const router = useRouter();
  const { invoices, updateInvoice } = useInvoiceStore();
  const invoice = invoices.find(
    (item) => item.id === invoiceId || item.invoiceNumber === invoiceId
  );

  if (!invoice) {
    notFound();
  }

  const customerOptions = useMemo(() => getCustomerOptions(invoices), [invoices]);
  const [form, setForm] = useState<InvoiceFormState>(() => getInitialFormState(invoice));
  const subtotal = form.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  const total = subtotal + form.tax;

  const updateForm = (values: Partial<InvoiceFormState>) => {
    setForm((current) => ({ ...current, ...values }));
  };

  const handleItemChange = (id: string, values: Partial<Omit<InvoiceLineItemFormValue, 'id'>>) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, ...values } : item))
    }));
  };

  const handleAddItem = () => {
    setForm((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id: crypto.randomUUID(),
          description: 'New line item',
          quantity: 1,
          unitPrice: 0
        }
      ]
    }));
  };

  const handleRemoveItem = (id: string) => {
    setForm((current) => ({
      ...current,
      items:
        current.items.length > 1 ? current.items.filter((item) => item.id !== id) : current.items
    }));
  };

  const handleSave = () => {
    const customer = customerOptions.find((option) => option.customerEmail === form.customerEmail);
    const nextInvoice = buildUpdatedInvoice({ invoice, form, customer, subtotal, total });

    updateInvoice(invoice.id, nextInvoice);
    toast.success('Invoice updated successfully');
    router.push(`/dashboard/invoices/${invoice.id}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/invoices/${invoice.id}`);
  };

  return (
    <div className='flex max-w-3xl flex-col gap-4'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Edit {invoice.invoiceNumber}</h2>
        <p className='text-muted-foreground text-sm'>Update invoice information.</p>
      </div>

      <EditFormSection title='Invoice Details' description='Update basic invoice information.'>
        <EditFormFieldGrid>
          <EditFormField label='Customer'>
            <Select
              value={form.customerEmail}
              onValueChange={(customerEmail) => updateForm({ customerEmail })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select customer' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {customerOptions.map((customer) => (
                    <SelectItem key={customer.customerEmail} value={customer.customerEmail}>
                      {customer.customerName} ({customer.customerEmail})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </EditFormField>

          <EditFormField label='Status'>
            <Select
              value={form.status}
              onValueChange={(status) => updateForm({ status: status as InvoiceStatus })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {INVOICE_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatStatus(status)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </EditFormField>

          <EditFormField label='Due Date'>
            <Input
              type='date'
              value={form.dueDate}
              onChange={(event) => updateForm({ dueDate: event.target.value })}
            />
          </EditFormField>

          <EditFormField label='Tax'>
            <Input
              type='number'
              min={0}
              step='0.01'
              value={form.tax}
              onChange={(event) => updateForm({ tax: Number(event.target.value) || 0 })}
            />
          </EditFormField>
        </EditFormFieldGrid>
      </EditFormSection>

      <EditFormSection title='Line Items' description='Update billable items.'>
        <EditFormLineItems
          items={form.items}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onItemChange={handleItemChange}
        />
        <EditFormTotals subtotal={subtotal} tax={form.tax} total={total} />
      </EditFormSection>

      <EditFormSection title='Notes'>
        <EditFormNotes
          value={form.notes}
          onChange={(notes) => updateForm({ notes })}
          placeholder='Payment terms, additional notes...'
        />
      </EditFormSection>

      <EditFormActions onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}

function getInitialFormState(invoice: Invoice): InvoiceFormState {
  return {
    customerEmail: invoice.customerEmail,
    status: invoice.status,
    dueDate: toDateInputValue(invoice.dueDate),
    tax: roundCurrency(invoice.tax),
    notes: invoice.notes ?? '',
    items: invoice.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.qty,
      unitPrice: item.unitPrice
    }))
  };
}

function getCustomerOptions(invoices: Invoice[]) {
  return Array.from(
    new Map(
      invoices.map((invoice) => [
        invoice.customerEmail,
        {
          customerName: invoice.customerName,
          customerEmail: invoice.customerEmail,
          customerAvatarUrl: invoice.customerAvatarUrl,
          company: invoice.company,
          address: invoice.address
        }
      ])
    ).values()
  );
}

function buildUpdatedInvoice({
  invoice,
  form,
  customer,
  subtotal,
  total
}: {
  invoice: Invoice;
  form: InvoiceFormState;
  customer?: CustomerOption;
  subtotal: number;
  total: number;
}): Invoice {
  return {
    ...invoice,
    customerName: customer?.customerName ?? invoice.customerName,
    customerEmail: customer?.customerEmail ?? invoice.customerEmail,
    customerAvatarUrl: customer?.customerAvatarUrl ?? invoice.customerAvatarUrl,
    company: customer?.company ?? invoice.company,
    address: customer?.address ?? invoice.address,
    status: form.status,
    dueDate: toIsoDate(form.dueDate, invoice.dueDate),
    notes: form.notes,
    items: form.items.map((item) => ({
      id: item.id,
      description: item.description,
      qty: item.quantity,
      unitPrice: roundCurrency(item.unitPrice),
      total: roundCurrency(item.quantity * item.unitPrice)
    })),
    subtotal: roundCurrency(subtotal),
    tax: roundCurrency(form.tax),
    totalAmount: roundCurrency(total)
  };
}

function toDateInputValue(value: string) {
  return value.slice(0, 10);
}

function toIsoDate(value: string, fallback: string) {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : fallback;
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function formatStatus(status: InvoiceStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}
