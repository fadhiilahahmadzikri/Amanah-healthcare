'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { GeminiSparkle3DIcon } from './gemini-sparkle-3d-icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status?: 'streaming' | 'complete' | 'error';
}

const INITIAL_SUGGESTIONS = [
  {
    icon: 'calendar',
    title: 'Jadwal Dokter Spesialis',
    desc: 'Cek jadwal praktek dokter & kuota poli hari ini',
    prompt: 'Tampilkan jadwal dokter spesialis yang berpraktek hari ini di Klinik Amanah.'
  },
  {
    icon: 'users',
    title: 'Estimasi Antrean Poli',
    desc: 'Pantau kepadatan & rata-rata waktu tunggu',
    prompt: 'Bagaimana status antrean poli umum dan poli gigi saat ini?'
  },
  {
    icon: 'package',
    title: 'Ketersediaan Stok Farmasi',
    desc: 'Cek stok obat generik & resep darurat',
    prompt: 'Apakah stok antibiotik Amoxicillin dan Paracetamol sirup mencukupi?'
  },
  {
    icon: 'shield',
    title: 'Panduan Rujukan BPJS',
    desc: 'Alur administrasi SEP & validasi rujukan faskes',
    prompt: 'Bagaimana alur penerbitan SEP BPJS untuk pasien rujukan baru?'
  }
];

const MOCK_AI_RESPONSES: Record<string, string> = {
  jadwal:
    'Berdasarkan data SIMRS Klinik Amanah hari ini, terdapat **6 dokter spesialis** aktif berpraktek:\n\n1. **dr. Sarah Sp.A (Anak)** — Poli Anak (08:00 - 12:00 WIB)\n2. **dr. Budi Sp.PD (Penyakit Dalam)** — Poli Penyakit Dalam (09:00 - 14:00 WIB)\n3. **dr. Hendra Sp.OG (Kebidanan)** — Poli Kebidanan (13:00 - 17:00 WIB)\n4. **dr. Maya Sp.JP (Jantung)** — Poli Jantung (10:00 - 15:00 WIB)\n\nSemua kuota pendaftaran poli spesialis masih terbuka untuk pendaftaran online maupun walk-in kiosk.',
  antrean:
    'Status antrean real-time per saat ini:\n\n- **Poli Umum**: 14 pasien menunggu (Estimasi waktu tunggu: ~18 menit).\n- **Poli Gigi**: 6 pasien menunggu (Estimasi waktu tunggu: ~25 menit).\n- **Poli Anak**: 8 pasien menunggu (Estimasi waktu tunggu: ~15 menit).\n\nLayanan farmasi saat ini memiliki kecepatan peracikan rata-rata 7.2 menit per lembar resep.',
  farmasi:
    'Status inventori farmasi utama:\n\n- **Amoxicillin 500mg**: Tersedia (Stok: 480 tablet — Aman).\n- **Paracetamol 120mg/5ml Sirup**: Tersedia (Stok: 65 botol — Aman).\n- **Cefixime 100mg**: Tersedia (Stok: 210 kapsul — Aman).\n\nTidak ada obat kategori darurat (emergency stock) yang berada di bawah batas minimum threshold.',
  bpjs: 'Alur penerbitan Surat Eligibilitas Peserta (SEP) BPJS Kesehatan di Klinik Amanah:\n\n1. **Verifikasi Rujukan Faskes 1**: Pastikan surat rujukan FKTP masih aktif (maksimal 90 hari).\n2. **Perekaman Biometrik/KTP**: Pasien melakukan scan sidik jari atau input NIK pada kiosk admisi.\n3. **Penerbitan SEP**: Sistem otomatis memvalidasi eligibilitas kepesertaan aktif.\n4. **Menuju Poli Tujuan**: Pasien langsung diarahkan ke ruang tunggu poli dokter spesialis.'
};

export function ChatwootWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const conversationAreaRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isExpandingRef = useRef(false);

  // Auto-scroll on new messages or streaming tokens
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText, isOpen]);

  // Focus textarea when workspace opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Global Keyboard Shortcuts (Cmd/Ctrl + K or Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleCloseWorkspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // GSAP Spatial Corner-to-Canvas Expansion
  useEffect(() => {
    if (!workspaceRef.current || !launcherRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isOpen) {
      isExpandingRef.current = true;
      workspaceRef.current.style.display = 'flex';

      if (prefersReducedMotion) {
        gsap.to(workspaceRef.current, { opacity: 1, duration: 0.2 });
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          isExpandingRef.current = false;
        }
      });

      // Spatial Morph from Bottom-Right Corner
      tl.fromTo(
        workspaceRef.current,
        {
          opacity: 0,
          scale: 0.15,
          transformOrigin: 'bottom right',
          borderRadius: '32px',
          y: 20,
          x: 20
        },
        {
          opacity: 1,
          scale: 1,
          borderRadius: '24px',
          y: 0,
          x: 0,
          duration: 0.45,
          ease: 'power3.out'
        }
      );

      // Staggered internal content entrance
      if (headerRef.current && conversationAreaRef.current && composerRef.current) {
        tl.fromTo(
          [headerRef.current, conversationAreaRef.current, composerRef.current],
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.08,
            ease: 'power2.out'
          },
          '-=0.25'
        );
      }
    } else {
      if (prefersReducedMotion) {
        workspaceRef.current.style.display = 'none';
        return;
      }

      // Smooth spatial collapse back to bottom-right corner
      gsap.to(workspaceRef.current, {
        opacity: 0,
        scale: 0.2,
        transformOrigin: 'bottom right',
        y: 24,
        x: 24,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (workspaceRef.current) {
            workspaceRef.current.style.display = 'none';
          }
        }
      });
    }
  }, [isOpen]);

  const handleCloseWorkspace = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }
    setIsStreaming(false);
    setIsOpen(false);
  };

  // Streaming response simulation
  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isStreaming) return;

    const userMessage: AIMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsStreaming(true);
    setStreamingText('');

    // Determine mock reply
    const lower = text.toLowerCase();
    let replyTemplate =
      'Terima kasih atas pertanyaannya. Sebagai Asisten AI Cerdas Klinik Amanah, saya siap membantu memvalidasi data klinis, jadwal dokter, atau status rekam medis Anda. Apakah ada informasi spesifik lain yang ingin Anda ketahui?';

    if (lower.includes('jadwal') || lower.includes('dokter')) {
      replyTemplate = MOCK_AI_RESPONSES.jadwal;
    } else if (lower.includes('antre') || lower.includes('tunggu')) {
      replyTemplate = MOCK_AI_RESPONSES.antrean;
    } else if (lower.includes('obat') || lower.includes('stok') || lower.includes('farmasi')) {
      replyTemplate = MOCK_AI_RESPONSES.farmasi;
    } else if (lower.includes('bpjs') || lower.includes('sep') || lower.includes('rujukan')) {
      replyTemplate = MOCK_AI_RESPONSES.bpjs;
    }

    let currentIndex = 0;
    const words = replyTemplate.split(' ');

    streamIntervalRef.current = setInterval(() => {
      if (currentIndex < words.length) {
        setStreamingText((prev) => (prev ? `${prev} ${words[currentIndex]}` : words[currentIndex]));
        currentIndex++;
      } else {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        setIsStreaming(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: replyTemplate,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'complete'
          }
        ]);
        setStreamingText('');
      }
    }, 45);
  };

  const handleStopStreaming = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }
    if (streamingText) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: streamingText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'complete'
        }
      ]);
    }
    setIsStreaming(false);
    setStreamingText('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Jawaban AI disalin ke clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = (lastUserMsg: string) => {
    handleSend(lastUserMsg);
  };

  return (
    <>
      {/* 1. Motion-First Corner AI Launcher (Spatial & Tactile) */}
      <div className='fixed bottom-6 right-6 z-50 flex items-center justify-end select-none font-sans pointer-events-none'>
        <button
          ref={launcherRef}
          type='button'
          onClick={() => setIsOpen((prev) => !prev)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-expanded={isOpen}
          aria-label='Buka Asisten AI Amanah Healthcare'
          className={cn(
            'pointer-events-auto group relative flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xl border border-primary/20 backdrop-blur-md',
            'bg-card/95 hover:bg-card text-card-foreground',
            isOpen
              ? 'size-14 rounded-2xl bg-foreground text-background shadow-2xl ring-2 ring-primary/20'
              : isHovered
                ? 'h-14 px-4.5 rounded-2xl ring-4 ring-primary/15 shadow-2xl scale-[1.03] -translate-y-1 gap-2.5'
                : 'size-14 rounded-2xl ring-2 ring-primary/10'
          )}
        >
          {/* Subtle Dynamic Gradient Mesh on Hover */}
          <div className='absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

          {/* Left Spark / Close Icon Morph with 3D Gemini Gradient */}
          <div className='relative size-8 flex items-center justify-center shrink-0'>
            {isOpen ? (
              <Icons.close className='size-5 text-background transition-transform duration-200 rotate-0' />
            ) : (
              <GeminiSparkle3DIcon size={32} isHovered={isHovered} interactive={false} />
            )}
          </div>

          {/* Expressive Hover Label Reveal */}
          {!isOpen && (
            <div
              className={cn(
                'overflow-hidden whitespace-nowrap transition-all duration-300 font-semibold text-xs tracking-tight flex items-center gap-1.5',
                isHovered ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0'
              )}
            >
              <span className='text-foreground'>Tanya Amanah AI</span>
              <kbd className='px-1.5 py-0.5 text-[9.5px] font-mono rounded bg-muted text-muted-foreground border border-border/60'>
                ⌘K
              </kbd>
            </div>
          )}

          {/* Calm Beacon Status Dot */}
          {!isOpen && !isHovered && (
            <span className='absolute -top-1 -right-1 flex size-3'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60' />
              <span className='relative inline-flex rounded-full size-3 bg-emerald-500 ring-2 ring-card' />
            </span>
          )}
        </button>
      </div>

      {/* 2. Motion-First AI Workspace (Corner-to-Canvas Spatial Interface) */}
      <div
        ref={workspaceRef}
        style={{ display: 'none' }}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex flex-col font-sans overflow-hidden border border-border/70 bg-card/98 text-card-foreground shadow-2xl backdrop-blur-2xl',
          'w-[calc(100vw-2rem)] sm:w-[540px] md:w-[680px] lg:w-[820px] max-w-[calc(100vw-3rem)]',
          'h-[640px] max-h-[calc(100vh-5rem)] rounded-3xl'
        )}
      >
        {/* Workspace Header */}
        <div
          ref={headerRef}
          className='px-5 py-3.5 border-b border-border/50 bg-muted/20 flex items-center justify-between shrink-0'
        >
          {/* Identity & Status */}
          <div className='flex items-center gap-3 min-w-0'>
            <div className='size-9 rounded-xl bg-card border border-border/60 flex items-center justify-center shadow-2xs shrink-0 overflow-hidden'>
              <GeminiSparkle3DIcon size={22} interactive={true} />
            </div>
            <div className='min-w-0'>
              <div className='flex items-center gap-2'>
                <h3 className='text-sm font-bold text-foreground tracking-tight'>
                  Amanah AI Assistant
                </h3>
                <span className='px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'>
                  Online
                </span>
              </div>
              <p className='text-[11px] text-muted-foreground truncate mt-0.5'>
                Spatial Intelligence • SIMRS & Rekam Medis Terintegrasi
              </p>
            </div>
          </div>

          {/* Model Selector & Control Actions */}
          <div className='flex items-center gap-1.5'>
            <span className='hidden sm:inline-flex px-2.5 py-1 rounded-lg text-[11px] font-medium bg-background border border-border/60 text-muted-foreground shadow-2xs'>
              Amanah-MedLLM v2
            </span>

            {/* Clear Conversation */}
            {messages.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => {
                      setMessages([]);
                      toast.info('Riwayat percakapan dibersihkan.');
                    }}
                    className='size-8 rounded-lg text-muted-foreground hover:text-foreground'
                  >
                    <Icons.trash className='size-3.5' />
                    <span className='sr-only'>Bersihkan Chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='bottom' className='text-xs'>
                  Bersihkan Chat
                </TooltipContent>
              </Tooltip>
            )}

            {/* Minimize / Close */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={handleCloseWorkspace}
                  className='size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80'
                >
                  <Icons.close className='size-4' />
                  <span className='sr-only'>Tutup Workspace (Esc)</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side='bottom' className='text-xs'>
                Tutup (Esc)
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Conversation Stream Area (Editorial Document Paradigm) */}
        <div
          ref={conversationAreaRef}
          className='flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gradient-to-b from-transparent via-background/40 to-background text-sm'
        >
          {/* Empty State with Staggered Prompt Cards */}
          {messages.length === 0 && !isStreaming && (
            <div className='h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8 space-y-6 select-none'>
              <div className='size-18 rounded-3xl bg-card border border-border/60 flex items-center justify-center shadow-md'>
                <GeminiSparkle3DIcon size={56} interactive={true} />
              </div>

              <div className='space-y-1.5'>
                <h4 className='text-lg sm:text-xl font-bold text-foreground tracking-tight'>
                  Bagaimana Amanah AI dapat membantu Anda?
                </h4>
                <p className='text-xs text-muted-foreground leading-relaxed max-w-md'>
                  Eksplorasi data operasional klinik, jadwal dokter, estimasi antrean, atau
                  konsultasi administrasi BPJS secara instan.
                </p>
              </div>

              {/* Staggered Prompt Suggestion Cards */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2'>
                {INITIAL_SUGGESTIONS.map((item) => (
                  <button
                    key={item.title}
                    type='button'
                    onClick={() => handleSend(item.prompt)}
                    className={cn(
                      'p-3.5 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 hover:border-primary/40',
                      'transition-all duration-200 cursor-pointer text-left shadow-2xs hover:shadow-xs group'
                    )}
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-bold text-foreground group-hover:text-primary transition-colors'>
                        {item.title}
                      </span>
                      <Icons.chevronRight className='size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform' />
                    </div>
                    <p className='text-[11px] text-muted-foreground mt-1 leading-snug'>
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Conversation Messages */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={cn('flex flex-col space-y-1.5', isUser ? 'items-end' : 'items-start')}
              >
                <div className='flex items-center gap-2 px-1 text-[11px] text-muted-foreground font-medium'>
                  {!isUser && (
                    <span className='inline-flex items-center gap-1.5 font-bold text-foreground'>
                      <GeminiSparkle3DIcon size={15} interactive={false} />
                      <span>AI Assistant</span>
                    </span>
                  )}
                  {isUser && <span>Anda</span>}
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={cn(
                    'p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[88%] shadow-2xs break-words',
                    isUser
                      ? 'bg-primary text-primary-foreground rounded-tr-xs font-normal'
                      : 'bg-muted/40 text-foreground border border-border/60 rounded-tl-xs whitespace-pre-wrap'
                  )}
                >
                  {msg.content}
                </div>

                {/* AI Action Row */}
                {!isUser && (
                  <div className='flex items-center gap-1 pt-1 px-1'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className='h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1'
                    >
                      {copiedId === msg.id ? (
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

                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        const lastUser = [...messages].reverse().find((m) => m.role === 'user');
                        if (lastUser) handleRegenerate(lastUser.content);
                      }}
                      className='h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1'
                    >
                      <Icons.refresh className='size-3' />
                      <span>Buat Ulang</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Live Streaming Response Indicator */}
          {isStreaming && (
            <div className='flex flex-col items-start space-y-1.5'>
              <div className='flex items-center gap-1.5 px-1 text-[11px] text-foreground font-bold'>
                <GeminiSparkle3DIcon size={15} interactive={false} />
                <span>AI sedang menganalisis & merespons...</span>
              </div>

              <div className='p-4 rounded-2xl bg-muted/40 text-foreground border border-border/60 rounded-tl-xs text-xs sm:text-sm leading-relaxed max-w-[88%] shadow-2xs whitespace-pre-wrap'>
                {streamingText}
                <span className='inline-block w-2 h-4 ml-1 bg-primary animate-pulse align-middle' />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Workspace Dynamic Composer Footer */}
        <div
          ref={composerRef}
          className='p-4 border-t border-border/60 bg-card/90 backdrop-blur-md shrink-0 space-y-2.5'
        >
          {/* Quick Action Pills when chatting */}
          {messages.length > 0 && !isStreaming && (
            <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]'>
              {INITIAL_SUGGESTIONS.slice(0, 3).map((s) => (
                <button
                  key={s.title}
                  type='button'
                  onClick={() => handleSend(s.prompt)}
                  className='px-2.5 py-1 rounded-full border border-border/60 bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground whitespace-nowrap transition cursor-pointer'
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}

          {/* Composer Textarea Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className='relative flex items-end gap-2 p-2 rounded-2xl border border-border/70 bg-background shadow-xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all'
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder='Tanyakan apa saja seputar operasional & layanan klinik... (Enter untuk kirim)'
              className='w-full resize-none bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-32 min-h-[38px] leading-relaxed'
            />

            {/* Send / Stop Streaming Button */}
            {isStreaming ? (
              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={handleStopStreaming}
                className='h-8 px-3 rounded-xl text-xs font-semibold shrink-0 gap-1'
              >
                <Icons.close className='size-3.5' />
                <span>Hentikan</span>
              </Button>
            ) : (
              <Button
                type='submit'
                size='sm'
                disabled={!inputPrompt.trim()}
                className='h-8 w-8 p-0 rounded-xl text-xs font-semibold shrink-0 shadow-2xs disabled:opacity-40'
              >
                <Icons.send className='size-3.5' />
                <span className='sr-only'>Kirim Pertanyaan</span>
              </Button>
            )}
          </form>

          {/* Footer Metadata & Shortcuts */}
          <div className='flex items-center justify-between text-[10.5px] text-muted-foreground px-1'>
            <div className='flex items-center gap-1.5'>
              <span className='size-1.5 rounded-full bg-emerald-500' />
              <span>Amanah Spatial LLM Workspace</span>
            </div>
            <div className='hidden sm:flex items-center gap-2'>
              <span>
                Kirim: <kbd className='font-mono'>Enter</kbd>
              </span>
              <span>•</span>
              <span>
                Baris baru: <kbd className='font-mono'>Shift+Enter</kbd>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
