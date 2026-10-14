'use client';

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Conversation } from '../utils/types';

interface PatientCrmSidebarProps {
  conversation?: Conversation;
  onCloseConversation?: (conversationId: string) => void;
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast.success(`${label} disalin ke clipboard`);
}

export function PatientCrmSidebar({ conversation, onCloseConversation }: PatientCrmSidebarProps) {
  if (!conversation) {
    return (
      <aside className='w-[280px] bg-card flex flex-col overflow-y-auto p-4 shrink-0 select-none border-l border-border/60'>
        <EmptyState
          icon={Icons.user}
          title='Belum ada profil'
          description='Profil pasien akan ditampilkan setelah percakapan dipilih.'
          className='h-full min-h-[300px] border-0 bg-transparent px-2'
        />
      </aside>
    );
  }

  const initials =
    conversation.customerName
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '-';

  const isGuest = !conversation.userId && Boolean(conversation.guestId);
  const isOpen = conversation.status === 'open';

  return (
    <aside className='w-[280px] bg-card flex flex-col justify-between overflow-y-auto p-4 shrink-0 select-none border-l border-border/60'>
      <div className='flex flex-col items-center text-center'>
        {/* Avatar & Name */}
        <Avatar className='size-[56px] rounded-full ring-2 ring-primary/20 shadow-xs mt-2'>
          <AvatarFallback className='text-sm font-bold bg-primary/10 text-primary'>
            {initials}
          </AvatarFallback>
        </Avatar>

        <h3 className='text-xs font-bold text-foreground mt-2.5 leading-tight'>
          {conversation.customerName || 'Pasien'}
        </h3>

        <div className='mt-1 flex items-center gap-1.5'>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[9px] font-semibold border',
              isGuest
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                : 'bg-primary/10 text-primary border-primary/20'
            )}
          >
            {isGuest ? 'Tamu Publik' : 'Pasien Terdaftar'}
          </span>

          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[9px] font-semibold border',
              isOpen
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
            )}
          >
            {isOpen ? 'Aktif' : 'Selesai'}
          </span>
        </div>

        {/* Contact Information Cards */}
        <div className='w-full mt-4 space-y-2 text-left'>
          {conversation.medicalRecordNumber && (
            <div className='p-2 rounded-[6px] bg-background border border-border/60'>
              <div className='text-[9.5px] text-muted-foreground'>No. Rekam Medis (RM)</div>
              <div className='text-[11px] font-mono font-medium text-foreground flex items-center justify-between mt-0.5'>
                <span>{conversation.medicalRecordNumber}</span>
                <button
                  type='button'
                  onClick={() => copyToClipboard(conversation.medicalRecordNumber!, 'No. RM')}
                  className='text-muted-foreground hover:text-foreground'
                  title='Salin No. RM'
                >
                  <Icons.copy className='size-3' />
                </button>
              </div>
            </div>
          )}

          <div className='p-2 rounded-[6px] bg-background border border-border/60'>
            <div className='text-[9.5px] text-muted-foreground'>Email</div>
            <div className='text-[11px] font-medium text-foreground flex items-center justify-between mt-0.5 truncate'>
              <span className='truncate mr-1'>
                {conversation.customerEmail || conversation.guestEmail || '-'}
              </span>
              {(conversation.customerEmail || conversation.guestEmail) && (
                <button
                  type='button'
                  onClick={() =>
                    copyToClipboard(conversation.customerEmail || conversation.guestEmail!, 'Email')
                  }
                  className='text-muted-foreground hover:text-foreground shrink-0'
                  title='Salin Email'
                >
                  <Icons.copy className='size-3' />
                </button>
              )}
            </div>
          </div>

          {conversation.customerPhone && (
            <div className='p-2 rounded-[6px] bg-background border border-border/60'>
              <div className='text-[9.5px] text-muted-foreground'>Nomor Telepon</div>
              <div className='text-[11px] font-medium text-foreground flex items-center justify-between mt-0.5'>
                <span>{conversation.customerPhone}</span>
                <button
                  type='button'
                  onClick={() => copyToClipboard(conversation.customerPhone!, 'No. Telepon')}
                  className='text-muted-foreground hover:text-foreground'
                  title='Salin No. Telepon'
                >
                  <Icons.copy className='size-3' />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action footer */}
      {isOpen && onCloseConversation && (
        <div className='pt-4 border-t border-border/60'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onCloseConversation(conversation.id)}
            className='w-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 h-8 font-medium'
          >
            <Icons.check className='size-3.5 mr-1' />
            <span>Tandai Selesai</span>
          </Button>
        </div>
      )}
    </aside>
  );
}
