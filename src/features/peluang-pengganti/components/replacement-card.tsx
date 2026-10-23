'use client';

import React from 'react';
import { MasterEntityCard, EntityCardPrimaryAction } from '@/components/cards/master-entity-card';
import { formatClinicDate } from '@/lib/date-format';
import { REPLACEMENT_STATUS_CONFIG, getSessionTitle } from '../constants/replacement.constants';
import { ReplacementRouteBlock } from './replacement-route-block';
import type { ReplacementOpportunityItem } from '../api/types';

export interface ReplacementCardProps {
  opportunity: ReplacementOpportunityItem;
  onSelect: (item: ReplacementOpportunityItem) => void;
  isSelected?: boolean;
  className?: string;
  noShadow?: boolean;
  disableHoverAnimate?: boolean;
}

export function ReplacementCard({
  opportunity,
  onSelect,
  isSelected,
  className,
  noShadow = true,
  disableHoverAnimate = true
}: ReplacementCardProps) {
  const statusMeta = REPLACEMENT_STATUS_CONFIG[opportunity.status] || {
    label: opportunity.status,
    variant: 'amber' as const
  };

  const formattedDate = formatClinicDate(opportunity.workDate, { style: 'human_full' });
  const sessionName = getSessionTitle(opportunity.sessionCode);

  const handleContainerClick = () => {
    onSelect(opportunity);
  };

  const primaryAction = (
    <EntityCardPrimaryAction
      label='Lihat Detail'
      onClick={(e) => {
        e.stopPropagation();
        onSelect(opportunity);
      }}
      title='Lihat Detail Peluang Pengganti'
    />
  );

  return (
    <MasterEntityCard
      showAvatar={false}
      status={opportunity.status.toUpperCase()}
      statusLabel={statusMeta.label}
      statusVariant={statusMeta.variant}
      isSelected={isSelected}
      name={formattedDate}
      subtitle={
        opportunity.leaveReason ? (
          <p className='text-[12px] sm:text-[11.5px] xl:text-[11px] font-medium text-muted-foreground tracking-tight line-clamp-1 mt-0.5 truncate'>
            {opportunity.leaveReason}
          </p>
        ) : undefined
      }
      contentSlot={<ReplacementRouteBlock opportunity={opportunity} />}
      primaryAction={primaryAction}
      showActions={true}
      onCardClick={handleContainerClick}
      onTitleClick={(e) => {
        e.stopPropagation();
        onSelect(opportunity);
      }}
      className={className}
      noShadow={noShadow}
      disableHoverAnimate={disableHoverAnimate}
    />
  );
}
