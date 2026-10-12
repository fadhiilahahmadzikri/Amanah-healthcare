'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, UserX, Users } from 'lucide-react';
import type { QueueNavigationResponse } from '../../api/types';
import { cn } from '@/lib/utils';

interface QueueNavigationTabsProps {
  navigation?: QueueNavigationResponse;
  activeUnitId: string | null;
  activeDoctorId: string | null;
  onSelectUnit: (unitId: string) => void;
  onSelectDoctor: (doctorId: string | null) => void;
}

export function QueueNavigationTabs({
  navigation,
  activeUnitId,
  activeDoctorId,
  onSelectUnit,
  onSelectDoctor
}: QueueNavigationTabsProps) {
  if (!navigation || !navigation.units || navigation.units.length === 0) {
    return null;
  }

  const units = navigation.units;
  const currentUnit = units.find((u) => u.id === activeUnitId) || units[0];
  const effectiveUnitId = currentUnit?.id || '';

  const effectiveDoctorValue = activeDoctorId || 'all';

  return (
    <div className='flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-xs'>
      {/* Level 1: Clinic Unit Tabs */}
      <div className='flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between'>
        <Tabs
          value={effectiveUnitId}
          onValueChange={(val) => {
            if (val !== effectiveUnitId) {
              onSelectUnit(val);
            }
          }}
          className='w-full'
        >
          <TabsList className='h-9 w-full justify-start overflow-x-auto bg-muted/70 p-1 sm:w-auto'>
            {units.map((unit) => {
              const isActive = unit.id === effectiveUnitId;
              return (
                <TabsTrigger
                  key={unit.id}
                  value={unit.id}
                  className='gap-2 px-3 py-1 text-xs font-semibold sm:text-sm'
                >
                  <span>{unit.name}</span>
                  <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className={cn(
                      'h-4.5 px-1.5 text-[10px] font-bold transition-colors',
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/15'
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

      {/* Level 2: Doctor Queue Views within Active Unit */}
      {currentUnit && (
        <div className='border-t border-border/50 pt-2.5'>
          <Tabs
            value={effectiveDoctorValue}
            onValueChange={(val) => {
              if (val === 'all') {
                onSelectDoctor(null);
              } else {
                onSelectDoctor(val);
              }
            }}
            className='w-full'
          >
            <div className='flex items-center gap-2'>
              <span className='hidden text-xs font-medium text-muted-foreground lg:inline-block'>
                Antrean Dokter:
              </span>
              <TabsList className='h-8 w-full justify-start overflow-x-auto bg-muted/40 p-0.5 sm:w-auto'>
                {/* Tab: Semua */}
                <TabsTrigger
                  value='all'
                  className='gap-1.5 px-2.5 py-1 text-xs font-medium data-[state=active]:bg-background'
                >
                  <Users className='size-3.5 text-muted-foreground' />
                  <span>Semua</span>
                  <Badge variant='outline' className='h-4 px-1 text-[10px] font-semibold'>
                    {currentUnit.totalAppointments}
                  </Badge>
                </TabsTrigger>

                {/* Tab: Specific Doctors */}
                {currentUnit.doctors.map((doctor) => {
                  const isSelected = effectiveDoctorValue === doctor.id;
                  return (
                    <TabsTrigger
                      key={doctor.id}
                      value={doctor.id}
                      className='gap-1.5 px-2.5 py-1 text-xs font-medium data-[state=active]:bg-background'
                    >
                      <Stethoscope
                        className={cn(
                          'size-3.5',
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <span className='truncate max-w-[140px] sm:max-w-[200px]'>{doctor.name}</span>
                      <Badge
                        variant={doctor.activeQueues > 0 ? 'default' : 'secondary'}
                        className={cn(
                          'h-4 px-1 text-[10px] font-semibold',
                          doctor.activeQueues > 0 && !isSelected && 'bg-primary/20 text-primary'
                        )}
                      >
                        {doctor.totalAppointments}
                      </Badge>
                    </TabsTrigger>
                  );
                })}

                {/* Tab: Belum Ditugaskan (Unassigned) */}
                {currentUnit.unassignedCount > 0 && (
                  <TabsTrigger
                    value='unassigned'
                    className='gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-600 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-700 dark:text-amber-400 dark:data-[state=active]:text-amber-300'
                  >
                    <UserX className='size-3.5' />
                    <span>Belum Ditugaskan</span>
                    <Badge variant='destructive' className='h-4 px-1 text-[10px] font-bold'>
                      {currentUnit.unassignedCount}
                    </Badge>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
}
