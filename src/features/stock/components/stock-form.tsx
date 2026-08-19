'use client';

import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  stockOperationSchema,
  type StockOperationFormValues
} from '@/features/stock/schemas/stock';
import { processStockIn, processStockOut, processStockAdjustment } from '../api/service';
import { stockProductsQueryOptions, stockKeys } from '../api/queries';

export type StockOperationType = 'IN' | 'OUT' | 'ADJUSTMENT';

export default function StockForm({
  operationType,
  pageTitle
}: {
  operationType: StockOperationType;
  pageTitle: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: products } = useQuery(stockProductsQueryOptions({}));

  const productOptions = (products || []).map((p) => ({
    label: `${p.name} (SKU: ${p.sku})`,
    value: p.id
  }));

  const mutationFn =
    operationType === 'IN'
      ? processStockIn
      : operationType === 'OUT'
        ? processStockOut
        : processStockAdjustment;

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(`Stock ${operationType.toLowerCase()} successful`);
      queryClient.invalidateQueries({ queryKey: stockKeys.all });
      router.push('/dashboard/stock');
    },
    onError: (err: Error) => {
      toast.error(err.message || `Failed to process stock ${operationType.toLowerCase()}`);
    }
  });

  const form = useAppForm({
    defaultValues: {
      productId: '',
      quantity: undefined,
      notes: ''
    } as unknown as StockOperationFormValues,
    validators: {
      onSubmit: stockOperationSchema
    },
    onSubmit: ({ value }) => {
      const payload = {
        productId: value.productId,
        quantity: value.quantity,
        notes: value.notes || ''
      };

      mutation.mutate(payload);
    }
  });

  const { FormSelectField, FormTextField, FormTextareaField } =
    useFormFields<StockOperationFormValues>();

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>{pageTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form.AppForm>
          <form.Form className='space-y-8'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormSelectField
                name='productId'
                label='Product'
                required
                options={productOptions}
                placeholder='Select product'
                validators={{
                  onBlur: z.string().min(1, 'Please select a product')
                }}
              />

              <FormTextField
                name='quantity'
                label='Quantity'
                required
                type='number'
                min={1}
                step={1}
                placeholder='Enter quantity'
                validators={{
                  onBlur: z.number({ message: 'Quantity is required' })
                }}
              />
            </div>

            <FormTextareaField
              name='notes'
              label='Notes (Optional)'
              placeholder='Enter reference or reason'
              maxLength={200}
              rows={3}
            />

            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Back
              </Button>
              <form.SubmitButton>Submit</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
