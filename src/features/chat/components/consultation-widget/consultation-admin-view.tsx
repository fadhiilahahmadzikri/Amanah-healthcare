'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { getClinicWhatsAppUrl } from '@/config/whatsapp.config';
import { cn } from '@/lib/utils';
import { useAdminChat } from '../../hooks/use-admin-chat';
import { useChatStore } from '../../utils/store';
import { ConsultationHistoryDrawer } from './consultation-history-drawer';
import { ConsultationMessageItem } from './consultation-message-item';

interface ConsultationAdminViewProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

export function ConsultationAdminView({
  isExpanded,
  onToggleExpand,
  onClose
}: ConsultationAdminViewProps) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    conversations,
    selectedConversationId,
    isLoading,
    isClientTyping,
    sendMessage,
    sendTyping
  } = useAdminChat();

  const { selectConversation, getActiveConversation, getActiveMessages } = useChatStore();

  const activeConversation = getActiveConversation();
  const activeMessages = getActiveMessages();

  // If no conversation selected but conversations exist, select first one
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      selectConversation(conversations[0].id);
    }
  }, [selectedConversationId, conversations, selectConversation]);

  // Auto-scroll on new messages or typing
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages.length, isClientTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    sendTyping(true);
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    sendMessage(text);
  };

  const recipientTitle = activeConversation
    ? activeConversation.customerName || activeConversation.guestName || 'Pasien'
    : 'Admin Inbox';

  return (
    <div className='size-full flex flex-row overflow-hidden animate-in fade-in duration-300 relative'>
      {/* 1. Toggleable Sidebar for Admin (Hidden by default for compact view, toggled via avatar container) */}
      <ConsultationHistoryDrawer
        conversations={conversations}
        activeConversationId={selectedConversationId ?? undefined}
        onSelectSession={(id) => {
          selectConversation(id);
          setShowSidebar(false);
        }}
        onClose={() => setShowSidebar(false)}
        isLoading={isLoading}
        isAdmin={true}
        className={cn(
          'transition-all duration-300',
          showSidebar
            ? 'flex absolute inset-0 z-40 sm:relative sm:z-10 w-full sm:w-64 md:w-72'
            : 'hidden'
        )}
      />

      {/* 2. Main Chat Area */}
      <div className='flex-1 flex flex-col min-w-0 h-full overflow-hidden relative'>
        {/* Header */}
        <div className='px-4 sm:px-5 py-3 border-b border-border/50 bg-card/95 backdrop-blur-md flex items-center justify-between shrink-0 relative z-20'>
          <div className='flex items-center gap-2.5 min-w-0'>
            {/* Clickable Avatar Container acting as Remote Control for Sidebar */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  onClick={() => setShowSidebar((prev) => !prev)}
                  className='flex items-center gap-2.5 min-w-0 p-1 -m-1 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                  aria-label={showSidebar ? 'Sembunyikan daftar percakapan' : 'Tampilkan daftar percakapan'}
                >
                  {activeConversation && (
                    <div className='relative shrink-0'>
                      <Avatar className='size-8 rounded-full ring-1 ring-border/40 overflow-hidden'>
                        <AvatarImage
                          src={
                            activeConversation.userId
                              ? `/api/v1/users/${activeConversation.userId}/avatar`
                              : DEFAULT_AVATAR_PATH
                          }
                          alt={recipientTitle}
                          className='size-full object-cover aspect-square rounded-full'
                        />
                        <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
                          <Image
                            src={DEFAULT_AVATAR_PATH}
                            alt={recipientTitle}
                            width={32}
                            height={32}
                            unoptimized
                            className='size-full object-cover rounded-full aspect-square'
                          />
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          'absolute bottom-0 right-0 size-2 rounded-full ring-1.5 ring-background',
                          activeConversation.isOnline ? 'bg-emerald-500' : 'bg-zinc-400'
                        )}
                      />
                    </div>
                  )}

                  <div className='min-w-0'>
                    <div className='flex items-center gap-1.5'>
                      <h3 className='text-sm font-bold text-foreground tracking-tight truncate'>
                        {recipientTitle}
                      </h3>
                      <Icons.chevronRight
                        className={cn(
                          'size-3.5 text-muted-foreground transition-transform duration-200',
                          showSidebar && 'rotate-90'
                        )}
                      />
                    </div>
                    <div className='flex items-center gap-1.5 mt-0.5 text-[11px]'>
                      <span className='text-muted-foreground truncate'>
                        {showSidebar ? 'Tutup daftar' : 'Klik untuk daftar chat'}
                      </span>
                    </div>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side='bottom' className='text-xs'>
                {showSidebar ? 'Sembunyikan daftar percakapan' : 'Buka daftar percakapan'}
              </TooltipContent>
            </Tooltip>
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

      {/* 2. Messages Stream */}
      <div className='flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-transparent via-background/40 to-background text-sm relative z-10 scroll-smooth'>
        {conversations.length === 0 ? (
          <EmptyState
            icon={Icons.chat}
            title='Belum ada percakapan'
            description='Belum ada pasien yang mengirimkan pesan saat ini.'
            className='min-h-full border-0 bg-transparent'
          />
        ) : activeMessages.length === 0 ? (
          <EmptyState
            icon={Icons.chat}
            title='Mulai Membalas'
            description='Ketik pesan di bawah untuk membalas pasien.'
            className='min-h-full border-0 bg-transparent'
          />
        ) : (
          activeMessages.map((msg) => (
            <ConsultationMessageItem
              key={msg.id}
              message={msg}
              isExpanded={isExpanded}
              isAdmin={true}
            />
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Minimalist Composer with Floating 3-Dot Bouncing Indicator directly above it */}
      <div className='relative z-20 p-3 sm:p-4 border-t border-border/60 bg-card/95 backdrop-blur-md shrink-0 space-y-2'>
        {/* Floating Bare 3-Dot Bouncing Indicator (Unwrapped, strictly above message stream) */}
        {isClientTyping && (
          <div className='absolute -top-6 left-4 sm:left-5 z-30 flex items-center gap-1.5 pointer-events-none animate-in fade-in duration-200'>
            <span className='size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]' />
            <span className='size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]' />
            <span className='size-2 rounded-full bg-primary animate-bounce' />
          </div>
        )}

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
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder='Tulis balasan untuk pasien...'
            className='w-full resize-none bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none max-h-32 min-h-[38px] leading-relaxed'
          />
          <Button
            type='submit'
            size='sm'
            disabled={!inputText.trim() || !selectedConversationId}
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
      </div>
    </div>
  );
}
