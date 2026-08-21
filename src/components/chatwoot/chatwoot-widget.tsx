'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const morphContainerRef = useRef<HTMLDivElement | null>(null);
  const launcherContentRef = useRef<HTMLDivElement | null>(null);
  const workspaceContentRef = useRef<HTMLDivElement | null>(null);
  const conversationAreaRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Global Keyboard Shortcuts (Cmd/Ctrl + K or Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          handleCloseWorkspace();
        } else {
          handleOpenWorkspace();
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleCloseWorkspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // GSAP Single-Surface Physical Morphing (Pill Button <-> Full Large Window)
  const handleOpenWorkspace = () => {
    setIsOpen(true);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!morphContainerRef.current || prefersReducedMotion) return;

    // Fluid diagonal scaling & physical shape morphing from pill button into full workspace
    const tl = gsap.timeline();

    // 1. Initial spring anticipation
    tl.fromTo(
      morphContainerRef.current,
      {
        scale: 0.96,
        transformOrigin: 'bottom right'
      },
      {
        scale: 1,
        duration: 0.52,
        ease: 'expo.out'
      }
    );

    if (workspaceContentRef.current) {
      tl.fromTo(
        workspaceContentRef.current,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.38,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        },
        '-=0.3'
      );
    }
  };

  const handleCloseWorkspace = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }
    setIsStreaming(false);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!morphContainerRef.current || prefersReducedMotion) {
      setIsOpen(false);
      return;
    }

    // Physical reverse morph: Window collapses smoothly back into its parent pill button
    const tl = gsap.timeline({
      onComplete: () => {
        setIsOpen(false);
      }
    });

    if (workspaceContentRef.current) {
      tl.to(workspaceContentRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.18,
        ease: 'power2.in'
      });
    }

    tl.to(
      morphContainerRef.current,
      {
        scale: 0.95,
        transformOrigin: 'bottom right',
        duration: 0.32,
        ease: 'power3.inOut',
        clearProps: 'transform'
      },
      '-=0.08'
    );
  };

  // GSAP Morphing on Expand/Compact Toggle (Diagonal Sliding & Scaling Transition)
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!morphContainerRef.current) return;
    const nextState = !isExpanded;
    setIsExpanded(nextState);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (nextState) {
      // Diagonal Expansion Morph (Scaling outward diagonally from bottom-right corner)
      gsap.fromTo(
        morphContainerRef.current,
        {
          scale: 0.94,
          x: 20,
          y: 20,
          transformOrigin: 'bottom right'
        },
        {
          scale: 1,
          x: 0,
          y: 0,
          duration: 0.48,
          ease: 'expo.out',
          clearProps: 'transform'
        }
      );
    } else {
      // Diagonal Contraction Morph (Elastic settle back to compact floating mode)
      gsap.fromTo(
        morphContainerRef.current,
        {
          scale: 1.04,
          x: -14,
          y: -14,
          transformOrigin: 'bottom right'
        },
        {
          scale: 1,
          x: 0,
          y: 0,
          duration: 0.4,
          ease: 'power3.out',
          clearProps: 'transform'
        }
      );
    }
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

  const handleStopStreaming = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      {/*
        Single Physical Morphing Surface:
        Morphs directly from the Pill Button into the Large Workspace Window and seamlessly collapses back!
      */}
      <div
        ref={morphContainerRef}
        onMouseEnter={() => !isOpen && setIsHovered(true)}
        onMouseLeave={() => !isOpen && setIsHovered(false)}
        onClick={() => !isOpen && handleOpenWorkspace()}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex flex-col font-sans overflow-hidden border border-border/70 bg-card/98 text-card-foreground shadow-2xl backdrop-blur-2xl transition-[width,height,max-width,max-height,border-radius,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none',
          !isOpen
            ? 'w-[206px] h-14 rounded-2xl p-2.5 cursor-pointer hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 ring-2 ring-primary/10 hover:ring-primary/20 bg-card/95'
            : isExpanded
              ? 'w-[calc(100vw-2rem)] sm:w-[min(1080px,calc(100vw-3rem))] h-[min(820px,calc(100vh-4rem))] rounded-[28px] p-0'
              : 'w-[calc(100vw-2rem)] sm:w-[500px] md:w-[580px] h-[640px] max-h-[calc(100vh-5rem)] rounded-3xl p-0'
        )}
      >
        {/* State A: Pill Launcher Content (Visible when closed) */}
        {!isOpen && (
          <div
            ref={launcherContentRef}
            className='size-full flex items-center justify-between px-2 gap-2 transition-opacity duration-200'
          >
            <div className='flex items-center gap-2.5 min-w-0'>
              <div className='relative size-7 flex items-center justify-center shrink-0'>
                <GeminiSparkle3DIcon size={28} isHovered={isHovered} interactive={false} />
              </div>
              <span className='font-bold text-xs text-foreground tracking-tight truncate'>
                Tanya Amanah AI
              </span>
            </div>

            <div className='flex items-center gap-1.5 shrink-0'>
              <kbd className='px-1.5 py-0.5 text-[9.5px] font-mono rounded bg-muted text-muted-foreground border border-border/60'>
                ⌘K
              </kbd>
              <span className='flex size-2 rounded-full bg-emerald-500 ring-2 ring-card shrink-0' />
            </div>
          </div>
        )}

        {/* State B: Expanded Full Conversational Workspace (Visible when open) */}
        {isOpen && (
          <div
            ref={workspaceContentRef}
            className='size-full flex flex-col overflow-hidden animate-in fade-in duration-300'
          >
            {/* Workspace Header */}
            <div className='px-5 py-3.5 border-b border-border/50 bg-muted/20 flex items-center justify-between shrink-0'>
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
                    Siap membantu anda..
                  </p>
                </div>
              </div>

              {/* Control Actions */}
              <div className='flex items-center gap-1.5'>
                {/* Clear Conversation */}
                {messages.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={(e) => {
                          e.stopPropagation();
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

                {/* Expand / Maximize Canvas Toggle with Morphing Icon */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={handleToggleExpand}
                      className='size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    >
                      {isExpanded ? (
                        <Icons.minimize className='size-3.5' />
                      ) : (
                        <Icons.maximize className='size-3.5' />
                      )}
                      <span className='sr-only'>
                        {isExpanded ? 'Kecilkan Window Floating' : 'Perluas Ukuran Layar Canvas'}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='bottom' className='text-xs'>
                    {isExpanded ? 'Kecilkan Window' : 'Perluas Canvas'}
                  </TooltipContent>
                </Tooltip>

                {/* Minimize / Close (Collapses back into the pill button) */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseWorkspace();
                      }}
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
                <div
                  className={cn(
                    'h-full flex flex-col items-center justify-center text-center mx-auto py-8 space-y-6 select-none transition-all duration-300',
                    isExpanded ? 'max-w-4xl' : 'max-w-xl'
                  )}
                >
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

                  {/* Staggered Prompt Suggestion Cards (Responsive 4-column on expanded canvas) */}
                  <div
                    className={cn(
                      'grid gap-3 w-full text-left pt-2 transition-all duration-300',
                      isExpanded
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl'
                        : 'grid-cols-1 sm:grid-cols-2 max-w-xl'
                    )}
                  >
                    {INITIAL_SUGGESTIONS.map((item) => (
                      <button
                        key={item.title}
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSend(item.prompt);
                        }}
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
                    className={cn(
                      'flex flex-col space-y-1.5',
                      isUser ? 'items-end' : 'items-start'
                    )}
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
                        'p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs break-words transition-all duration-300',
                        isExpanded ? 'max-w-[76%]' : 'max-w-[88%]',
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(msg.id, msg.content);
                          }}
                          className='h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1'
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Icons.check className='size-3 text-emerald-500' />
                              <span className='text-emerald-600 dark:text-emerald-400'>
                                Tersalin
                              </span>
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
                          onClick={(e) => {
                            e.stopPropagation();
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
            <div className='p-4 border-t border-border/60 bg-card/90 backdrop-blur-md shrink-0 space-y-2.5'>
              {/* Quick Action Pills when chatting */}
              {messages.length > 0 && !isStreaming && (
                <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]'>
                  {INITIAL_SUGGESTIONS.slice(0, 3).map((s) => (
                    <button
                      key={s.title}
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSend(s.prompt);
                      }}
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
                onClick={(e) => e.stopPropagation()}
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
        )}
      </div>
    </>
  );
}
