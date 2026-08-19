'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useSimulationStore } from '../store';

export function SimulationSettings() {
  const {
    isSimulationEnabled,
    timeInterval,
    transactionVolume,
    isNotificationSoundEnabled,
    toggleSimulation,
    setTimeInterval,
    setTransactionVolume,
    toggleNotificationSound
  } = useSimulationStore();

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Simulation Settings</CardTitle>
        <CardDescription>Configure the customer behavior simulation engine.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {}
        <div className='flex items-center justify-between'>
          <div className='space-y-0.5'>
            <Label htmlFor='simulation-toggle'>Simulasi Pelanggan (Customer Simulation)</Label>
            <p className='text-sm text-muted-foreground'>Turn on or off the simulation engine.</p>
          </div>
          <Switch
            id='simulation-toggle'
            checked={isSimulationEnabled}
            onCheckedChange={toggleSimulation}
          />
        </div>

        {}
        <div className='flex items-center justify-between'>
          <div className='space-y-0.5'>
            <Label htmlFor='sound-toggle'>Suara Notifikasi (Notification Sound)</Label>
            <p className='text-sm text-muted-foreground'>
              Play a sound when a simulated order occurs.
            </p>
          </div>
          <Switch
            id='sound-toggle'
            checked={isNotificationSoundEnabled}
            onCheckedChange={toggleNotificationSound}
          />
        </div>

        {}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label>Interval Waktu (Time Interval)</Label>
            <span className='text-sm text-muted-foreground'>{timeInterval / 1000} seconds</span>
          </div>
          <Slider
            value={[timeInterval]}
            onValueChange={(vals) => setTimeInterval(vals[0])}
            max={60000}
            min={1000}
            step={1000}
          />
          <p className='text-xs text-muted-foreground'>
            How often the simulation engine generates a new event.
          </p>
        </div>

        {}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label>Volume Pesanan (Order Volume)</Label>
            <span className='text-sm text-muted-foreground'>{transactionVolume} per interval</span>
          </div>
          <Slider
            value={[transactionVolume]}
            onValueChange={(vals) => setTransactionVolume(vals[0])}
            max={50}
            min={1}
            step={1}
          />
          <p className='text-xs text-muted-foreground'>Number of orders generated per interval.</p>
        </div>
      </CardContent>
    </Card>
  );
}
