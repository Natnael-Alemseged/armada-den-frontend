'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name?: string;
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
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  // Filter users based on mention search
  const filteredUsers = users.filter((user) => {
    const searchLower = mentionSearch.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower)
    );
  }).slice(0, 5); // Limit to 5 results

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
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectUser(filteredUsers[selectedIndex]);
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
        className="w-full pl-4 pr-12 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1A73E8]"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim() || sending}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-[#1A73E8] text-white rounded-md hover:bg-[#1557B0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {sending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>

      {/* Mentions Dropdown */}
      {showMentions && filteredUsers.length > 0 && (
        <div
          ref={mentionsRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-lg overflow-hidden z-50"
        >
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => selectUser(user)}
              className={`w-full px-3 py-2 text-left flex items-center gap-3 transition-colors ${
                index === selectedIndex
                  ? 'bg-[#1A73E8] text-white'
                  : 'hover:bg-[#2A2A2A] text-gray-300'
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
          ))}
        </div>
      )}
    </div>
  );
}
