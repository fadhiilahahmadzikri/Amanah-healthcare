'use client';

import React from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import type { Conversation } from '../utils/types';

interface PatientCrmSidebarProps {
  conversation?: Conversation;
  onCloseConversation?: (conversationId: string) => void;
  onCloseProfile?: () => void;
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast.success(`${label} disalin ke clipboard`);
}

export function PatientCrmSidebar({
  conversation,
  onCloseConversation,
  onCloseProfile
}: PatientCrmSidebarProps) {
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

  const isGuest = !conversation.userId && Boolean(conversation.guestId);
  const isOpen = conversation.status === 'open';

  return (
    <aside className='w-[280px] bg-card flex flex-col justify-between overflow-y-auto p-4 shrink-0 select-none border-l border-border/60'>
      <div className='flex flex-col items-center text-center'>
        {/* Panel Header */}
        <div className='flex items-center justify-between w-full mb-1'>
          <span className='text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider'>
            Profil Pasien
          </span>
          {onCloseProfile && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={onCloseProfile}
              className='size-7 rounded-md text-muted-foreground hover:text-foreground cursor-pointer'
              title='Tutup Panel'
              aria-label='Tutup Panel'
            >
              <Icons.close className='size-3.5' />
            </Button>
          )}
        </div>

        {/* Avatar & Name */}
        <Avatar className='size-[56px] rounded-full ring-2 ring-primary/20 shadow-xs mt-1 overflow-hidden'>
          <AvatarImage
            src={
              conversation.userId
                ? `/api/v1/users/${conversation.userId}/avatar`
                : DEFAULT_AVATAR_PATH
            }
            alt={conversation.customerName || 'Pasien'}
            className='size-full object-cover aspect-square rounded-full'
          />
          <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
            <Image
              src={DEFAULT_AVATAR_PATH}
              alt={conversation.customerName || 'Pasien'}
              width={56}
              height={56}
              unoptimized
              className='size-full object-cover rounded-full aspect-square'
            />
          </AvatarFallback>
        </Avatar>

        <h3 className='text-xs font-bold text-foreground mt-2 leading-tight'>
          {conversation.customerName || 'Pasien'}
        </h3>

        {/* Clean plain-text with pipeline separator */}
        <div className='mt-1.5 flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-medium'>
          <span>{isGuest ? 'Tamu Publik' : 'Pasien Terdaftar'}</span>
          <Separator orientation='vertical' className='h-3 bg-border/80' />
          <span
            className={cn(
              isOpen ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'
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
              <span className='truncate mr-1'>{conversation.customerEmail || '-'}</span>
              {Boolean(conversation.customerEmail) && (
                <button
                  type='button'
                  onClick={() => copyToClipboard(conversation.customerEmail, 'Email')}
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
