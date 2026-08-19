import React from 'react';
import { SimulationSettings } from '@/features/settings/components/simulation-settings';

export const metadata = {
  title: 'Settings',
  description: 'Manage simulation and application settings'
};

export default function SettingsPage() {
  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Settings</h2>
      </div>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <div className='col-span-2'>
          <SimulationSettings />
        </div>
      </div>
    </div>
  );
}
