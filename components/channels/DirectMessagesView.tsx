'use client';

import React from 'react';
import { DMConversationsList } from '@/components/directMessages/DMConversationsList';
import  DMMessageThread  from '@/components/directMessages/DMMessageThread';

interface DirectMessagesViewProps {
  onClose?: () => void;
}

export default function   DirectMessagesView({ onClose }: DirectMessagesViewProps) {
  return (
    <>
      <DMConversationsList />
      <DMMessageThread />
    </>
  );
}
