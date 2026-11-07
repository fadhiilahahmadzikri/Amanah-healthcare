'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { chatApiService } from '../../api/chat-api-service';
import { useChatStore } from '../../utils/store';
import { ChatPanelHeader } from '../molecules/chat-panel-header';
import { ChatCandidateItem } from '../molecules/chat-candidate-item';
import type { ChatCandidateUser } from '../../utils/types';

export interface ChatNewConversationPanelProps {
  open: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * Master Slide-In New Conversation Panel Organism
 * Full-height overlay sliding from left to right covering the sidebar.
 * Enables initiating new conversations with external patients.
 */
export function ChatNewConversationPanel({
  open,
  onClose,
  className
}: ChatNewConversationPanelProps) {
  const queryClient = useQueryClient();
  const selectConversation = useChatStore((state) => state.selectConversation);
  const upsertConversation = useChatStore((state) => state.upsertConversation);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset search when panel closes
  useEffect(() => {
    if (!open) {
      setSearch('');
      setDebouncedSearch('');
      setSelectedCandidateId(null);
    }
  }, [open]);

  // Fetch candidate patients
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['admin', 'chat', 'candidates', debouncedSearch],
    queryFn: async () => {
      const res = await chatApiService.getCandidates(debouncedSearch.trim() || undefined);
      return res.data ?? [];
    },
    enabled: open
  });

  // Create conversation mutation
  const createMutation = useMutation({
    mutationFn: async (userId: string) => {
      return chatApiService.createAdminConversation(userId);
    },
    onSuccess: (newConv) => {
      upsertConversation(newConv);
      selectConversation(newConv.id);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'chat', 'conversations'] });
      onClose();
      toast.success('Percakapan baru siap dimulai.');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      toast.error(`Gagal memulai percakapan: ${msg}`);
      setSelectedCandidateId(null);
    }
  });

  const handleSelectCandidate = (candidate: ChatCandidateUser) => {
    setSelectedCandidateId(candidate.id);
    if (candidate.existingConversationId) {
      selectConversation(candidate.existingConversationId);
      onClose();
      return;
    }

    createMutation.mutate(candidate.id);
  };

  return (
    <div
      aria-hidden={!open}
      className={cn(
        'absolute inset-0 z-30 bg-card flex flex-col min-w-0 transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full pointer-events-none',
        className
      )}
    >
      {/* 1. Header */}
      <ChatPanelHeader
        title='Chat Baru'
        subtitle={`${candidates.length} Pasien Terdaftar`}
        onBack={onClose}
      />

      {/* 2. Search Input */}
      <div className='p-3 pb-2 shrink-0 border-b border-border/40'>
        <div className='relative w-full'>
          <span className='absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-muted-foreground'>
            <Icons.search className='size-4' />
          </span>
          <input
            type='text'
            aria-label='Cari pasien'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Cari nama atau email pasien...'
            className='w-full h-9 pl-9 pr-8 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/70 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-2xs'
          />
          {search && (
            <button
              type='button'
              onClick={() => setSearch('')}
              className='absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-md hover:bg-muted transition-colors'
              title='Hapus pencarian'
              aria-label='Hapus pencarian'
            >
              <Icons.close className='size-3.5' />
            </button>
          )}
        </div>
      </div>

      {/* 3. Candidate List */}
      <div className='flex-1 overflow-y-auto divide-y divide-border/30'>
        {isLoading ? (
          <div className='p-4 space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-3 animate-pulse'>
                <div className='size-9 rounded-full bg-muted/60 shrink-0' />
                <div className='flex-1 space-y-1.5'>
                  <div className='h-3 w-28 bg-muted/60 rounded' />
                  <div className='h-2.5 w-40 bg-muted/40 rounded' />
                </div>
              </div>
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <EmptyState
            icon={Icons.user}
            title='Tidak ada pasien ditemukan'
            description={
              search
                ? `Tidak ditemukan pasien dengan kata kunci "${search}".`
                : 'Belum ada pasien terdaftar untuk dihubungi.'
            }
            className='min-h-[220px] border-0 bg-transparent px-3'
          />
        ) : (
          candidates.map((candidate) => (
            <ChatCandidateItem
              key={candidate.id}
              candidate={candidate}
              onClick={() => handleSelectCandidate(candidate)}
              isLoading={createMutation.isPending && selectedCandidateId === candidate.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
