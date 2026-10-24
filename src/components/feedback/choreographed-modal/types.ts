/**
 * Choreographed Notification Modal - Types & Contracts
 * Pure Domain DTOs, Agnostic Modal Configuration, and Theme Definitions.
 */

export type ModalVariantKey = 'success' | 'info' | 'warning' | 'error' | 'reward';
export type ChoreographyType = 'classic' | 'pulse' | 'vortex';
export type RayIntensity = 'soft' | 'normal' | 'vivid';

export interface ModalIdentityDto {
  avatarUrl?: string | null;
  name: string;
  role?: string | null;
  badgeText?: string | null;
}

export interface NotificationModalPayload {
  variant?: ModalVariantKey;
  choreography?: ChoreographyType;
  rayIntensity?: RayIntensity;
  statusText?: string;
  title: string;
  subtitle?: string;
  identity?: ModalIdentityDto;
  primaryBtnText?: string;
  secondaryBtnText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  autoCloseDurationMs?: number | null; // e.g. 8000ms, null for persistent
}

export interface VariantThemeDefinition {
  id: ModalVariantKey;
  name: string;
  statusText: string;
  titleDefault: string;
  subtitleDefault: string;
  primaryBtnDefault: string;
  secondaryBtnDefault?: string;
  confettiCount: number;
  iconType: 'check' | 'info' | 'warning' | 'error' | 'reward';
}

export const RAY_INTENSITIES: Record<RayIntensity, { id: RayIntensity; value: number; label: string }> = {
  soft: { id: 'soft', value: 0.05, label: 'Soft Rays' },
  normal: { id: 'normal', value: 0.095, label: 'Normal Rays' },
  vivid: { id: 'vivid', value: 0.16, label: 'Vivid Rays' }
};
