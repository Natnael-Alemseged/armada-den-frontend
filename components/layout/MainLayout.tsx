'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { GmailView } from '@/components/gmail/GmailView';
import { SearchView } from '@/components/search/SearchView';
import { ChatView } from '@/components/chat/ChatView';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState<'gmail' | 'search' | 'chat'>('gmail');

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        {activeTab === 'gmail' && <GmailView />}
        {activeTab === 'search' && <SearchView />}
        {activeTab === 'chat' && <ChatView />}
      </main>
    </div>
  );
}