'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChatStore } from '../utils/store';
import { ChatRailNav, type ChatRailTool } from './chat-rail-nav';
import { ChatInboxSidebar } from './chat-inbox-sidebar';
import { ChatMainArea } from './chat-main-area';
import { PatientCrmSidebar } from './patient-crm-sidebar';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface UnifiedChatWorkspaceProps {
  isClientTyping?: boolean;
  onSendMessage?: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
}

export function UnifiedChatWorkspace({
  isClientTyping,
  onSendMessage,
  onTyping
}: UnifiedChatWorkspaceProps) {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams?.get('conversationId') || searchParams?.get('id');

  const [activeTool, setActiveTool] = useState<ChatRailTool>('inbox');
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
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

  const handleToggleProfile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowMobileProfile((prev) => !prev);
    } else {
      setIsRightSidebarOpen((prev) => !prev);
    }
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

  return (
    <div className='w-full h-full flex-1 min-h-0 bg-background md:bg-card border-0 md:border md:border-border/80 rounded-none md:rounded-[8px] overflow-hidden shadow-none md:shadow-xs flex select-none'>
      {/* Column 1: Slim Activity Tool Rail (Hidden on mobile, preserved on desktop) */}
      <ChatRailNav activeTool={activeTool} onSelectTool={(tool) => setActiveTool(tool)} />

      {/* Column 2: Inbox Sidebar List (Full-width on mobile when not viewing chat; fixed width on desktop) */}
      <ChatInboxSidebar
        conversations={conversations}
        selectedId={selectedConversationId}
        onSelect={handleSelectConversation}
        className={cn(
          isMobileChatOpen ? 'hidden' : 'flex flex-1 w-full',
          'md:flex md:w-[300px] lg:w-[320px] md:shrink-0 md:flex-none'
        )}
      />

      {/* Column 3: Main Chat Communication Area (Full-screen on mobile when viewing chat; flex-1 on desktop) */}
      <ChatMainArea
        conversation={activeConversation}
        messages={activeMessages}
        isClientTyping={isClientTyping}
        isProfileOpen={isRightSidebarOpen}
        onSendMessage={(text) => onSendMessage?.(text)}
        onTyping={onTyping}
        onToggleProfile={handleToggleProfile}
        onBackToInbox={handleBackToInbox}
        className={cn(
          !isMobileChatOpen ? 'hidden' : 'flex flex-1 w-full',
          'md:flex md:flex-1 md:min-w-0'
        )}
      />

      {/* Column 4: Patient Info Sidebar (Desktop only, rendered when a conversation is active and panel open) */}
      {activeConversation && isRightSidebarOpen && (
        <div className='hidden lg:block shrink-0'>
          <PatientCrmSidebar
            conversation={activeConversation}
            onCloseProfile={() => setIsRightSidebarOpen(false)}
          />
        </div>
      )}

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
              onCloseProfile={() => setShowMobileProfile(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
