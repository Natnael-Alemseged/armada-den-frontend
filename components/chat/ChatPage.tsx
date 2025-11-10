'use client';

import React from 'react';
import { ChatView } from './ChatView';
import { ChatErrorBoundary } from './ChatErrorBoundary';

export function ChatPage() {
  return (
    <div className="h-full">
      <ChatErrorBoundary>
        <ChatView />
      </ChatErrorBoundary>
    </div>
  );
}