'use client';

import React, { useState, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ClinicSettingConfig } from '../../../api/admin-schedule-configuration.api';

interface StepClinicSettingsProps {
  clinicSettings: ClinicSettingConfig[];
  onUpdateSetting: (key: string, value: any) => void;
}

const CATEGORIES: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'Semua' },
  { id: 'general', label: 'Wilayah & Operasional' },
  { id: 'duration', label: 'Durasi Pelayanan' },
  { id: 'queue', label: 'Aturan Antrean' },
  { id: 'notification', label: 'Notifikasi & Layar' },
];

export function StepClinicSettings({
  clinicSettings,
  onUpdateSetting,
}: StepClinicSettingsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const visibleSettings = useMemo(
    () => clinicSettings.filter((s) => s.isAdminFacing !== false),
    [clinicSettings]
  );

  const filteredSettings = useMemo(() => {
    if (selectedCategory === 'all') return visibleSettings;
    return visibleSettings.filter((s) => s.category === selectedCategory);
  }, [visibleSettings, selectedCategory]);

  return (
    <div className='flex flex-col gap-3.5'>
      {/* Category Pills */}
      <div className='flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none'>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = visibleSettings.filter(
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
                  isSelected
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted-foreground/20'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Settings list - Natural layout hugging */}
      <div className='flex flex-col gap-2.5 max-h-[58vh] overflow-y-auto pr-1'>
        {filteredSettings.map((setting) => {
          const controlType =
            setting.controlType ??
            (typeof setting.value === 'boolean'
              ? 'boolean'
              : typeof setting.value === 'number'
              ? 'number'
              : 'text');

          return (
            <div
              key={setting.key}
              className='p-3.5 rounded-xl border border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-border transition-colors'
            >
              <div className='flex flex-col gap-0.5 min-w-0 flex-1 pr-2'>
                <span className='font-semibold text-xs sm:text-sm text-foreground'>
                  {setting.label}
                </span>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  {setting.description}
                </p>
              </div>

              <div className='flex items-center shrink-0 self-end sm:self-center'>
                {controlType === 'boolean' ? (
                  <Switch
                    checked={Boolean(setting.value)}
                    onCheckedChange={(checked) =>
                      onUpdateSetting(setting.key, checked)
                    }
                    aria-label={setting.label}
                  />
                ) : controlType === 'select' &&
                  setting.options &&
                  setting.options.length > 0 ? (
                  <Select
                    value={String(setting.value)}
                    onValueChange={(val) => onUpdateSetting(setting.key, val)}
                  >
                    <SelectTrigger className='h-8.5 min-w-[170px] sm:min-w-[210px] text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {setting.options.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className='text-xs'
                        >
                          <div className='flex items-center gap-2'>
                            {opt.flagCode && (
                              <img
                                src={`https://flagcdn.com/w40/${opt.flagCode.toLowerCase()}.png`}
                                alt={opt.label}
                                className='w-4 h-3 object-cover rounded-2xs border border-border/50 shrink-0'
                                loading='lazy'
                              />
                            )}
                            <span className='truncate'>{opt.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : controlType === 'number' ? (
                  <div className='flex items-center rounded-lg border border-border/80 bg-background shadow-2xs overflow-hidden h-8.5 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]'>
                    <input
                      type='number'
                      value={setting.value}
                      min={setting.min}
                      max={setting.max}
                      step={setting.step ?? 1}
                      onChange={(e) =>
                        onUpdateSetting(setting.key, Number(e.target.value))
                      }
                      className={`h-full text-center font-mono font-medium text-xs bg-transparent border-0 outline-none px-2 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        setting.unit ? 'w-16' : 'w-20'
                      }`}
                    />
                    {setting.unit && (
                      <span className='px-2.5 h-full flex items-center text-[11px] font-medium text-muted-foreground bg-muted/40 border-l border-border/50 select-none'>
                        {setting.unit}
                      </span>
                    )}
                  </div>
                ) : (
                  <Input
                    type='text'
                    value={String(setting.value)}
                    onChange={(e) =>
                      onUpdateSetting(setting.key, e.target.value)
                    }
                    className='h-8.5 w-36 sm:w-44 text-xs'
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
