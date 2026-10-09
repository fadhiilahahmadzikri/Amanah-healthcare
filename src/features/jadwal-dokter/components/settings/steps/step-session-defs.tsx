'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import type { SessionDefConfig } from '../../../api/admin-schedule-configuration.api';

interface StepSessionDefsProps {
  sessionDefs: SessionDefConfig[];
  onToggleActive: (id: string) => void;
}

export function StepSessionDefs({ sessionDefs, onToggleActive }: StepSessionDefsProps) {
  return (
    <div className='flex flex-col gap-3.5'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {sessionDefs.map((def) => (
          <div
            key={def.id}
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 ${
              def.isActive
                ? 'border-border/90 bg-card shadow-xs'
                : 'border-border/40 bg-muted/15 opacity-75'
            }`}
          >
            <div className='flex items-center gap-3 min-w-0'>
              <div
                className={`size-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  def.isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-muted text-muted-foreground border border-border/50'
                }`}
              >
                {def.codePrefix}
              </div>
              <div className='flex flex-col min-w-0'>
                <div className='flex items-center gap-1.5'>
                  <span className='font-semibold text-sm text-foreground truncate'>
                    {def.label}
                  </span>
                </div>
                {def.timeRange && (
                  <span className='text-xs text-muted-foreground'>{def.timeRange}</span>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2 shrink-0 ml-2'>
              <Switch
                checked={def.isActive}
                onCheckedChange={() => onToggleActive(def.id)}
                aria-label={`Aktifkan shift ${def.label}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
