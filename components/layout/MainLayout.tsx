'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { GmailView } from '@/components/gmail/GmailView';
import { MessagesView } from '@/components/messages/MessagesView';
import { ChatPage } from '@/components/chat/ChatPage';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState<'gmail' | 'messages' | 'chat'>('gmail');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsSidebarCollapsed(savedState === 'true');
    }
  }, []);

  // Save sidebar state to localStorage
  const handleToggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-auto">
          {activeTab === 'gmail' && <GmailView />}
          {activeTab === 'messages' && <MessagesView />}
          {activeTab === 'chat' && <ChatPage />}
        </div>
      </main>
    </div>
  );
}