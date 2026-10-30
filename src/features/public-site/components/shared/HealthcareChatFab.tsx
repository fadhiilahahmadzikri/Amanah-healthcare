'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircleIcon } from 'lucide-react';
import { GuestChatModal } from '@/features/chat/components/guest-chat-modal';
import { useViewer } from '@/features/notifications/hooks/use-viewer';
import { AUDIENCE } from '@/core/auth/permissions.constants';

export function HealthcareChatFab() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const viewer = useViewer();

  const handleClick = () => {
    if (viewer?.userId) {
      if (viewer.audience === AUDIENCE.INTERNAL) {
        router.push('/admin/chat');
        return;
      }
      router.push('/klinik/chat');
      return;
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <button
        type='button'
        onClick={handleClick}
        className='
          fixed right-6 bottom-[92px] z-40 flex size-14 items-center justify-center
          rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20
          border border-primary-foreground/10
          transition-all duration-200 hover:bg-primary/90 hover:scale-105 active:scale-95
        '
        aria-label='Buka Live Chat Amanah Healthcare'
        title='Konsultasi Live Chat'
      >
        <MessageCircleIcon className='size-6' aria-hidden />
      </button>

      <GuestChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
