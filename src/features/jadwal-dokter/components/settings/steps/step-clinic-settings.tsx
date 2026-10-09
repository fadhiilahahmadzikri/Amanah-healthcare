'use client';

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { ClinicSettingConfig } from '../../../api/admin-schedule-configuration.api';

interface StepClinicSettingsProps {
  clinicSettings: ClinicSettingConfig[];
  onUpdateSetting: (key: string, value: any) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Semua Parameter' },
  { id: 'duration', label: 'Durasi & Buffer' },
  { id: 'queue', label: 'Antrean & Tiket' },
  { id: 'notification', label: 'Notifikasi' },
  { id: 'general', label: 'Umum' }
];

export function StepClinicSettings({
  clinicSettings,
  onUpdateSetting
}: StepClinicSettingsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('duration');

  const filteredSettings = clinicSettings.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className='flex flex-col gap-3.5'>
      {/* Category Pills */}
      <div className='flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none'>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = clinicSettings.filter(
            (s) => cat.id === 'all' || s.category === cat.id
          ).length;

          return (
            <button
              key={cat.id}
              type='button'
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1 rounded-full ${
                  isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/20'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Settings list */}
      <div className='flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1'>
        {filteredSettings.map((setting) => {
          const isBoolean = typeof setting.value === 'boolean';
          const isNumber = typeof setting.value === 'number';

          return (
            <div
              key={setting.key}
              className='p-3.5 rounded-xl border border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-border transition-colors'
            >
              <div className='flex flex-col gap-0.5 min-w-0 flex-1 pr-2'>
                <span className='font-semibold text-xs sm:text-sm text-foreground'>
                  {setting.label}
                </span>
                <p className='text-xs text-muted-foreground line-clamp-2'>
                  {setting.description}
                </p>
              </div>

              <div className='flex items-center shrink-0 self-end sm:self-center'>
                {isBoolean ? (
                  <Switch
                    checked={Boolean(setting.value)}
                    onCheckedChange={(checked) => onUpdateSetting(setting.key, checked)}
                    aria-label={setting.label}
                  />
                ) : isNumber ? (
                  <Input
                    type='number'
                    value={setting.value}
                    onChange={(e) =>
                      onUpdateSetting(setting.key, Number(e.target.value))
                    }
                    className='h-8 w-24 text-xs font-mono text-right'
                  />
                ) : (
                  <Input
                    type='text'
                    value={String(setting.value)}
                    onChange={(e) => onUpdateSetting(setting.key, e.target.value)}
                    className='h-8 w-32 sm:w-40 text-xs'
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
