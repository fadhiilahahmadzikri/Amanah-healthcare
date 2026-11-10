import { CLINIC_WHATSAPP_CONFIG } from '@/config/whatsapp.config';

export function isSafeHref(href?: string | null): boolean {
  if (!href) return false;
  const trimmed = href.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('blob:')) {
    return false;
  }

  // Reject protocol-relative URLs (e.g. //evil.com)
  if (trimmed.startsWith('//')) {
    return false;
  }

  // Safe internal path
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }

  // Safe HTTPS protocol
  if (lower.startsWith('https://')) {
    return true;
  }

  // Safe telephone protocol
  if (lower.startsWith('tel:')) {
    return true;
  }

  return false;
}

export function buildPromoWhatsAppUrl(
  phone: string = CLINIC_WHATSAPP_CONFIG.phoneNumber,
  message?: string,
): string {
  const cleanPhone = phone.replace(/\D/g, '') || CLINIC_WHATSAPP_CONFIG.phoneNumber;
  const defaultText = message || CLINIC_WHATSAPP_CONFIG.defaultMessage;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultText)}`;
}

export const isSafeCtaUrl = isSafeHref;
export const buildWhatsAppUrl = buildPromoWhatsAppUrl;

