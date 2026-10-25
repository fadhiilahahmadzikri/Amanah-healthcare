'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChatStore } from '../utils/store';
import { ChatRailNav, type ChatRailTool } from './chat-rail-nav';
import { ChatInboxSidebar } from './chat-inbox-sidebar';
import { ChatMainArea } from './chat-main-area';
import { PatientCrmSidebar } from './patient-crm-sidebar';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface UnifiedChatWorkspaceProps {
  isClientTyping?: boolean;
  onSendMessage?: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onCloseConversation?: (conversationId: string) => void;
}

export function UnifiedChatWorkspace({
  isClientTyping,
  onSendMessage,
  onTyping,
  onCloseConversation
}: UnifiedChatWorkspaceProps) {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams?.get('conversationId') || searchParams?.get('id');

  const [activeTool, setActiveTool] = useState<ChatRailTool>('inbox');
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(Boolean(initialConversationId));

  const {
    conversations,
    selectedConversationId,
    selectConversation,
    getActiveConversation,
    getActiveMessages
  } = useChatStore();

  const activeConversation = getActiveConversation();
  const activeMessages = getActiveMessages();

  // If a URL parameter is present, ensure mobile chat opens directly
  useEffect(() => {
    if (initialConversationId) {
      setIsMobileChatOpen(true);
    }
  }, [initialConversationId]);

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    setIsMobileChatOpen(true);
  };

  const handleBackToInbox = () => {
    setIsMobileChatOpen(false);
  };

  // Close mobile profile drawer on Escape key press
  useEffect(() => {
    if (!showMobileProfile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileProfile(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMobileProfile]);

  if (conversations.length === 0) {
    return (
      <div className='flex flex-1 min-h-0 h-full w-full flex-col'>
        <EmptyState
          icon={Icons.chat}
          title='Belum Ada Percakapan'
          description='Belum ada riwayat pesan atau konsultasi pasien yang aktif saat ini.'
          className='h-full w-full flex-1'
        />
      </div>
    );
  }

  return (
    <div className='w-full h-full flex-1 min-h-0 bg-card border border-border/80 rounded-[8px] overflow-hidden shadow-xs flex select-none'>
      {/* Column 1: Slim Activity Tool Rail (Hidden on mobile, preserved on desktop) */}
      <ChatRailNav activeTool={activeTool} onSelectTool={(tool) => setActiveTool(tool)} />

      {/* Column 2: Inbox Sidebar List (Full-width on mobile when not viewing chat; fixed width on desktop) */}
      <ChatInboxSidebar
        conversations={conversations}
        selectedId={selectedConversationId}
        onSelect={handleSelectConversation}
        className={cn(
          isMobileChatOpen ? 'hidden md:flex' : 'flex flex-1 w-full md:w-[270px] lg:w-[290px]'
        )}
      />

      {/* Column 3: Main Chat Communication Area (Full-screen on mobile when viewing chat; flex-1 on desktop) */}
      <ChatMainArea
        conversation={activeConversation}
        messages={activeMessages}
        isClientTyping={isClientTyping}
        onSendMessage={(text) => onSendMessage?.(text)}
        onTyping={onTyping}
        onToggleProfile={() => setShowMobileProfile(!showMobileProfile)}
        onBackToInbox={handleBackToInbox}
        className={cn(!isMobileChatOpen ? 'hidden md:flex' : 'flex flex-1 w-full')}
      />

      {/* Column 4: Patient Info Sidebar (Desktop only) */}
      <div className='hidden lg:block'>
        <PatientCrmSidebar
          conversation={activeConversation}
          onCloseConversation={onCloseConversation}
        />
      </div>

      {/* Mobile / Tablet Profile Drawer with Outside Dismissal */}
      {showMobileProfile && (
        <div className='fixed inset-0 z-50 flex justify-end lg:hidden animate-in fade-in duration-200'>
          {/* Backdrop button for outside dismissal */}
          <button
            type='button'
            className='fixed inset-0 bg-black/40 backdrop-blur-xs cursor-default w-full h-full border-0 outline-none'
            onClick={() => setShowMobileProfile(false)}
            aria-label='Tutup drawer profil pasien'
            tabIndex={-1}
          />

          <div className='w-[280px] sm:w-[320px] h-full bg-card shadow-2xl relative z-10 animate-in slide-in-from-right duration-200'>
            <button
              type='button'
              onClick={() => setShowMobileProfile(false)}
              className='absolute top-3 right-3 z-10 size-8.5 rounded-lg bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-colors shadow-2xs'
              aria-label='Tutup Profil Pasien'
            >
              <Icons.close className='size-4' />
            </button>
            <PatientCrmSidebar
              conversation={activeConversation}
              onCloseConversation={onCloseConversation}
            />
          </div>
        </div>
      )}
    </div>
  );
}
