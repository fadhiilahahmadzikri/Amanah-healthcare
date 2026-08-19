'use client';

import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { UnifiedChatWorkspace } from './chat-workspace';

export default function ChatViewPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Chat Pasien'
      pageDescription='Ruang percakapan dan konsultasi terpadu pasien bersama tim medis & administrasi.'
    >
      <div className='flex-1 h-full min-h-0 flex flex-col pb-4'>
        <UnifiedChatWorkspace />
      </div>
    </PageContainer>
  );
}
