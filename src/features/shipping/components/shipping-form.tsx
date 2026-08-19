'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form';
import { getQueryClient } from '@/lib/query-client';
import { shippingSchema, type ShippingFormValues } from '@/features/shipping/schemas/shipping';
import { createShippingMutation, updateShippingMutation } from '../api/mutations';
import { shippingKeys } from '../api/queries';
import type { Coordinate, OnboardingData } from '../api/types';
import { ShippingLocationMap } from './shipping-location-map';

export default function ShippingForm({
  initialData,
  pageTitle
}: {
  initialData: OnboardingData | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(initialData);
  const queryClient = getQueryClient();
  const [startCoord, setStartCoord] = useState<Coordinate | null>(initialData?.startCoord ?? null);
  const [endCoord, setEndCoord] = useState<Coordinate | null>(initialData?.endCoord ?? null);

  const createMutation = useMutation({
    ...createShippingMutation,
    onSuccess: () => {
      toast.success('Shipping record created successfully');
      queryClient.invalidateQueries({ queryKey: shippingKeys.all });
      router.push('/dashboard/shipping/onboarding');
    },
    onError: () => {
      toast.error('Failed to create shipping record');
    }
  });

  const updateMutation = useMutation({
    ...updateShippingMutation,
    onSuccess: () => {
      toast.success('Shipping record updated successfully');
      queryClient.invalidateQueries({ queryKey: shippingKeys.all });
      router.push('/dashboard/shipping/onboarding');
    },
    onError: () => {
      toast.error('Failed to update shipping record');
    }
  });

  const form = useAppForm({
    defaultValues: {
      customer: initialData?.customer ?? '',
      product: initialData?.product ?? '',
      orderId: initialData?.orderId ?? '',
      address: initialData?.address ?? '',
      price: initialData?.price ?? '',
      status: initialData?.status ?? 'Packed',
      startCoord: initialData?.startCoord,
      endCoord: initialData?.endCoord
    } as ShippingFormValues,
    validators: {
      onSubmit: shippingSchema
    },
    onSubmit: async ({ value }) => {
      if (isEdit && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, values: value });
        return;
      }

      await createMutation.mutateAsync(value);
    }
  });

  useEffect(() => {
    form.setFieldValue('startCoord', startCoord ?? undefined);
    form.setFieldValue('endCoord', endCoord ?? undefined);
  }, [endCoord, form, startCoord]);

  const { FormTextField, FormSelectField } = useFormFields<ShippingFormValues>();

  const statusOptions = [
    { label: 'Packed', value: 'Packed' },
    { label: 'Shipping', value: 'Shipping' },
    { label: 'Completed', value: 'Completed' }
  ];

  return (
    <form.AppForm>
      <form.Form className='p-0 md:p-0'>
        <ShippingLocationMap
          title={pageTitle}
          description='Customer order and destination setup'
          origin={startCoord}
          destination={endCoord}
          onOriginChange={setStartCoord}
          onDestinationChange={setEndCoord}
          onAddressChange={(address) => form.setFieldValue('address', address)}
          customerContent={
            <div className='grid gap-5'>
              <FormTextField
                name='customer'
                label='Customer Name'
                required
                placeholder='Enter customer name'
              />
              <FormTextField
                name='product'
                label='Product'
                required
                placeholder='Enter product name'
              />
              <FormTextField
                name='orderId'
                label='Order ID'
                required
                placeholder='Enter order ID e.g. #01234'
              />
              <FormTextField
                name='price'
                label='Price'
                required
                placeholder='Enter price e.g. $100'
              />
              <FormTextField
                name='address'
                label='Address'
                required
                placeholder='Enter delivery address'
              />
              <FormSelectField
                name='status'
                label='Status'
                required
                options={statusOptions}
                placeholder='Select status'
              />
            </div>
          }
          footerContent={
            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Back
              </Button>
              <form.SubmitButton>{isEdit ? 'Update Shipping' : 'Add Shipping'}</form.SubmitButton>
            </div>
          }
        />
      </form.Form>
    </form.AppForm>
  );
}
