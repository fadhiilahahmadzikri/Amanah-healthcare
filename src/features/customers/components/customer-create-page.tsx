'use client';

import { useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  EditFormActions,
  EditFormField,
  EditFormFieldGrid,
  EditFormSection
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
import {
  type CustomerStatus,
  type CustomerCreateValues,
  useCustomerStore
} from '../store/customer-store';

type CustomerFormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  streetAddress: string;
  city: string;
  country: string;
  status: CustomerStatus;
};

const customerStatusOptions: CustomerStatus[] = ['Active', 'Inactive'];

export function CustomerCreatePage() {
  const router = useRouter();
  const { createCustomer } = useCustomerStore();
  const [form, setForm] = useState<CustomerFormState>(getInitialFormState());

  const updateForm = (values: Partial<CustomerFormState>) => {
    setForm((current) => ({ ...current, ...values }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error('Complete required customer information');
      return;
    }

    createCustomer(buildCustomerPayload(form));
    toast.success('Customer created successfully');
    router.push(`/dashboard/customers`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/customers`);
  };

  return (
    <div className='flex max-w-3xl flex-col gap-4'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Create Customer</h2>
        <p className='text-muted-foreground text-sm'>Enter new customer information.</p>
      </div>

      <EditFormSection
        title='Personal Information'
        description='Customer name and contact details.'
      >
        <EditFormFieldGrid>
          <EditFormField label='Full Name'>
            <Input
              value={form.name}
              onChange={(event) => updateForm({ name: event.target.value })}
            />
          </EditFormField>
          <EditFormField label='Email'>
            <Input
              type='email'
              value={form.email}
              onChange={(event) => updateForm({ email: event.target.value })}
            />
          </EditFormField>
          <EditFormField label='Phone'>
            <Input
              value={form.phone}
              onChange={(event) => updateForm({ phone: event.target.value })}
            />
          </EditFormField>
          <EditFormField label='Company'>
            <Input
              value={form.company}
              onChange={(event) => updateForm({ company: event.target.value })}
            />
          </EditFormField>
        </EditFormFieldGrid>
      </EditFormSection>

      <EditFormSection title='Address' description='Customer location details.'>
        <EditFormField label='Street Address'>
          <Input
            value={form.streetAddress}
            onChange={(event) => updateForm({ streetAddress: event.target.value })}
          />
        </EditFormField>
        <EditFormFieldGrid>
          <EditFormField label='City'>
            <Input
              value={form.city}
              onChange={(event) => updateForm({ city: event.target.value })}
            />
          </EditFormField>
          <EditFormField label='Country'>
            <Input
              value={form.country}
              onChange={(event) => updateForm({ country: event.target.value })}
            />
          </EditFormField>
        </EditFormFieldGrid>
      </EditFormSection>

      <EditFormSection title='Status'>
        <EditFormField label='Account Status' className='max-w-sm'>
          <Select
            value={form.status}
            onValueChange={(status) => updateForm({ status: status as CustomerStatus })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select status' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {customerStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </EditFormField>
      </EditFormSection>

      <EditFormActions onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}

function getInitialFormState(): CustomerFormState {
  return {
    name: '',
    email: '',
    phone: '',
    company: '',
    streetAddress: '',
    city: '',
    country: '',
    status: 'Active'
  };
}

function buildCustomerPayload(form: CustomerFormState): CustomerCreateValues {
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    company: form.company.trim(),
    streetAddress: form.streetAddress.trim(),
    city: form.city.trim(),
    country: form.country.trim(),
    status: form.status
  };
}
