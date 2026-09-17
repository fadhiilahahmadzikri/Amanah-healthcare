const DEFAULT_REDIRECT_PATH = '/dashboard';

export function safeRedirect(
  path: string | null | undefined,
  fallback = DEFAULT_REDIRECT_PATH
): string {
  if (!path) return fallback;

  try {
    // Standard relative path check: must start with / and not //
    if (path.startsWith('/') && !path.startsWith('//')) {
      return path;
    }

    // If a full URL is provided, ensure it belongs to the same origin
    if (path.startsWith('http://') || path.startsWith('https://')) {
      const url = new URL(path);
      if (typeof window !== 'undefined' && url.origin === window.location.origin) {
        return url.pathname + url.search + url.hash;
      }
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export function getRoleLandingPath(role?: string | null): string {
  if (role === 'admin') {
    return '/dashboard/admin';
  }
  return '/dashboard/klinik/antrean';
}
