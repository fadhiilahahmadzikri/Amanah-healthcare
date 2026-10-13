'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { QueueNavigationResponse } from '../api/types';
import { cn } from '@/lib/utils';

export interface ClinicCategoryTabsProps {
  navigation?: QueueNavigationResponse;
  activeUnitId: string | null;
  onSelectUnit: (unitId: string) => void;
  className?: string;
}

export function ClinicCategoryTabs({
  navigation,
  activeUnitId,
  onSelectUnit,
  className
}: ClinicCategoryTabsProps) {
  if (!navigation || !navigation.units || navigation.units.length === 0) {
    return null;
  }

  const units = navigation.units;
  const currentUnit = units.find((u) => u.id === activeUnitId) || units[0];
  const effectiveUnitId = currentUnit?.id || '';

  return (
    <div className={cn('w-full overflow-x-auto scrollbar-none touch-pan-x py-0.5 select-none', className)}>
      <Tabs
        value={effectiveUnitId}
        onValueChange={(val) => {
          if (val && val !== effectiveUnitId) {
            onSelectUnit(val);
          }
        }}
        className='w-max'
      >
        <TabsList className='bg-muted/50 p-1 rounded-xl w-max flex flex-nowrap shrink-0 h-auto gap-1 border border-border/40 shadow-2xs'>
          {units.map((unit) => {
            const isActive = unit.id === effectiveUnitId;
            return (
              <TabsTrigger
                key={unit.id}
                value={unit.id}
                className='rounded-lg text-xs font-semibold px-3.5 py-1.5 gap-2 transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs cursor-pointer select-none shrink-0 whitespace-nowrap'
              >
                <span>{unit.name}</span>
                <Badge
                  variant={isActive ? 'default' : 'secondary'}
                  className={cn(
                    'h-4.5 px-1.5 text-[10px] font-bold transition-colors select-none shrink-0',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/15 text-muted-foreground'
                  )}
                >
                  {unit.totalAppointments}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
