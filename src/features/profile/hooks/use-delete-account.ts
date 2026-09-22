'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { deleteAccountAction } from '@/server/actions/auth.actions';

export interface UseDeleteAccountReturn {
  isDeleting: boolean;
  error: string | null;
  handleDeleteAccount: () => Promise<boolean>;
}

export function useDeleteAccount(): UseDeleteAccountReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = useCallback(async (): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      // 1. Invoke Server Action (supports both Canonical JWT & Better Auth session fallback)
      const res = await deleteAccountAction();

      if (!res.success) {
        const errorMsg =
          res.message || 'Gagal menghapus akun. Silakan hubungi layanan bantuan kami.';
        setError(errorMsg);
        toast.error(errorMsg);
        setIsDeleting(false);
        return false;
      }

      // 2. Clean client-side tokens and state
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          sessionStorage.clear();
        } catch {
          // Ignore storage access errors
        }
      }

      // 3. Clean Better Auth client session
      try {
        await authClient.signOut();
      } catch {
        // Ignore client signOut error
      }

      // 4. Success feedback
      toast.success(res.message || 'Akun Anda telah berhasil dihapus secara permanen dari sistem.');

      // 5. Hard redirect to sign-in with query param flag
      window.location.href = '/auth/sign-in?deleted=true';
      return true;
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Terjadi kendala sistem saat memproses penghapusan akun.';
      setError(msg);
      toast.error(msg);
      setIsDeleting(false);
      return false;
    }
  }, []);

  return {
    isDeleting,
    error,
    handleDeleteAccount
  };
}
