'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mail, Search, ExternalLink, ArrowUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { connectGmail } from '@/lib/features/gmail/gmailThunk';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AIAgent {
  id: string;
  name: string;
  displayName: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  requiresConnection?: boolean;
  connected?: boolean;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  sending?: boolean;
  users: User[];
}

export function MentionInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
  sending,
  users,
}: MentionInputProps) {
  const dispatch = useAppDispatch();
  const { connected: gmailConnected } = useAppSelector((state) => state.gmail);
  const { connected: searchConnected } = useAppSelector((state) => state.search);

  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  // Define AI agents
  const aiAgents: AIAgent[] = [
    {
      id: 'emailai',
      name: 'EmailAI',
      displayName: 'EmailAI',
      icon: Mail,
      description: 'AI assistant for email management',
      requiresConnection: true,
      connected: gmailConnected,
    },
    {
      id: 'searchai',
      name: 'SearchAI',
      displayName: 'SearchAI',
      icon: Search,
      description: 'AI assistant for web search',
      requiresConnection: false,
      connected: true,
    },
  ];

  // Filter users and AI agents based on mention search
  const filteredUsers = users.filter((user) => {
    const searchLower = mentionSearch.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower)
    );
  }).slice(0, 5); // Limit to 5 results

  const filteredAgents = aiAgents.filter((agent) => {
    const searchLower = mentionSearch.toLowerCase();
    return agent.name.toLowerCase().includes(searchLower) ||
      agent.displayName.toLowerCase().includes(searchLower);
  });

  type MentionOption = { type: 'agent'; agent: AIAgent } | { type: 'user'; user: User };
  const mentionOptions: MentionOption[] = [
    ...filteredAgents.map((agent) => ({ type: 'agent' as const, agent })),
    ...filteredUsers.map((user) => ({ type: 'user' as const, user })),
  ];

  useEffect(() => {
    // Check if we should show mentions
    const lastAtIndex = value.lastIndexOf('@', cursorPosition);
    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1, cursorPosition);
      // Only show if there's no space after @ and cursor is right after the search term
      if (!textAfterAt.includes(' ') && cursorPosition === lastAtIndex + 1 + textAfterAt.length) {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
        setSelectedIndex(0);
        return;
      }
    }
    setShowMentions(false);
  }, [value, cursorPosition]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMentions && mentionOptions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % mentionOptions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + mentionOptions.length) % mentionOptions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selection = mentionOptions[selectedIndex];
        if (selection.type === 'agent') {
          if (selection.agent.requiresConnection && !selection.agent.connected) {
            handleConnectGmail();
          } else {
            selectAgent(selection.agent);
          }
        } else {
          selectUser(selection.user);
        }
        return;
      } else if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && !showMentions) {
      e.preventDefault();
      onSubmit();
    }
  };

  const selectUser = (user: User) => {
    const lastAtIndex = value.lastIndexOf('@', cursorPosition);
    const beforeMention = value.substring(0, lastAtIndex);
    const afterMention = value.substring(cursorPosition);
    const displayName = user.full_name || user.email;
    const newValue = `${beforeMention}@${displayName} ${afterMention}`;
    onChange(newValue);
    setShowMentions(false);

    // Set cursor position after the mention
    setTimeout(() => {
      const newPosition = lastAtIndex + displayName.length + 2;
      inputRef.current?.setSelectionRange(newPosition, newPosition);
      inputRef.current?.focus();
    }, 0);
  };

  const selectAgent = (agent: AIAgent) => {
    const lastAtIndex = value.lastIndexOf('@', cursorPosition);
    const beforeMention = value.substring(0, lastAtIndex);
    const afterMention = value.substring(cursorPosition);
    const newValue = `${beforeMention}@${agent.displayName} ${afterMention}`;
    onChange(newValue);
    setShowMentions(false);

    // Set cursor position after the mention
    setTimeout(() => {
      const newPosition = lastAtIndex + agent.displayName.length + 2;
      inputRef.current?.setSelectionRange(newPosition, newPosition);
      inputRef.current?.focus();
    }, 0);
  };

  const handleConnectGmail = async () => {
    try {
      const result = await dispatch(connectGmail({
        redirectUrl: window.location.origin + '/gmail/callback'
      })).unwrap();
      const popupWidth = 520;
      const popupHeight = 720;
      const left = window.screenX + (window.innerWidth - popupWidth) / 2;
      const top = window.screenY + (window.innerHeight - popupHeight) / 2;

      const popup = window.open(
        result.connection_url,
        'gmailConnectWindow',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (!popup || popup.closed) {
        // Fallback to opening in a new tab if popup was blocked
        window.open(result.connection_url, '_blank');
      }
    } catch (err) {
      console.error('Failed to connect Gmail:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleClick = () => {
    setCursorPosition(inputRef.current?.selectionStart || 0);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onKeyUp={handleClick}
        placeholder={placeholder}
        className="w-full pl-4 pr-14 py-3 bg-[#F5F5F5] border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim() || sending}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {sending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowUp className="w-4 h-4" />
          // <Send className="w-4 h-4" />
        )}
      </button>

      {/* Mentions Dropdown */}
      {showMentions && mentionOptions.length > 0 && (
        <div
          ref={mentionsRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
        >
          {mentionOptions.map((option, index) => {
            if (option.type === 'agent') {
              const agent = option.agent;
              const Icon = agent.icon;
              const isDisabled = agent.requiresConnection && !agent.connected;

              return (
                <div
                  key={agent.id}
                  className={`w-full px-3 py-2 ${index === selectedIndex
                    ? 'bg-blue-50 border-l-2 border-blue-500'
                    : ''
                    } ${isDisabled ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isDisabled ? 'bg-gray-300' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                      }`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {agent.displayName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {agent.description}
                      </div>
                    </div>
                    {isDisabled ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectGmail();
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Connect
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => selectAgent(agent)}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        Mention
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            // Render user
            if (option.type === 'user') {
              const user = option.user;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => selectUser(user)}
                  className={`w-full px-3 py-2 text-left flex items-center gap-3 transition-colors ${index === selectedIndex
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                    }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {user.full_name || user.email}
                    </div>
                    {user.full_name && (
                      <div className="text-xs opacity-70 truncate">{user.email}</div>
                    )}
                  </div>
                </button>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
