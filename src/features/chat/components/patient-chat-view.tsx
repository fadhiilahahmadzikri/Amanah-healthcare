'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { useViewer } from '@/features/notifications/hooks/use-viewer';
import { emitAdminSocketEvent } from '@/features/notifications/hooks/use-notification-socket';
import { chatApiService } from '../api/chat-api-service';
import { CHAT_SENDER_ROLE, type ChatMessage, type Conversation } from '../utils/types';
import { ConsultationMessageItem } from './consultation-widget/consultation-message-item';

export function PatientChatView() {
  const viewer = useViewer();
  const searchParams = useSearchParams();
  const queryConversationId = searchParams?.get('conversationId') || searchParams?.get('id');

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const adminTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const patientTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch clinic presence periodically
  useEffect(() => {
    let active = true;
    const checkPresence = async () => {
      try {
        const res = await chatApiService.getPresence();
        if (active) setAdminOnline(res.adminOnline);
      } catch {
        // silent fallback
      }
    };
    checkPresence();
    const interval = setInterval(checkPresence, 20000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // 2. Initialize or fetch patient conversation
  const initPatientChat = useCallback(async () => {
    if (viewer.isLoading || !viewer.viewer?.id) return;
    setIsLoading(true);
    try {
      let activeConv: Conversation | null = null;
      if (queryConversationId) {
        const historyList = await chatApiService.getCustomerConversations();
        activeConv = historyList.find((c) => c.id === queryConversationId) || null;
      }

      if (!activeConv) {
        activeConv = await chatApiService.getOrCreateConversation({
          name: viewer.viewer?.name || undefined,
          email: viewer.viewer?.email || undefined
        });
      }

      setConversation(activeConv);

      const res = await chatApiService.getPatientMessages(activeConv.id);
      setMessages(res.data ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi error';
      toast.error(`Gagal memuat percakapan: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    viewer.isLoading,
    viewer.viewer?.id,
    viewer.viewer?.email,
    viewer.viewer?.name,
    queryConversationId
  ]);

  useEffect(() => {
    initPatientChat();
  }, [initPatientChat]);

  // 3. Join conversation room on mount and leave on unmount
  useEffect(() => {
    if (!conversation?.id) return;

    emitAdminSocketEvent('chat:join', { conversationId: conversation.id });

    return () => {
      emitAdminSocketEvent('chat:leave', { conversationId: conversation.id });
      if (adminTypingTimeoutRef.current) {
        clearTimeout(adminTypingTimeoutRef.current);
      }
      if (patientTypingTimeoutRef.current) {
        clearTimeout(patientTypingTimeoutRef.current);
      }
    };
  }, [conversation?.id]);

  // 5. Listen for real-time incoming chat messages
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRealtimeChatMessage = (event: CustomEvent<ChatMessage>) => {
      const incoming = event.detail;
      if (!incoming || !conversation?.id || incoming.conversationId !== conversation.id) {
        return;
      }

      setMessages((prev) => {
        if (
          prev.some(
            (m) =>
              m.id === incoming.id ||
              (m.clientMessageId && m.clientMessageId === incoming.clientMessageId)
          )
        ) {
          return prev;
        }
        return [...prev, incoming];
      });

      setIsAdminTyping(false);
      if (adminTypingTimeoutRef.current) {
        clearTimeout(adminTypingTimeoutRef.current);
      }
    };

    window.addEventListener('clinic:chat_message', handleRealtimeChatMessage as EventListener);

    return () => {
      window.removeEventListener('clinic:chat_message', handleRealtimeChatMessage as EventListener);
    };
  }, [conversation?.id]);

  // 6. Listen for real-time typing events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRealtimeTyping = (
      event: CustomEvent<{
        conversationId: string;
        senderRole: string;
        isTyping: boolean;
      }>
    ) => {
      const detail = event.detail;
      if (!detail || !conversation?.id || detail.conversationId !== conversation.id) {
        return;
      }
      if (detail.senderRole === CHAT_SENDER_ROLE.EXTERNAL) return;

      if (detail.isTyping) {
        setIsAdminTyping(true);
        if (adminTypingTimeoutRef.current) {
          clearTimeout(adminTypingTimeoutRef.current);
        }
        adminTypingTimeoutRef.current = setTimeout(() => {
          setIsAdminTyping(false);
        }, 3500);
      } else {
        setIsAdminTyping(false);
        if (adminTypingTimeoutRef.current) {
          clearTimeout(adminTypingTimeoutRef.current);
        }
      }
    };

    window.addEventListener('clinic:chat_typing', handleRealtimeTyping as EventListener);

    return () => {
      window.removeEventListener('clinic:chat_typing', handleRealtimeTyping as EventListener);
    };
  }, [conversation?.id]);

  // 7. Auto-scroll on new messages or typing indicator
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isAdminTyping]);

  // 8. Debounced patient typing emission
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (conversation?.id) {
      emitAdminSocketEvent('chat:typing', {
        conversationId: conversation.id,
        isTyping: true
      });

      if (patientTypingTimeoutRef.current) {
        clearTimeout(patientTypingTimeoutRef.current);
      }
      patientTypingTimeoutRef.current = setTimeout(() => {
        if (conversation?.id) {
          emitAdminSocketEvent('chat:typing', {
            conversationId: conversation.id,
            isTyping: false
          });
        }
      }, 1500);
    }
  };

  // 9. Send patient message (seamless auto-create if closed)
  const handleSendMessage = useCallback(async () => {
    if (isSending) return;
    const textToSend = inputText.trim();
    if (!textToSend) return;
    setInputText('');
    setIsSending(true);

    try {
      let targetConvId = conversation?.id;
      if (!targetConvId) {
        const freshConv = await chatApiService.getOrCreateConversation({
          name: viewer.viewer?.name || undefined,
          email: viewer.viewer?.email || undefined
        });
        setConversation(freshConv);
        targetConvId = freshConv.id;
      }

      if (targetConvId) {
        emitAdminSocketEvent('chat:typing', {
          conversationId: targetConvId,
          isTyping: false
        });
      }

      const saved = await chatApiService.sendPatientMessage(targetConvId, textToSend);
      setMessages((prev) => {
        if (
          prev.some(
            (m) =>
              m.id === saved.id ||
              (m.clientMessageId && m.clientMessageId === saved.clientMessageId)
          )
        ) {
          return prev;
        }
        return [...prev, saved];
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(`Gagal mengirim pesan: ${msg}`);
      setInputText(textToSend);
    } finally {
      setIsSending(false);
    }
  }, [inputText, conversation, isSending, viewer.viewer]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const patientName = viewer?.viewer?.name || 'Pasien';

  return (
    <div className='relative w-full h-full flex-1 min-h-0 bg-card border border-border/80 rounded-[10px] overflow-hidden shadow-xs flex flex-col select-none'>
      {/* 1. Top Header */}
      <header className='h-[56px] px-4 sm:px-6 border-b border-border/60 bg-card/80 flex items-center justify-between shrink-0 relative z-20'>
        <div className='flex items-center gap-3 min-w-0'>
          <Avatar className='size-9 rounded-full ring-1 ring-primary/20 overflow-hidden shrink-0'>
            <AvatarImage
              src={DEFAULT_AVATAR_PATH}
              alt='Amanah Healthcare'
              className='size-full object-cover aspect-square rounded-full'
            />
            <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
              <Image
                src={DEFAULT_AVATAR_PATH}
                alt='Amanah Healthcare'
                width={36}
                height={36}
                unoptimized
                className='size-full object-cover rounded-full aspect-square'
              />
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col min-w-0'>
            <span className='text-xs sm:text-sm font-bold text-foreground leading-tight truncate'>
              Amanah Healthcare
            </span>
            <div className='flex items-center gap-1.5 mt-0.5'>
              <span
                className={cn(
                  'size-1.5 rounded-full shrink-0',
                  adminOnline ? 'bg-emerald-500' : 'bg-zinc-400'
                )}
              />
              <span
                className={cn(
                  'text-[11px] font-medium leading-tight',
                  adminOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                )}
              >
                {adminOnline ? 'Staf Medis Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className='flex items-center gap-1.5' />
      </header>

      {/* 2. Messages Stream */}
      <div ref={scrollRef} className='flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-background/50'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center h-full text-xs text-muted-foreground gap-2'>
            <Icons.spinner className='size-5 animate-spin text-primary' />
            <span>Memuat riwayat konsultasi...</span>
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={Icons.chat}
            title={`Halo, ${patientName}!`}
            description='Ajukan pertanyaan seputar layanan klinik, jadwal konsultasi, atau informasi rekam medis Anda kepada admin kami.'
            className='h-full min-h-[300px] border-0 bg-transparent'
          />
        ) : (
          messages.map((m) => (
            <ConsultationMessageItem key={m.id} message={m} isAdmin={false} />
          ))
        )}
      </div>

      {/* 3. Text Composer (Always unlocked) with Floating Bare 3-Dot Indicator directly above it */}
      <div className='relative z-20 p-3 sm:p-4 border-t border-border/60 bg-card/95 backdrop-blur-md shrink-0'>
        {isAdminTyping && (
          <div className='absolute -top-6 left-4 sm:left-5 z-30 flex items-center gap-1.5 pointer-events-none animate-in fade-in duration-200'>
            <span className='size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]' />
            <span className='size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]' />
            <span className='size-2 rounded-full bg-primary animate-bounce' />
          </div>
        )}
        <div className='min-h-[44px] border border-border/80 rounded-xl flex items-center px-3 bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs transition-all gap-2'>
          <input
            type='text'
            aria-label='Tulis pesan konsultasi'
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder='Tulis pesan konsultasi Anda di sini...'
            className='flex-1 h-9 text-xs sm:text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent'
          />
          <Button
            type='button'
            size='sm'
            onClick={() => void handleSendMessage()}
            disabled={!inputText.trim() || isSending}
            className='h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-2xs shrink-0 cursor-pointer'
          >
            <span>Kirim</span>
            <Icons.arrowRight className='size-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
