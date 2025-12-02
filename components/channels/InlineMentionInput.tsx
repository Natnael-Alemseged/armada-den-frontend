'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mail, Search, ExternalLink } from 'lucide-react';
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

interface InlineMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  disabled?: boolean;
  users: User[];
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  onCaretUpdate?: () => void;
}

export function InlineMentionInput({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
  users,
  textareaRef,
  onCaretUpdate,
}: InlineMentionInputProps) {
  const dispatch = useAppDispatch();
  const { connected: gmailConnected } = useAppSelector((state) => state.gmail);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = textareaRef || internalRef;
  const mentionsRef = useRef<HTMLDivElement>(null);

  // Identify EmailAI agent from users list
  const emailAiUser = users.find(u => u.email === 'emailai@armada.bot');

  // Filter users and AI agents based on mention search
  const mentionableUsers = users.filter((user) => user.id !== currentUserId && user.email !== 'emailai@armada.bot');

  const filteredUsers = mentionableUsers.filter((user) => {
    const searchLower = mentionSearch.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower)
    );
  }).slice(0, 10);

  type MentionOption = { type: 'agent'; agent: AIAgent } | { type: 'user'; user: User };
  const mentionOptions: MentionOption[] = [];

  // Add EmailAI if it matches search and exists
  if (emailAiUser) {
    const searchLower = mentionSearch.toLowerCase();
    if ('emailai'.includes(searchLower) || 'email ai'.includes(searchLower)) {
      mentionOptions.push({
        type: 'agent',
        agent: {
          id: emailAiUser.id,
          name: 'EmailAI',
          displayName: 'EmailAI',
          icon: Mail,
          description: 'AI assistant for email management',
          requiresConnection: true,
          connected: gmailConnected,
        }
      });
    }
  }

  // Add other users
  mentionOptions.push(...filteredUsers.map((user) => ({ type: 'user' as const, user })));

  useEffect(() => {
    // Check if we should show mentions
    const lastAtIndex = value.lastIndexOf('@', cursorPosition);
    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1, cursorPosition);
      if (!textAfterAt.includes(' ') && cursorPosition === lastAtIndex + 1 + textAfterAt.length) {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
        setSelectedIndex(0);
        return;
      }
    }
    setShowMentions(false);
  }, [value, cursorPosition]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && mentionOptions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % mentionOptions.length);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + mentionOptions.length) % mentionOptions.length);
        return;
      } else if (e.key === 'Tab') {
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
        e.preventDefault();
        setShowMentions(false);
        return;
      }
    }

    // Call parent onKeyDown if provided
    if (onKeyDown) {
      onKeyDown(e);
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
        window.open(result.connection_url, '_blank');
      }
    } catch (err) {
      console.error('Failed to connect Gmail:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleClick = () => {
    setCursorPosition(inputRef.current?.selectionStart || 0);
    if (onCaretUpdate) onCaretUpdate();
  };

  const handleSelect = () => {
    setCursorPosition(inputRef.current?.selectionStart || 0);
    if (onCaretUpdate) onCaretUpdate();
  };

  return (
    <div className="relative flex-1">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onKeyUp={handleClick}
        onSelect={handleSelect}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        className="w-full bg-transparent border-none outline-none resize-none text-sm text-gray-900 placeholder-gray-400 max-h-[100px]"
        style={{ height: 'auto' }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${Math.min(target.scrollHeight, 100)}px`;
        }}
      />

      {/* Mentions Dropdown */}
      {showMentions && mentionOptions.length > 0 && (
        <div
          ref={mentionsRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 max-h-64 overflow-y-auto"
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
