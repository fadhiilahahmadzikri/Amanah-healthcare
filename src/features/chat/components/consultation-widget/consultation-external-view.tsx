'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { io, type Socket } from 'socket.io-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { getClinicWhatsAppUrl } from '@/config/whatsapp.config';
import { useViewer } from '@/features/notifications/hooks/use-viewer';
import { getClientSocketUrl } from '@/core/config/env.client';
import { chatApiService } from '../../api/chat-api-service';
import { CHAT_SENDER_ROLE, type ChatMessage, type Conversation } from '../../utils/types';
import { ConsultationGuestForm } from './consultation-guest-form';
import { ConsultationHistoryDrawer } from './consultation-history-drawer';
import { ConsultationMessageItem } from './consultation-message-item';
import { toast } from 'sonner';

const GUEST_STORAGE_KEY = 'amanah_chat_guest';

interface GuestStorageData {
  guestId: string;
  name: string;
  email: string;
}

interface ConsultationExternalViewProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

export function ConsultationExternalView({
  isExpanded,
  onToggleExpand,
  onClose
}: ConsultationExternalViewProps) {
  const viewer = useViewer();
  const [showDrawer, setShowDrawer] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestStorageData | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const adminTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clientTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveGuestId = !viewer.viewer?.id ? guestInfo?.guestId : undefined;

  // 1. Load guest info from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) setGuestInfo(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  // 2. Fetch presence periodically
  useEffect(() => {
    let active = true;
    const checkPresence = async () => {
      try {
        const res = await chatApiService.getPresence();
        if (active) setAdminOnline(res.adminOnline);
      } catch {
        // silent
      }
    };
    checkPresence();
    const interval = setInterval(checkPresence, 20000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // 3. Load or initialize active conversation
  const loadActiveChat = useCallback(async () => {
    if (viewer.isLoading) return;
    if (!viewer.viewer?.id && !guestInfo) return;

    setIsLoading(true);
    try {
      const conv = await chatApiService.getOrCreateConversation({
        guestId: effectiveGuestId,
        name: viewer.viewer?.name || guestInfo?.name,
        email: viewer.viewer?.email || guestInfo?.email
      });
      setConversation(conv);

      const msgs = await chatApiService.getPatientMessages(conv.id, {
        guestId: effectiveGuestId
      });
      setMessages(msgs.data ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi error';
      toast.error(`Gagal memuat konsultasi: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [viewer.isLoading, viewer.viewer, guestInfo, effectiveGuestId]);

  useEffect(() => {
    loadActiveChat();
  }, [loadActiveChat]);

  // 4. Fetch conversation history when drawer opened
  useEffect(() => {
    if (!showDrawer || (!viewer.viewer?.id && !effectiveGuestId)) return;
    let active = true;
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const list = await chatApiService.getCustomerConversations(effectiveGuestId);
        if (active) setConversations(list ?? []);
      } catch {
        // ignore
      } finally {
        if (active) setIsHistoryLoading(false);
      }
    };
    fetchHistory();
    return () => {
      active = false;
    };
  }, [showDrawer, viewer.viewer?.id, effectiveGuestId]);

  // 5. Real-time WebSocket connection
  useEffect(() => {
    if (!conversation?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const baseUrl = getClientSocketUrl();
    if (!baseUrl) return;

    const socket: Socket = io(baseUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: async (cb) => {
        try {
          const res = await chatApiService.getRealtimeTicket(effectiveGuestId);
          if (res?.ticket) cb({ ticket: res.ticket });
          else cb({});
        } catch {
          cb({});
        }
      }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('chat:join', { conversationId: conversation.id });
    });

    socket.on('chat:message', (incoming: ChatMessage) => {
      if (!incoming || incoming.conversationId !== conversation.id) return;
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
    });

    socket.on(
      'chat:typing',
      (data: { conversationId: string; senderRole: string; isTyping: boolean }) => {
        if (data?.conversationId !== conversation.id) return;
        if (data?.senderRole === CHAT_SENDER_ROLE.EXTERNAL) return;

        if (data?.isTyping) {
          setIsAdminTyping(true);
          if (adminTypingTimeoutRef.current) clearTimeout(adminTypingTimeoutRef.current);
          adminTypingTimeoutRef.current = setTimeout(() => setIsAdminTyping(false), 3500);
        } else {
          setIsAdminTyping(false);
        }
      }
    );

    socket.on('chat:conversation_closed', (data: { conversationId: string }) => {
      if (data?.conversationId === conversation.id) {
        setConversation((prev) => (prev ? { ...prev, status: 'closed' } : prev));
      }
    });

    return () => {
      socket.emit('chat:leave', { conversationId: conversation.id });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversation?.id, effectiveGuestId]);

  // 6. Auto-scroll on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isAdminTyping]);

  const handleStartGuestChat = async (info: { name: string; email: string }) => {
    const newGuestId = typeof crypto !== 'undefined' ? crypto.randomUUID() : `g_${Date.now()}`;
    const payload: GuestStorageData = {
      guestId: newGuestId,
      name: info.name,
      email: info.email
    };
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
    setGuestInfo(payload);
  };

  const handleSelectSession = async (convId: string) => {
    setShowDrawer(false);
    setIsLoading(true);
    try {
      const msgs = await chatApiService.getPatientMessages(convId, {
        guestId: effectiveGuestId
      });
      const selected = conversations.find((c) => c.id === convId);
      if (selected) setConversation(selected);
      setMessages(msgs.data ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(`Gagal memuat sesi: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (socketRef.current?.connected && conversation?.id) {
      socketRef.current.emit('chat:typing', {
        conversationId: conversation.id,
        isTyping: true
      });
      if (clientTypingTimeoutRef.current) clearTimeout(clientTypingTimeoutRef.current);
      clientTypingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current?.connected && conversation?.id) {
          socketRef.current.emit('chat:typing', {
            conversationId: conversation.id,
            isTyping: false
          });
        }
      }, 1500);
    }
  };

  // Seamless auto-reconnect send: if conversation was closed, auto-recreate open session
  const handleSendMessage = async () => {
    if (isSending) return;
    const textToSend = inputText.trim();
    if (!textToSend) return;

    setInputText('');
    setIsSending(true);

    try {
      let targetConvId = conversation?.id;

      // If no active session or current is closed, seamlessly obtain/create an active session
      if (!targetConvId || conversation?.status === 'closed') {
        const freshConv = await chatApiService.getOrCreateConversation({
          guestId: effectiveGuestId,
          name: viewer.viewer?.name || guestInfo?.name,
          email: viewer.viewer?.email || guestInfo?.email
        });
        setConversation(freshConv);
        targetConvId = freshConv.id;
      }

      const saved = await chatApiService.sendPatientMessage(
        targetConvId,
        textToSend,
        effectiveGuestId
      );

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
  };

  return (
    <div className='size-full flex flex-col overflow-hidden animate-in fade-in duration-300 relative'>
      {/* 1. Header */}
      <div className='px-4 sm:px-5 py-3 border-b border-border/50 bg-card/95 backdrop-blur-md flex items-center justify-between shrink-0 relative z-20'>
        <div className='flex items-center gap-2.5 min-w-0'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant={showDrawer ? 'secondary' : 'ghost'}
                size='icon'
                onClick={() => setShowDrawer((prev) => !prev)}
                className='size-8 rounded-lg shrink-0'
              >
                <Icons.panelLeft className='size-4' />
                <span className='sr-only'>Riwayat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='text-xs'>
              Riwayat Percakapan
            </TooltipContent>
          </Tooltip>

          <div className='relative shrink-0'>
            <Avatar className='size-8 rounded-full ring-1 ring-border/40 overflow-hidden'>
              <AvatarImage
                src={DEFAULT_AVATAR_PATH}
                alt='Gary'
                className='size-full object-cover aspect-square rounded-full'
              />
              <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
                <Image
                  src={DEFAULT_AVATAR_PATH}
                  alt='Gary'
                  width={32}
                  height={32}
                  unoptimized
                  className='size-full object-cover rounded-full aspect-square'
                />
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 size-2 rounded-full ring-1.5 ring-background ${adminOnline ? 'bg-emerald-500' : 'bg-zinc-400'}`}
            />
          </div>

          <div className='min-w-0'>
            <h3 className='text-sm font-bold text-foreground tracking-tight'>Gary</h3>
            <div className='flex items-center gap-1.5 mt-0.5 text-[11px]'>
              <span className='text-muted-foreground truncate'>
                {adminOnline ? 'Staf Medis Online' : 'Klinik Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Header Controls */}
        <div className='flex items-center gap-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={getClinicWhatsAppUrl()}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-center size-8 rounded-lg text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors'
                aria-label='WhatsApp Klinik'
              >
                <Icons.whatsapp className='size-4' />
              </a>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='text-xs'>
              Chat WhatsApp Klinik
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onToggleExpand}
                className='size-8 rounded-lg text-muted-foreground hover:text-foreground'
              >
                {isExpanded ? <Icons.minimize className='size-3.5' /> : <Icons.maximize className='size-3.5' />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='text-xs'>
              {isExpanded ? 'Perkecil' : 'Perbesar'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onClose}
                className='size-8 rounded-lg text-muted-foreground hover:text-foreground'
              >
                <Icons.close className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='text-xs'>
              Tutup (Esc)
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* 2. Full-Height Sidebar Drawer */}
      {showDrawer && (
        <>
          <div
            onClick={() => setShowDrawer(false)}
            className='absolute inset-0 z-25 bg-background/40 backdrop-blur-[2px] animate-in fade-in duration-200 cursor-pointer'
          />
          <ConsultationHistoryDrawer
            conversations={conversations}
            activeConversationId={conversation?.id}
            onSelectSession={handleSelectSession}
            onClose={() => setShowDrawer(false)}
            isLoading={isHistoryLoading}
            isAdmin={false}
          />
        </>
      )}

      {/* 3. Body: Guest Onboarding OR Messages Stream */}
      {!viewer.viewer?.id && !guestInfo ? (
        <ConsultationGuestForm onStart={handleStartGuestChat} isLoading={isLoading} />
      ) : (
        <>
          <div className='flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-transparent via-background/40 to-background text-sm relative z-10 scroll-smooth'>
            {isLoading ? (
              <div className='flex flex-col items-center justify-center h-full text-xs text-muted-foreground gap-2'>
                <Icons.spinner className='size-5 animate-spin text-primary' />
                <span>Memuat sesi konsultasi...</span>
              </div>
            ) : messages.length === 0 ? (
              <EmptyState
                icon={Icons.chat}
                title='Mulai Konsultasi'
                description='Ketik pertanyaan Anda seputar layanan klinik, jadwal praktik, atau administrasi medis di bawah.'
                className='min-h-full border-0 bg-transparent'
              />
            ) : (
              messages.map((msg) => (
                <ConsultationMessageItem
                  key={msg.id}
                  message={msg}
                  isExpanded={isExpanded}
                  isAdmin={false}
                />
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 4. Minimalist Composer (ALWAYS UNLOCKED, seamless send) */}
          <div className='relative z-20 p-3 sm:p-4 border-t border-border/60 bg-card/95 backdrop-blur-md shrink-0 space-y-2'>
            {/* Floating Bare 3-Dot Bouncing Indicator (Unwrapped, strictly above message stream) */}
            {isAdminTyping && (
              <div className='absolute -top-6 left-4 sm:left-5 z-30 flex items-center gap-1.5 pointer-events-none animate-in fade-in duration-200'>
                <span className='size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]' />
                <span className='size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]' />
                <span className='size-2 rounded-full bg-primary animate-bounce' />
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className='relative flex items-end gap-2 p-2 rounded-2xl border border-border/70 bg-background shadow-xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all'
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder='Tulis pesan konsultasi Anda...'
                className='w-full resize-none bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-32 min-h-[38px] leading-relaxed'
              />
              <Button
                type='submit'
                size='sm'
                disabled={!inputText.trim() || isSending}
                className='h-8 w-8 p-0 rounded-xl text-xs font-semibold shrink-0 shadow-2xs cursor-pointer'
              >
                <Icons.send className='size-3.5' />
                <span className='sr-only'>Kirim</span>
              </Button>
            </form>

            <div className='hidden sm:flex items-center justify-end text-[10.5px] text-muted-foreground px-1 gap-2'>
              <span>
                Kirim: <kbd className='font-mono'>Enter</kbd>
              </span>
              <span>•</span>
              <span>
                Baris baru: <kbd className='font-mono'>Shift+Enter</kbd>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
