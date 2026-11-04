import React from 'react';
import { ShiftIconDisplay } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-display';
import { cn } from '@/lib/utils';
import type {
  FacilityResource,
  FacilityUnitType,
  FacilityUnit,
  FacilityRoom,
  ServiceCategory,
  ClinicService,
  ClinicalIntakeForm,
  PatientRelationshipTypeItem
} from '../types/clinic-essentials.types';

export const ESSENTIAL_FALLBACK_ICONS: Record<FacilityResource, string> = {
  'unit-types': 'layers',
  units: 'building-2',
  rooms: 'door-open',
  categories: 'folder',
  services: 'stethoscope',
  relationships: 'users',
  'blood-types': 'droplet',
  'education-levels': 'graduation-cap',
  religions: 'bookmark',
  occupations: 'briefcase',
};

/**
 * Agnostic helper to extract the representative icon from the first entity in a list,
 * or return the canonical fallback icon for that resource type.
 */
export function resolveEntityIconName<T extends { iconName?: string | null }>(
  items?: T[] | null,
  fallbackIcon: string = 'layers'
): string {
  const firstIcon = items?.[0]?.iconName?.trim();
  return firstIcon || fallbackIcon;
}

/**
 * Agnostic helper to resolve the first card's icon across all 6 clinic essentials.
 */
export function getEssentialFirstIcon(
  resource: FacilityResource,
  data: {
    unitTypes?: FacilityUnitType[];
    units?: FacilityUnit[];
    rooms?: FacilityRoom[];
    categories?: ServiceCategory[];
    services?: ClinicService[];
    forms?: ClinicalIntakeForm[];
    relationships?: PatientRelationshipTypeItem[];
  }
): string {
  switch (resource) {
    case 'unit-types':
      return resolveEntityIconName(data.unitTypes, ESSENTIAL_FALLBACK_ICONS['unit-types']);
    case 'units':
      return resolveEntityIconName(data.units, ESSENTIAL_FALLBACK_ICONS['units']);
    case 'rooms': {
      const firstRoomUnitId = data.rooms?.[0]?.unitId;
      const parentUnit = data.units?.find((u) => u.id === firstRoomUnitId);
      return parentUnit?.iconName?.trim() || ESSENTIAL_FALLBACK_ICONS['rooms'];
    }
    case 'categories':
      return resolveEntityIconName(data.categories, ESSENTIAL_FALLBACK_ICONS['categories']);
    case 'services':
      return resolveEntityIconName(data.services, ESSENTIAL_FALLBACK_ICONS['services']);
    case 'relationships':
      return resolveEntityIconName(data.relationships, ESSENTIAL_FALLBACK_ICONS['relationships']);
    case 'blood-types':
      return ESSENTIAL_FALLBACK_ICONS['blood-types'];
    case 'education-levels':
      return ESSENTIAL_FALLBACK_ICONS['education-levels'];
    case 'religions':
      return ESSENTIAL_FALLBACK_ICONS['religions'];
    case 'occupations':
      return ESSENTIAL_FALLBACK_ICONS['occupations'];
  }
}

/**
 * Agnostic renderer helper that renders the representative icon
 * for any essential resource cleanly without bulky wrappers.
 */
export function renderEssentialIcon(
  iconName: string | undefined | null,
  options?: {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    fallback?: string;
  }
): React.ReactNode {
  const effectiveIcon = iconName?.trim() || options?.fallback || 'layers';
  return (
    <ShiftIconDisplay
      icon={effectiveIcon}
      size={options?.size ?? 'sm'}
      bare
      className={options?.className}
    />
  );
}

/**
 * Agnostic bare icon component for card headers across all 6 essentials.
 * Eliminates bulky circular background bubbles and renders emojis / icons cleanly.
 */
export function EssentialCardIcon({
  iconName,
  fallback = 'layers',
  className
}: {
  iconName?: string | null;
  fallback?: string;
  className?: string;
}) {
  const effectiveIcon = iconName?.trim() || fallback;
  return (
    <div
      className={cn(
        'shrink-0 flex items-center justify-center text-xl leading-none select-none',
        className
      )}
    >
      <ShiftIconDisplay icon={effectiveIcon} size='lg' bare />
    </div>
  );
}
