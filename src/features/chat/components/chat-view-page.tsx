'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { UnifiedChatWorkspace } from './chat-workspace';
import { useAdminChat } from '../hooks/use-admin-chat';
import { useChatStore } from '../utils/store';

function ChatParamSync() {
  const searchParams = useSearchParams();
  const selectConversation = useChatStore((s) => s.selectConversation);
  const conversationId = searchParams.get('conversationId') || searchParams.get('id');

  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId);
    }
  }, [conversationId, selectConversation]);

  return null;
}

export default function ChatViewPage() {
  const { sendMessage, closeConversation, isClientTyping, sendTyping } = useAdminChat();

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Chat Pasien'
      pageDescription='Ruang percakapan dan konsultasi terpadu pasien bersama tim medis & administrasi.'
    >
      <Suspense fallback={null}>
        <ChatParamSync />
      </Suspense>
      <div className='flex-1 h-full min-h-0 flex flex-col pb-4'>
        <UnifiedChatWorkspace
          isClientTyping={isClientTyping}
          onSendMessage={sendMessage}
          onTyping={sendTyping}
          onCloseConversation={closeConversation}
        />
      </div>
    </PageContainer>
  );
}
