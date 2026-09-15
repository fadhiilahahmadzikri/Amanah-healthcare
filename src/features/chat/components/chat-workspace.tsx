'use client';

import React, { useState } from 'react';
import { useChatStore } from '../utils/store';
import { ChatRailNav, type ChatRailTool } from './chat-rail-nav';
import { ChatInboxSidebar } from './chat-inbox-sidebar';
import { ChatMainArea } from './chat-main-area';
import { PatientCrmSidebar } from './patient-crm-sidebar';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';

export function UnifiedChatWorkspace() {
  const [activeTool, setActiveTool] = useState<ChatRailTool>('inbox');
  const [showMobileProfile, setShowMobileProfile] = useState(false);

  const {
    conversations,
    selectedConversationId,
    selectConversation,
    sendMessage,
    getActiveConversation
  } = useChatStore();

  const activeConversation = getActiveConversation();

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
    <div className='w-full h-[calc(100vh-140px)] min-h-[620px] bg-card border border-border/80 rounded-[8px] overflow-hidden shadow-xs flex select-none'>
      {/* Column 1: Slim Activity Tool Rail */}
      <ChatRailNav activeTool={activeTool} onSelectTool={(tool) => setActiveTool(tool)} />

      {/* Column 2: Inbox Sidebar List */}
      <ChatInboxSidebar
        conversations={conversations}
        selectedId={selectedConversationId}
        onSelect={(id) => selectConversation(id)}
      />

      {/* Column 3: Main Chat Communication Area */}
      <ChatMainArea
        conversation={activeConversation}
        onSendMessage={(text) => sendMessage(text)}
        onToggleProfile={() => setShowMobileProfile(!showMobileProfile)}
      />

      {/* Column 4: Patient CRM Profile & Clinical Stepper Timeline */}
      <div className='hidden lg:block'>
        <PatientCrmSidebar conversation={activeConversation} />
      </div>

      {/* Mobile / Tablet Profile Drawer */}
      {showMobileProfile && (
        <div className='fixed inset-0 z-50 bg-black/40 flex justify-end lg:hidden'>
          <div className='w-[310px] h-full bg-card shadow-2xl relative animate-in slide-in-from-right'>
            <button
              onClick={() => setShowMobileProfile(false)}
              className='absolute top-3 right-3 z-10 size-6 rounded-md bg-muted text-foreground flex items-center justify-center'
            >
              ✕
            </button>
            <PatientCrmSidebar conversation={activeConversation} />
          </div>
        </div>
      )}
    </div>
  );
}
