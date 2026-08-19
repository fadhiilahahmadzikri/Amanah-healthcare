'use client';

import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type EditFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

type EditFormFieldGridProps = {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
};

type EditFormFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

type EditFormLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type EditFormLineItemsProps = {
  items: EditFormLineItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onItemChange: (id: string, values: Partial<Omit<EditFormLineItem, 'id'>>) => void;
};

type EditFormTotalsProps = {
  subtotal: number;
  tax: number;
  total: number;
};

type EditFormActionsProps = {
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  isSaving?: boolean;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function EditFormSection({
  title,
  description,
  children,
  className,
  contentClassName
}: EditFormSectionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn('flex flex-col gap-4', contentClassName)}>{children}</CardContent>
    </Card>
  );
}

export function EditFormFieldGrid({ children, columns = 2, className }: EditFormFieldGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 && 'md:grid-cols-2',
        columns === 3 && 'md:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
}

export function EditFormField({ label, children, className }: EditFormFieldProps) {
  return (
    <Field className={cn('gap-2', className)}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </Field>
  );
}

export function EditFormLineItems({
  items,
  onAddItem,
  onRemoveItem,
  onItemChange
}: EditFormLineItemsProps) {
  return (
    <div className='flex flex-col gap-3'>
      {items.map((item) => (
        <div key={item.id} className='grid gap-3 md:grid-cols-[1fr_88px_120px_36px]'>
          <EditFormField label='Description'>
            <Input
              value={item.description}
              onChange={(event) => onItemChange(item.id, { description: event.target.value })}
            />
          </EditFormField>
          <EditFormField label='Qty'>
            <Input
              type='number'
              min={1}
              value={item.quantity}
              onChange={(event) =>
                onItemChange(item.id, { quantity: Number(event.target.value) || 1 })
              }
            />
          </EditFormField>
          <EditFormField label='Unit Price'>
            <Input
              type='number'
              min={0}
              step='0.01'
              value={item.unitPrice}
              onChange={(event) =>
                onItemChange(item.id, { unitPrice: Number(event.target.value) || 0 })
              }
            />
          </EditFormField>
          <div className='flex items-end'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='text-muted-foreground'
              onClick={() => onRemoveItem(item.id)}
              aria-label={`Remove ${item.description || 'line item'}`}
            >
              <Icons.trash className='h-4 w-4' />
            </Button>
          </div>
        </div>
      ))}
      <div>
        <Button type='button' variant='outline' size='sm' onClick={onAddItem}>
          Add Item
        </Button>
      </div>
    </div>
  );
}

export function EditFormTotals({ subtotal, tax, total }: EditFormTotalsProps) {
  return (
    <div className='ml-auto flex w-full max-w-48 flex-col gap-1 text-sm'>
      <div className='flex justify-between gap-4'>
        <span className='text-muted-foreground'>Subtotal:</span>
        <span className='font-medium'>{formatCurrency(subtotal)}</span>
      </div>
      <div className='flex justify-between gap-4'>
        <span className='text-muted-foreground'>Tax:</span>
        <span className='font-medium'>{formatCurrency(tax)}</span>
      </div>
      <div className='flex justify-between gap-4 text-base font-bold'>
        <span>Total:</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

export function EditFormNotes({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className='min-h-28'
    />
  );
}

export function EditFormActions({
  onSave,
  onCancel,
  saveLabel = 'Save Changes',
  cancelLabel = 'Cancel',
  isSaving = false
}: EditFormActionsProps) {
  return (
    <div className='flex gap-2 pt-2'>
      <Button type='button' onClick={onSave} isLoading={isSaving}>
        {saveLabel}
      </Button>
      <Button type='button' variant='outline' onClick={onCancel} disabled={isSaving}>
        {cancelLabel}
      </Button>
    </div>
  );
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}
