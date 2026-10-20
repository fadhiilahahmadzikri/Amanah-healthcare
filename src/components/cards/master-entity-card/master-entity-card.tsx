'use client';

import React from 'react';
import { EntityCardStatusLip } from './atoms/entity-card-status-lip';
import { EntityCardFrame, EntityCardInnerStitchFrame } from './atoms/entity-card-frame';
import { EntityCardIdentity } from './atoms/entity-card-identity';
import { EntityCardFooter } from './atoms/entity-card-footer';
import type { MasterEntityCardProps } from './types';

export function MasterEntityCard({
  status,
  statusLabel,
  statusVariant,
  isSelected,
  isPending,
  variant = 'default',
  name,
  subtitle,
  avatarUrl,
  initials,
  trailingImage,
  contentSlot,
  secondaryAction,
  primaryAction,
  showActions = true,
  onCardClick,
  onTitleClick,
  className
}: MasterEntityCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSelected]);

  const effectiveInitials = React.useMemo(() => {
    if (initials) return initials;
    const raw = (name || '').replace(/^(dr|drg|prof)\.\s*/i, '').trim();
    const parts = raw.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || 'U').toUpperCase();
  }, [name, initials]);

  const handleContainerClick = () => {
    onCardClick?.();
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTitleClick) {
      onTitleClick(e);
    } else {
      onCardClick?.();
    }
  };

  return (
    <EntityCardFrame
      cardRef={cardRef}
      isSelected={isSelected}
      isPending={isPending}
      variant={variant}
      onCardClick={handleContainerClick}
      className={className}
    >
      {/* 1. TOP STATUS LIP (Bibir Status Atas dengan PixelTexture) */}
      <EntityCardStatusLip status={status} label={statusLabel} variant={statusVariant} />

      {/* 2. MAIN CARD BODY */}
      <div className='p-1.5 sm:p-2 flex flex-col flex-1'>
        {/* Optional Trailing Avatar / Watermark */}
        {trailingImage}

        {/* Inner Dashed Stitch Frame (Motif Jahitan Klinis) */}
        <EntityCardInnerStitchFrame>
          {/* Section 1: Identity (Avatar + Name & Subtitle) */}
          <EntityCardIdentity
            name={name}
            subtitle={subtitle}
            avatarUrl={avatarUrl}
            initials={effectiveInitials}
            onNameClick={handleTitleClick}
            isPending={isPending}
          />

          {/* Section 2: Middle Content Slot (Antrean, Status Cuti, Kehadiran, Kontak, dll.) */}
          {contentSlot && <div className='mt-2.5 sm:mt-2 relative z-20 min-w-0'>{contentSlot}</div>}

          {/* Section 3: Footer Actions (Rata kanan dengan tombol sekunder & tombol utama) */}
          {showActions && (
            <EntityCardFooter secondaryAction={secondaryAction} primaryAction={primaryAction} />
          )}
        </EntityCardInnerStitchFrame>
      </div>
    </EntityCardFrame>
  );
}
