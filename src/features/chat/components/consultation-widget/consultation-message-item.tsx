'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CHAT_SENDER_ROLE, type ChatMessage } from '../../utils/types';

interface ConsultationMessageItemProps {
  message: ChatMessage;
  isExpanded?: boolean;
  isAdmin?: boolean;
}

function formatMessageTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch {
    return '';
  }
}

export function ConsultationMessageItem({
  message,
  isExpanded,
  isAdmin = false
}: ConsultationMessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isMe = isAdmin
    ? message.senderRole === CHAT_SENDER_ROLE.INTERNAL
    : message.senderRole === CHAT_SENDER_ROLE.EXTERNAL;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.body);
    setCopied(true);
    toast.success('Pesan disalin ke clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const senderDisplayName = message.senderName || (isAdmin ? 'Pasien' : 'Admin Klinik');

  return (
    <div
      className={cn(
        'flex flex-col space-y-1',
        isMe ? 'items-end' : 'items-start'
      )}
    >
      {/* Sender Header */}
      <div className='flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground font-medium'>
        {!isMe ? (
          <span className='inline-flex items-center gap-1.5 font-bold text-foreground'>
            <Avatar className='size-4 rounded-full ring-1 ring-border/40 overflow-hidden shrink-0'>
              <AvatarImage
                src={message.senderUserId ? `/api/v1/users/${message.senderUserId}/avatar` : DEFAULT_AVATAR_PATH}
                alt={senderDisplayName}
                className='size-full object-cover rounded-full'
              />
              <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
                <Image
                  src={DEFAULT_AVATAR_PATH}
                  alt={senderDisplayName}
                  width={16}
                  height={16}
                  unoptimized
                  className='size-full object-cover rounded-full'
                />
              </AvatarFallback>
            </Avatar>
            <span>{senderDisplayName}</span>
          </span>
        ) : (
          <span>Anda</span>
        )}
        <span>•</span>
        <span className='tabular-nums'>{formatMessageTime(message.createdAt)}</span>
      </div>

      {/* Bubble Content */}
      <div
        className={cn(
          'p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs break-words transition-all duration-300',
          isExpanded ? 'max-w-[78%]' : 'max-w-[88%]',
          isMe
            ? 'bg-primary text-primary-foreground rounded-tr-xs font-normal'
            : 'bg-muted/40 text-foreground border border-border/60 rounded-tl-xs'
        )}
      >
        <span className='whitespace-pre-wrap'>{message.body}</span>
      </div>

      {/* Action Row for Other Party Messages */}
      {!isMe && (
        <div className='flex items-center gap-1 pt-0.5 px-1'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={handleCopy}
            className='h-6 px-2 text-[10.5px] text-muted-foreground hover:text-foreground gap-1'
          >
            {copied ? (
              <>
                <Icons.check className='size-3 text-emerald-500' />
                <span className='text-emerald-600 dark:text-emerald-400'>Tersalin</span>
              </>
            ) : (
              <>
                <Icons.copy className='size-3' />
                <span>Salin</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
