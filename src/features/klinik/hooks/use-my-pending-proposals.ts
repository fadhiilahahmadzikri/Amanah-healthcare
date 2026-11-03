'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientFetch } from '@/lib/client-fetch';
import { toast } from 'sonner';

export interface MyPendingProposal {
  id: string;
  appointmentId: string;
  proposalType: 'reschedule' | 'cancellation';
  status: 'pending';
  reason: string;
  originalDate: string;
  proposedDate: string | null;
  estimatedQueueNumber: number | null;
  bookingCode: string;
  patientName?: string | null;
  createdAt: string;
  expiresAt: string;
}

export function useMyPendingProposals() {
  const queryClient = useQueryClient();
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const {
    data: proposals = [],
    isLoading,
    refetch
  } = useQuery<MyPendingProposal[]>({
    queryKey: ['appointment-proposals', 'my-pending'],
    queryFn: async () => {
      try {
        const res = await clientFetch<MyPendingProposal[]>(
          '/api/v1/appointments/proposals/my-pending'
        );
        return Array.isArray(res) ? res : [];
      } catch {
        return [];
      }
    },
    staleTime: 10_000,
    refetchInterval: 30_000
  });

  // Listen to custom clinic event dispatched when socket receives proposal event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUpdate = () => {
      void queryClient.invalidateQueries({ queryKey: ['appointment-proposals'] });
    };

    window.addEventListener('clinic:appointment_updated', handleUpdate);
    return () => {
      window.removeEventListener('clinic:appointment_updated', handleUpdate);
    };
  }, [queryClient]);

  const respondMutation = useMutation({
    mutationFn: async ({
      proposalId,
      decision,
      notes
    }: {
      proposalId: string;
      decision: 'accepted' | 'declined';
      notes?: string;
    }) => {
      setRespondingId(proposalId);
      return clientFetch<{ success: boolean; message: string }>(
        `/api/v1/appointments/proposals/${proposalId}/respond`,
        {
          method: 'POST',
          body: JSON.stringify({ decision, notes })
        }
      );
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Tanggapan Anda telah dicatat.');
      void queryClient.invalidateQueries({ queryKey: ['appointment-proposals'] });
      void queryClient.invalidateQueries({ queryKey: ['appointments'] });
      void queryClient.invalidateQueries({ queryKey: ['klinik'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Gagal memproses tanggapan.';
      toast.error(msg);
    },
    onSettled: () => {
      setRespondingId(null);
    }
  });

  return {
    proposals,
    isLoading,
    refetch,
    respond: respondMutation.mutateAsync,
    isResponding: respondMutation.isPending,
    respondingId
  };
}
