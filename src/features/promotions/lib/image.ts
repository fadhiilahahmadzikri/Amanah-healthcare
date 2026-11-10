export const DEFAULT_ALLOWED_PROMO_HOSTS = [
  'drive.google.com',
  'lh3.googleusercontent.com',
  'cdn.discordapp.com',
  'media.discordapp.net',
];

export interface NormalizedImageResult {
  value: string;
  isDiscord: boolean;
  discordExpiresAt?: Date | null;
  error?: string | null;
}

/**
 * Normalizes input image URLs (Google Drive share links, Discord CDN, direct URLs).
 * Rejects insecure HTTP, data:, javascript:, and blob: schemes.
 */
export function normalizeImageInput(input: string): NormalizedImageResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { value: '', isDiscord: false, error: 'URL gambar tidak boleh kosong' };
  }

  // Reject dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('http://') ||
    lower.startsWith('data:') ||
    lower.startsWith('javascript:') ||
    lower.startsWith('blob:')
  ) {
    return {
      value: trimmed,
      isDiscord: false,
      error: 'Protokol tidak diizinkan. Gambar harus berupa HTTPS atau path statis /promo/...',
    };
  }

  // Static path
  if (trimmed.startsWith('/promo/')) {
    return { value: trimmed, isDiscord: false };
  }

  // Google Drive format 1: drive.google.com/file/d/<ID>/view
  const driveFileMatch = trimmed.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
  );
  if (driveFileMatch) {
    return {
      value: `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w1600`,
      isDiscord: false,
    };
  }

  // Google Drive format 2: drive.google.com/open?id=<ID> or drive.google.com/uc?id=<ID>
  const driveIdMatch = trimmed.match(
    /drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([a-zA-Z0-9_-]+)/i,
  );
  if (driveIdMatch) {
    return {
      value: `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=w1600`,
      isDiscord: false,
    };
  }

  // Discord attachments
  const isDiscord =
    lower.includes('cdn.discordapp.com') || lower.includes('media.discordapp.net');
  let discordExpiresAt: Date | null = null;

  if (isDiscord) {
    try {
      const parsed = new URL(trimmed);
      const exParam = parsed.searchParams.get('ex');
      if (exParam) {
        const timestampSec = parseInt(exParam, 16);
        if (!isNaN(timestampSec) && timestampSec > 0) {
          discordExpiresAt = new Date(timestampSec * 1000);
        }
      }
    } catch {
      // ignore URL parsing error
    }
  }

  return {
    value: trimmed,
    isDiscord,
    discordExpiresAt,
  };
}

/**
 * Checks whether the given hostname is allowed.
 */
export function isAllowedPromoHost(
  hostname: string,
  allowedHosts: string[] = DEFAULT_ALLOWED_PROMO_HOSTS,
): boolean {
  const lowerHost = hostname.toLowerCase();
  return allowedHosts.some(
    (allowed) => lowerHost === allowed.toLowerCase() || lowerHost.endsWith(`.${allowed.toLowerCase()}`),
  );
}

export function normalizeImageUrl(input: string): string {
  return normalizeImageInput(input).value;
}

export function isDiscordCdnExpired(url: string): boolean {
  const res = normalizeImageInput(url);
  if (!res.isDiscord) return false;
  if (!res.discordExpiresAt) return true;
  return res.discordExpiresAt.getTime() <= Date.now();
}

