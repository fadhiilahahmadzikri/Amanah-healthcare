'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CLINICAL_HISTORY_TAB, type ClinicalHistoryTabType } from '../../api/history-queries';
import { cn } from '@/lib/utils';

export interface ClinicalHistoryCategoryTabsProps {
  activeTab: ClinicalHistoryTabType;
  onSelectTab: (tab: ClinicalHistoryTabType) => void;
  totalMaternal: number;
  totalImmunization: number;
  className?: string;
}

export function ClinicalHistoryCategoryTabs({
  activeTab,
  onSelectTab,
  totalMaternal,
  totalImmunization,
  className
}: ClinicalHistoryCategoryTabsProps) {
  const isMaternalActive = activeTab === CLINICAL_HISTORY_TAB.MATERNITY;
  const isImmunizationActive = activeTab === CLINICAL_HISTORY_TAB.IMMUNIZATION;

  return (
    <div
      className={cn(
        'w-full overflow-x-auto scrollbar-none touch-pan-x py-0.5 select-none',
        className
      )}
    >
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val) {
            onSelectTab(val as ClinicalHistoryTabType);
          }
        }}
        className='w-max'
      >
        <TabsList className='bg-muted/50 p-1 rounded-xl w-max flex flex-nowrap shrink-0 h-auto gap-1 border border-border/40 shadow-2xs'>
          <TabsTrigger
            value={CLINICAL_HISTORY_TAB.MATERNITY}
            className='rounded-lg text-xs font-semibold px-3.5 py-1.5 gap-2 transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs cursor-pointer select-none shrink-0 whitespace-nowrap'
          >
            <span>Kehamilan & Persalinan</span>
            <Badge
              variant={isMaternalActive ? 'default' : 'secondary'}
              className={cn(
                'h-4.5 px-1.5 text-[10px] font-bold transition-colors select-none shrink-0',
                isMaternalActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted-foreground/15 text-muted-foreground'
              )}
            >
              {totalMaternal}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value={CLINICAL_HISTORY_TAB.IMMUNIZATION}
            className='rounded-lg text-xs font-semibold px-3.5 py-1.5 gap-2 transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs cursor-pointer select-none shrink-0 whitespace-nowrap'
          >
            <span>Imunisasi Anak</span>
            <Badge
              variant={isImmunizationActive ? 'default' : 'secondary'}
              className={cn(
                'h-4.5 px-1.5 text-[10px] font-bold transition-colors select-none shrink-0',
                isImmunizationActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted-foreground/15 text-muted-foreground'
              )}
            >
              {totalImmunization}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
