'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface ChatwootMessage {
  id: string;
  sender: 'user' | 'agent' | 'bot';
  senderName: string;
  avatar?: string;
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatwootMessage[] = [
  {
    id: 'msg-1',
    sender: 'agent',
    senderName: 'Siti (Customer Care)',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    text: 'Halo! Selamat datang di Klinik Amanah 👋 Ada yang bisa kami bantu seputar reservasi dokter atau informasi layanan hari ini?',
    time: 'Baru saja'
  }
];

const QUICK_PROMPTS = [
  'Jadwal Dokter Hari Ini',
  'Cek Hasil Tes Lab',
  'Pendaftaran Pasien BPJS',
  'Konsultasi Telemedisin'
];

/**
 * 3D Gradient Crisp-Style Chat Bubble Icon
 * Fully Tokenized & Synchronized with Active Theme CSS Variables
 */
function Crisp3DThemeChatIcon({ className = 'size-8' }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 48 48'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn(
        'transition-transform duration-300 drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)]',
        className
      )}
    >
      <defs>
        {/* Theme-Adaptive 3D Multi-Stop Gradient using CSS Variables */}
        <linearGradient id='crispThemeGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='var(--primary-foreground)' stopOpacity='0.96' />
          <stop
            offset='50%'
            stopColor='color-mix(in oklch, var(--primary-foreground) 85%, var(--accent) 15%)'
            stopOpacity='0.9'
          />
          <stop
            offset='100%'
            stopColor='color-mix(in oklch, var(--primary-foreground) 75%, var(--primary) 25%)'
            stopOpacity='0.85'
          />
        </linearGradient>

        {/* 3D Top Specular Light Highlight */}
        <linearGradient id='crispThemeTopLight' x1='50%' y1='0%' x2='50%' y2='100%'>
          <stop offset='0%' stopColor='#ffffff' stopOpacity='0.85' />
          <stop offset='70%' stopColor='#ffffff' stopOpacity='0' />
        </linearGradient>

        {/* 3D Depth Shadow Overlay */}
        <radialGradient id='crispThemeDepth' cx='35%' cy='30%' r='75%'>
          <stop offset='0%' stopColor='#ffffff' stopOpacity='0.45' />
          <stop offset='55%' stopColor='transparent' />
          <stop offset='100%' stopColor='rgba(0,0,0,0.28)' />
        </radialGradient>
      </defs>

      {/* Main 3D Bubble Shell with Tail */}
      <path
        d='M24 6C13.506 6 5 13.611 5 23c0 4.148 1.66 7.94 4.453 10.887L7.22 40.58a1.2 1.2 0 0 0 1.6 1.48l7.65-3.35C18.73 39.52 21.3 40 24 40c10.494 0 19-7.611 19-17S34.494 6 24 6Z'
        fill='url(#crispThemeGrad)'
      />

      {/* 3D Depth Layer */}
      <path
        d='M24 6C13.506 6 5 13.611 5 23c0 4.148 1.66 7.94 4.453 10.887L7.22 40.58a1.2 1.2 0 0 0 1.6 1.48l7.65-3.35C18.73 39.52 21.3 40 24 40c10.494 0 19-7.611 19-17S34.494 6 24 6Z'
        fill='url(#crispThemeDepth)'
      />

      {/* Top Gloss Glare */}
      <ellipse cx='24' cy='13' rx='13' ry='4.5' fill='url(#crispThemeTopLight)' />

      {/* Crisp-Style Friendly Face Features using Theme Primary Token */}
      <g>
        {/* Left Eye */}
        <circle cx='17.5' cy='21' r='2.5' fill='var(--primary)' />
        <circle cx='18.2' cy='20.4' r='0.8' fill='var(--primary-foreground)' />

        {/* Right Eye */}
        <circle cx='30.5' cy='21' r='2.5' fill='var(--primary)' />
        <circle cx='31.2' cy='20.4' r='0.8' fill='var(--primary-foreground)' />

        {/* Smile Arc */}
        <path
          d='M18.5 26C20.2 29.5 27.8 29.5 29.5 26'
          stroke='var(--primary)'
          strokeWidth='2.8'
          strokeLinecap='round'
        />
      </g>
    </svg>
  );
}

export function ChatwootWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatwootMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const windowRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Optional: Check if real Chatwoot SDK token is provided in env
  useEffect(() => {
    const websiteToken = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL;

    if (websiteToken && baseUrl && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = `${baseUrl}/packs/js/sdk.js`;
      script.async = true;
      script.onload = () => {
        // @ts-expect-error - Chatwoot SDK attaches to window
        if (window.chatwootSDK) {
          // @ts-expect-error - Run Chatwoot SDK init
          window.chatwootSDK.run({
            websiteToken,
            baseUrl
          });
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  // GSAP Entrance & Exit Animations for the chat window
  useEffect(() => {
    if (!windowRef.current) return;

    if (isOpen) {
      setHasUnread(false);
      gsap.fromTo(
        windowRef.current,
        { opacity: 0, y: 30, scale: 0.94, display: 'none' },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.32,
          ease: 'power3.out',
          display: 'flex'
        }
      );
    } else {
      gsap.to(windowRef.current, {
        opacity: 0,
        y: 24,
        scale: 0.95,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => {
          if (windowRef.current) {
            windowRef.current.style.display = 'none';
          }
        }
      });
    }
  }, [isOpen]);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatwootMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      senderName: 'Anda',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulated Agent Reply
    setTimeout(() => {
      setIsTyping(false);
      const agentReply: ChatwootMessage = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        senderName: 'Siti (Customer Care)',
        avatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
        text: `Terima kasih atas pertanyaannya mengenai "${text.trim()}". Tim customer care Klinik Amanah sedang menyiapkan informasi lengkap untuk Anda. Mohon tunggu sebentar ya! 🙏`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, agentReply]);
    }, 1200);
  };

  return (
    <>
      {/* 1. Theme-Synchronized 3D Gradient Crisp-Style Floating Action Button (FAB) */}
      <div className='fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center justify-end select-none font-sans'>
        <button
          ref={fabRef}
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Tutup bantuan live chat' : 'Buka bantuan live chat Chatwoot'}
          className={cn(
            'group relative size-14 sm:size-15 rounded-full p-2.5 flex items-center justify-center transition-all duration-300 hover:scale-108 active:scale-95 cursor-pointer shadow-2xl ring-4 ring-primary/25',
            'bg-gradient-to-tr from-primary via-[color-mix(in_oklch,var(--primary)_85%,var(--accent))] to-[color-mix(in_oklch,var(--primary)_70%,var(--primary-foreground))]',
            isOpen &&
              'bg-gradient-to-tr from-foreground via-foreground/90 to-foreground/80 ring-foreground/20'
          )}
        >
          {/* Animated Toggle Icon: 3D Crisp Icon when closed, Close Icon when open */}
          <div className='relative size-8 flex items-center justify-center'>
            <Icons.close
              className={cn(
                'size-6 text-primary-foreground absolute transition-all duration-200',
                isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
              )}
            />
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center transition-all duration-200',
                !isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
              )}
            >
              <Crisp3DThemeChatIcon className='size-8' />
            </div>
          </div>

          {/* Pulsing Live Online Indicator */}
          {!isOpen && (
            <span className='absolute top-0 right-0 flex size-3.5'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75' />
              <span className='relative inline-flex rounded-full size-3.5 bg-emerald-500 ring-2 ring-card' />
            </span>
          )}

          {/* Unread Message Tooltip / Badge */}
          {hasUnread && !isOpen && (
            <span className='absolute -top-1.5 -left-1.5 px-2 py-0.5 bg-amber-500 text-amber-950 font-bold text-[10px] rounded-full shadow-md animate-bounce'>
              1
            </span>
          )}
        </button>
      </div>

      {/* 2. Chatwoot Chat Window Popup */}
      <div
        ref={windowRef}
        style={{ display: 'none' }}
        className='fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-[390px] h-[520px] max-h-[calc(100vh-7rem)] bg-card border border-border/70 rounded-2xl shadow-2xl z-50 flex-col overflow-hidden font-sans backdrop-blur-md'
      >
        {/* Window Header */}
        <div className='p-4 bg-primary text-primary-foreground flex items-center justify-between shrink-0 shadow-xs'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='relative size-10 rounded-full overflow-hidden shrink-0 ring-2 ring-primary-foreground/30 bg-primary-foreground/10'>
              <Image
                src='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'
                alt='Customer Service Avatar'
                width={80}
                height={80}
                unoptimized
                className='size-full object-cover'
              />
              <span className='absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-primary' />
            </div>

            <div className='min-w-0'>
              <h4 className='text-sm font-bold text-primary-foreground truncate leading-tight flex items-center gap-1.5'>
                <span>Klinik Amanah Support</span>
              </h4>
              <p className='text-[11px] text-primary-foreground/80 font-normal flex items-center gap-1 mt-0.5'>
                <span className='size-1.5 rounded-full bg-emerald-400' />
                <span>Online</span>
              </p>
            </div>
          </div>

          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              aria-label='Tutup jendela chat'
              className='p-1.5 rounded-lg text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition cursor-pointer'
            >
              <Icons.close className='size-4' />
            </button>
          </div>
        </div>

        {/* Message Stream Area */}
        <div className='flex-1 p-4 overflow-y-auto space-y-3.5 bg-muted/20 text-xs'>
          {/* Welcome Info Box */}
          <div className='p-3 rounded-xl bg-card border border-border/60 text-center space-y-1 shadow-2xs'>
            <p className='font-bold text-foreground text-xs'>Layanan Live Chat Pasien</p>
            <p className='text-[11px] text-muted-foreground leading-relaxed'>
              Konsultasikan kendala reservasi, informasi dokter, atau rujukan poli secara langsung.
            </p>
          </div>

          {/* Messages */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}
              >
                {!isUser && (
                  <div className='size-7 rounded-full overflow-hidden shrink-0 ring-1 ring-border bg-muted'>
                    <img
                      src={
                        msg.avatar ||
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'
                      }
                      alt={msg.senderName}
                      className='size-full object-cover'
                    />
                  </div>
                )}

                <div className={cn('max-w-[78%] space-y-1', isUser ? 'items-end' : 'items-start')}>
                  <div
                    className={cn(
                      'p-3 rounded-2xl text-xs leading-relaxed font-normal shadow-2xs break-words',
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-br-xs'
                        : 'bg-card text-foreground border border-border/60 rounded-bl-xs'
                    )}
                  >
                    {msg.text}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] text-muted-foreground block px-1',
                      isUser ? 'text-right' : 'text-left'
                    )}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className='flex items-center gap-2'>
              <div className='size-7 rounded-full bg-muted flex items-center justify-center ring-1 ring-border'>
                <span className='size-1.5 rounded-full bg-muted-foreground animate-ping' />
              </div>
              <div className='px-3 py-2 rounded-2xl bg-card border border-border/60 text-muted-foreground text-[11px] flex items-center gap-1.5'>
                <span className='size-1 rounded-full bg-muted-foreground/60 animate-bounce' />
                <span
                  className='size-1 rounded-full bg-muted-foreground/60 animate-bounce'
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className='size-1 rounded-full bg-muted-foreground/60 animate-bounce'
                  style={{ animationDelay: '0.3s' }}
                />
                <span className='ml-1 text-[10.5px]'>Customer care sedang mengetik...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className='px-3 py-2 bg-card border-t border-border/50 overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar'>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type='button'
              onClick={() => handleSendMessage(prompt)}
              className='px-2.5 py-1 rounded-full border border-border/60 bg-muted/30 hover:bg-muted text-[10.5px] font-medium text-foreground whitespace-nowrap transition cursor-pointer'
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Composer Footer */}
        <div className='p-3 bg-card border-t border-border/60 shrink-0 space-y-1.5'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className='flex items-center gap-2'
          >
            <Input
              type='text'
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder='Tulis pesan kamu di sini...'
              className='h-9 text-xs rounded-xl bg-muted/20 border-border/60 flex-1'
            />

            <Button
              type='submit'
              size='sm'
              disabled={!inputText.trim()}
              className='h-9 px-3.5 rounded-xl text-xs font-semibold shadow-xs shrink-0'
            >
              <Icons.send className='size-3.5' />
            </Button>
          </form>

          {/* Powered by Chatwoot Tag */}
          <div className='flex items-center justify-center gap-1 text-[10px] text-muted-foreground/70'>
            <span>Ditenagai oleh</span>
            <span className='font-bold text-foreground/80 tracking-tight'>Chatwoot</span>
          </div>
        </div>
      </div>
    </>
  );
}
