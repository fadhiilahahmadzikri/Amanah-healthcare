'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { resolveCardTheme, CARD_THEME_TOKENS } from './theme-tokens';
import { StackedCardShelter } from './atoms/stacked-card-shelter';
import { SurfaceCoreOrganism } from './atoms/surface-core-organism';
import { AccentBannerLip } from './atoms/accent-banner-lip';
import { EntityCardIdentity } from './atoms/entity-card-identity';
import { EntityCardFooter } from './atoms/entity-card-footer';
import { getStatusConfig } from '@/styles/clinical-tokens';
import type { MasterEntityCardProps } from './types';

/**
 * MasterEntityCard
 * Agnostic master card component based on card-stack-v2 (Bottom Lip Variant).
 * Shared across Doctor Management, Staff Management, and extensible for any
 * other entity card across Amanah Healthcare web applications.
 */
export function MasterEntityCard({
  status = 'OPEN',
  statusLabel,
  statusVariant,
  themeTokenOverride,
  isSelected,
  isPending,
  variant: _variant = 'default',
  name = '',
  subtitle,
  avatarUrl,
  showAvatar,
  initials,
  trailingImage,
  headerSlot,
  identitySlot,
  contentSlot,
  bottomLipSlot,
  secondaryAction,
  primaryAction,
  showActions = true,
  onCardClick,
  onTitleClick,
  children,
  className,
  noShadow,
  disableHoverAnimate
}: MasterEntityCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSelected]);

  // Resolve theme token (Priority: Direct override -> Named variant -> Status resolver)
  const effectiveThemeToken = React.useMemo(() => {
    if (themeTokenOverride) return themeTokenOverride;
    if (statusVariant && CARD_THEME_TOKENS[statusVariant]) {
      return CARD_THEME_TOKENS[statusVariant];
    }
    return resolveCardTheme(status);
  }, [status, statusVariant, themeTokenOverride]);

  // Dual mode visual resolution (SSR-safe, default to dark for consistency with card-stack-v2)
  const isDark = mounted ? resolvedTheme === 'dark' : true;
  const currentVisuals = isDark ? effectiveThemeToken.dark : effectiveThemeToken.light;

  // Resolve label from statusLabel prop or centralized clinical config
  const displayLabel = React.useMemo(() => {
    if (statusLabel) return statusLabel;
    const config = getStatusConfig(status);
    return config.label;
  }, [status, statusLabel]);

  const effectiveInitials = initials || '';

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

  const isLeave = status.toUpperCase().includes('CUTI') || status.toUpperCase().includes('LEAVE');

  return (
    <StackedCardShelter
      cardRef={cardRef}
      visuals={currentVisuals}
      isSelected={isSelected}
      isPending={isPending}
      onClick={handleContainerClick}
      className={className}
      noShadow={noShadow}
      disableHoverAnimate={disableHoverAnimate}
      mainBodySlot={
        <SurfaceCoreOrganism>
          {trailingImage}

          {/* Upper Body Stack (Identity + Content) */}
          <div className='flex-1 flex flex-col min-w-0'>
            {/* Optional Header Slot */}
            {headerSlot}

            {/* Identity Section (Custom slot or standard Identity Atom) */}
            {identitySlot ? (
              identitySlot
            ) : name ? (
              <EntityCardIdentity
                name={name}
                subtitle={subtitle}
                avatarUrl={avatarUrl}
                showAvatar={showAvatar}
                initials={effectiveInitials}
                onNameClick={handleTitleClick}
                isPending={isPending}
              />
            ) : null}

            {/* Middle Content Slot */}
            {contentSlot && (
              <div className='mt-2.5 sm:mt-2 relative z-20 min-w-0'>{contentSlot}</div>
            )}

            {/* Arbitrary children if provided */}
            {children}
          </div>

          {/* Action Buttons Footer with comfortable gutter */}
          {showActions && (secondaryAction || primaryAction) && (
            <EntityCardFooter secondaryAction={secondaryAction} primaryAction={primaryAction} />
          )}
        </SurfaceCoreOrganism>
      }
      bottomLipSlot={
        bottomLipSlot ? (
          bottomLipSlot
        ) : (
          <AccentBannerLip
            label={displayLabel}
            visuals={currentVisuals}
            iconName={isLeave ? 'calendar' : 'none'}
          />
        )
      }
    />
  );
}
