'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useViewer } from '@/features/notifications/hooks/use-viewer';
import { emitAdminSocketEvent } from '@/features/notifications/hooks/use-notification-socket';
import { chatApiService } from '../api/chat-api-service';
import type { ChatMessage, Conversation } from '../utils/types';

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

export function PatientChatView() {
  const viewer = useViewer();
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
  useEffect(() => {
    let active = true;
    const initPatientChat = async () => {
      setIsLoading(true);
      try {
        const conv = await chatApiService.getOrCreateConversation();
        if (!active) return;
        setConversation(conv);

        const res = await chatApiService.getPatientMessages(conv.id);
        if (!active) return;
        setMessages(res.data || res.items || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Koneksi error';
        toast.error(`Gagal memuat percakapan: ${msg}`);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    initPatientChat();
    return () => {
      active = false;
    };
  }, []);

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

  // 4. Listen for real-time incoming chat messages
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

  // 5. Listen for real-time typing events from admin / clinic staff
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
      if (detail.senderRole === 'customer') return;

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

  // 6. Auto-scroll on new messages or typing indicator
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isAdminTyping]);

  // 7. Debounced patient typing emission
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

  // 8. Send patient message
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !conversation?.id || isSending) return;
    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    if (conversation?.id) {
      emitAdminSocketEvent('chat:typing', {
        conversationId: conversation.id,
        isTyping: false
      });
      if (patientTypingTimeoutRef.current) {
        clearTimeout(patientTypingTimeoutRef.current);
      }
    }

    try {
      const saved = await chatApiService.sendPatientMessage(conversation.id, textToSend);
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
  }, [inputText, conversation?.id, isSending]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const patientName = viewer?.viewer?.name || 'Pasien';

  return (
    <div className='w-full h-[calc(100vh-140px)] min-h-[580px] bg-card border border-border/80 rounded-[10px] overflow-hidden shadow-xs flex flex-col select-none'>
      {/* 1. Top Header */}
      <header className='h-[56px] px-4 sm:px-6 border-b border-border/60 bg-card/80 flex items-center justify-between shrink-0'>
        <div className='flex items-center gap-3'>
          <Avatar className='size-9 rounded-full ring-1 ring-primary/20 bg-primary/10 text-primary'>
            <AvatarFallback className='text-xs font-bold bg-transparent text-primary'>
              AH
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <span className='text-xs sm:text-sm font-bold text-foreground leading-tight'>
                Konsultasi & Layanan Amanah
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
                  adminOnline
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border-border/60'
                )}
              >
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    adminOnline ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'
                  )}
                />
                {adminOnline ? 'Admin Online' : 'Offline'}
              </span>
            </div>
            <span className='text-[11px] text-muted-foreground leading-tight mt-0.5'>
              Terhubung dengan tim administrasi & medis klinik
            </span>
          </div>
        </div>

        <div className='hidden sm:flex items-center gap-2 text-xs text-muted-foreground'>
          <Icons.lock className='size-3.5 text-primary' />
          <span>Privasi & Rekam Medis Terjaga</span>
        </div>
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
          messages.map((m) => {
            const isMe = m.senderRole === 'customer';
            return (
              <div
                key={m.id}
                className={cn(
                  'flex flex-col max-w-[85%] sm:max-w-[70%]',
                  isMe ? 'items-end self-end ml-auto' : 'items-start mr-auto'
                )}
              >
                <div
                  className={cn(
                    'rounded-[10px] px-3.5 py-2 text-xs leading-relaxed break-words shadow-2xs',
                    isMe
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border/70 text-foreground'
                  )}
                >
                  {m.body}
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5 tabular-nums',
                    isMe ? 'pr-1' : 'pl-1'
                  )}
                >
                  <span>{isMe ? 'Anda' : m.senderName || 'Admin Klinik'}</span>
                  <span>•</span>
                  <span>{formatMessageTime(m.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Typing Indicator */}
      {isAdminTyping && (
        <div className='px-4 sm:px-6 py-1.5 flex items-center gap-1.5 animate-in fade-in duration-200 bg-background/50'>
          <div className='flex items-center gap-1.5 bg-muted/70 px-2.5 py-1 rounded-full border border-border/50 text-[11px] text-muted-foreground'>
            <span>Admin klinik sedang mengetik</span>
            <span className='flex gap-0.5 items-center ml-0.5'>
              <span className='size-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]' />
              <span className='size-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]' />
              <span className='size-1 rounded-full bg-primary animate-bounce' />
            </span>
          </div>
        </div>
      )}

      {/* 4. Text Composer */}
      <div className='p-3 sm:p-4 border-t border-border/60 bg-card/80 shrink-0'>
        {conversation?.status === 'closed' ? (
          <div className='text-center py-1.5 text-xs text-muted-foreground'>
            Percakapan ini telah selesai. Anda dapat membuat konsultasi baru jika diperlukan.
          </div>
        ) : (
          <div className='h-[42px] border border-border/80 rounded-[8px] flex items-center px-3 bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 shadow-2xs transition-all'>
            <input
              type='text'
              aria-label='Tulis pesan konsultasi'
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder='Tulis pesan konsultasi Anda di sini...'
              className='flex-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent'
            />
            <Button
              size='sm'
              onClick={() => void handleSendMessage()}
              disabled={!inputText.trim() || isSending}
              className='h-7 px-3 rounded-[6px] text-xs font-semibold gap-1 ml-2 shadow-2xs'
            >
              <span>Kirim</span>
              <Icons.arrowRight className='size-3.5' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
