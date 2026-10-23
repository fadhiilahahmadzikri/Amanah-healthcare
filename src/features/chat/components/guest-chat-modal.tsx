'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getClientSocketUrl } from '@/core/config/env.client';
import { chatApiService } from '../api/chat-api-service';
import type { ChatMessage, Conversation } from '../utils/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface GuestChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUEST_STORAGE_KEY = 'amanah_chat_guest';

function formatMessageTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '';
  }
}

export function GuestChatModal({ isOpen, onClose }: GuestChatModalProps) {
  const [guestInfo, setGuestInfo] = useState<{
    guestId: string;
    name: string;
    email: string;
  } | null>(null);
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const adminTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clientTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load guest info from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) {
        setGuestInfo(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // 2. Fetch presence periodically
  useEffect(() => {
    if (!isOpen) return;
    const checkPresence = async () => {
      try {
        const res = await chatApiService.getPresence();
        setAdminOnline(res.adminOnline);
      } catch {
        // ignore
      }
    };
    checkPresence();
    const interval = setInterval(checkPresence, 15000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // 3. Load or init conversation when guest info is ready
  useEffect(() => {
    if (!isOpen || !guestInfo) return;

    let active = true;
    const initChat = async () => {
      setIsLoading(true);
      try {
        const conv = await chatApiService.getOrCreateConversation({
          guestId: guestInfo.guestId,
          name: guestInfo.name,
          email: guestInfo.email
        });
        if (!active) return;
        setConversation(conv);

        const msgs = await chatApiService.getPatientMessages(conv.id, {
          guestId: guestInfo.guestId
        });
        if (!active) return;
        setMessages(msgs.data || msgs.items || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Koneksi error';
        toast.error(`Gagal memuat percakapan: ${msg}`);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    initChat();
    return () => {
      active = false;
    };
  }, [isOpen, guestInfo]);

  // 4. Real-time WebSocket connection via single-use ticket
  useEffect(() => {
    if (!isOpen || !conversation?.id || !guestInfo?.guestId) {
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
          const res = await chatApiService.getRealtimeTicket(guestInfo.guestId);
          if (res?.ticket) {
            cb({ ticket: res.ticket });
          } else {
            cb({});
          }
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
      if (adminTypingTimeoutRef.current) {
        clearTimeout(adminTypingTimeoutRef.current);
      }
    });

    socket.on(
      'chat:typing',
      (data: { conversationId: string; senderRole: string; isTyping: boolean }) => {
        if (data?.conversationId !== conversation.id) return;
        if (data?.senderRole === 'customer') return;

        if (data?.isTyping) {
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
      }
    );

    return () => {
      socket.emit('chat:leave', { conversationId: conversation.id });
      socket.disconnect();
      socketRef.current = null;
      if (adminTypingTimeoutRef.current) {
        clearTimeout(adminTypingTimeoutRef.current);
      }
    };
  }, [isOpen, conversation?.id, guestInfo?.guestId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isAdminTyping]);

  const handleStartGuestChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || !inputEmail.trim()) {
      toast.error('Mohon isi nama dan email Anda');
      return;
    }

    const newGuestId = typeof crypto !== 'undefined' ? crypto.randomUUID() : `g_${Date.now()}`;
    const payload = {
      guestId: newGuestId,
      name: inputName.trim(),
      email: inputEmail.trim().toLowerCase()
    };

    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }

    setGuestInfo(payload);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (socketRef.current?.connected && conversation?.id) {
      socketRef.current.emit('chat:typing', {
        conversationId: conversation.id,
        isTyping: true
      });

      if (clientTypingTimeoutRef.current) {
        clearTimeout(clientTypingTimeoutRef.current);
      }
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

  const handleSendMessage = async () => {
    if (!inputText.trim() || !conversation || !guestInfo || isSending) return;
    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:typing', {
        conversationId: conversation.id,
        isTyping: false
      });
      if (clientTypingTimeoutRef.current) {
        clearTimeout(clientTypingTimeoutRef.current);
      }
    }

    try {
      const saved = await chatApiService.sendPatientMessage(
        conversation.id,
        textToSend,
        guestInfo.guestId
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end sm:p-6 pointer-events-none'>
      <div className='pointer-events-auto w-full sm:w-[380px] h-[520px] max-h-[90vh] bg-card border border-border/80 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200'>
        {/* Header */}
        <div className='p-3.5 bg-primary text-primary-foreground flex items-center justify-between shrink-0'>
          <div className='flex items-center gap-2.5'>
            <Avatar className='size-8 border border-white/20 bg-white/10'>
              <AvatarFallback className='text-xs font-bold text-white bg-transparent'>
                AH
              </AvatarFallback>
            </Avatar>
            <div>
              <div className='text-xs font-bold leading-tight'>Amanah Live Chat</div>
              <div className='flex items-center gap-1.5 mt-0.5 text-[10px] text-primary-foreground/80'>
                <span
                  className={cn(
                    'size-1.5 rounded-full ring-1 ring-white/40',
                    adminOnline ? 'bg-emerald-400' : 'bg-zinc-400'
                  )}
                />
                <span>{adminOnline ? 'Admin Online' : 'Klinik Sedang Offline'}</span>
              </div>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='size-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/90 hover:text-white transition-colors'
            aria-label='Tutup Chat'
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {!guestInfo ? (
          <div className='flex-1 p-5 flex flex-col justify-center select-none'>
            <div className='text-center mb-4'>
              <div className='size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2'>
                <Icons.chat className='size-5' />
              </div>
              <h4 className='text-sm font-bold text-foreground'>Mulai Konsultasi Online</h4>
              <p className='text-[11px] text-muted-foreground mt-1'>
                Masukkan nama dan email Anda untuk terhubung langsung dengan tim medis atau
                administrasi kami.
              </p>
            </div>

            <form onSubmit={handleStartGuestChat} className='space-y-3'>
              <div>
                <label
                  htmlFor='guest-full-name'
                  className='text-[11px] font-medium text-foreground block mb-1'
                >
                  Nama Lengkap
                </label>
                <input
                  id='guest-full-name'
                  type='text'
                  required
                  aria-label='Nama Lengkap'
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder='Contoh: Siti Rahma'
                  className='w-full h-8 px-2.5 rounded-[6px] border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary'
                />
              </div>

              <div>
                <label
                  htmlFor='guest-email-address'
                  className='text-[11px] font-medium text-foreground block mb-1'
                >
                  Alamat Email
                </label>
                <input
                  id='guest-email-address'
                  type='email'
                  required
                  aria-label='Alamat Email'
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder='nama@email.com'
                  className='w-full h-8 px-2.5 rounded-[6px] border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary'
                />
              </div>

              <Button type='submit' className='w-full h-8 text-xs font-semibold mt-2'>
                Mulai Percakapan
              </Button>
            </form>
          </div>
        ) : (
          <>
            {/* Messages Body */}
            <div
              ref={scrollRef}
              className='flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-background/50'
            >
              {isLoading ? (
                <div className='flex items-center justify-center h-full text-xs text-muted-foreground'>
                  Memuat percakapan...
                </div>
              ) : messages.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-full text-center px-4'>
                  <p className='text-xs font-medium text-foreground'>Halo, {guestInfo.name}!</p>
                  <p className='text-[11px] text-muted-foreground mt-1'>
                    Ketik pertanyaan Anda di bawah untuk mendapatkan informasi layanan klinik.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isCustomer = m.senderRole === 'customer';
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'flex flex-col max-w-[80%]',
                        isCustomer ? 'items-end self-end ml-auto' : 'items-start mr-auto'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-[8px] p-2 text-[11px] leading-relaxed break-words shadow-2xs',
                          isCustomer
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border border-border text-foreground'
                        )}
                      >
                        {m.body}
                      </div>
                      <span className='text-[9px] text-muted-foreground mt-0.5 tabular-nums px-0.5'>
                        {formatMessageTime(m.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Typing Indicator */}
            {isAdminTyping && (
              <div className='px-3.5 py-1.5 flex items-center gap-1.5 animate-in fade-in duration-200'>
                <div className='flex items-center gap-1.5 bg-muted/70 px-2.5 py-1 rounded-full border border-border/50 text-[11px] text-muted-foreground'>
                  <span>Admin sedang mengetik</span>
                  <span className='flex gap-0.5 items-center ml-0.5'>
                    <span className='size-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]' />
                    <span className='size-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]' />
                    <span className='size-1 rounded-full bg-primary animate-bounce' />
                  </span>
                </div>
              </div>
            )}

            {/* Input Footer */}
            <div className='p-2.5 border-t border-border/60 bg-card shrink-0'>
              <div className='flex items-center gap-1.5'>
                <input
                  type='text'
                  aria-label='Ketik pesan konsultasi'
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder='Ketik pesan...'
                  className='flex-1 h-8 px-2.5 rounded-[6px] border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary'
                />
                <Button
                  size='sm'
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isSending}
                  className='h-8 px-3 rounded-[6px] text-xs font-semibold'
                >
                  <Icons.arrowRight className='size-3.5' />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
