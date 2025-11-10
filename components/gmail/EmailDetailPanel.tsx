'use client';

import React from 'react';
import { Email } from '@/lib/types';
import { X, Reply, Forward, Archive, Trash2, Star, MoreVertical, Paperclip, Calendar, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailDetailPanelProps {
  email: Email;
  onClose: () => void;
}

export function EmailDetailPanel({ email, onClose }: EmailDetailPanelProps) {
  const formatEmailDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 max-w-3xl">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
            {email.subject || '(No Subject)'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex-1" />
          {/*
            Action buttons (Reply, Forward, Star, Archive, Delete, More) will be re-enabled
            once the corresponding API endpoints are implemented.
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
              <Reply className="w-4 h-4" />
              Reply
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium">
              <Forward className="w-4 h-4" />
              Forward
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Star">
              <Star className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover-bg-gray-700 rounded-lg transition-colors" title="Archive">
              <Archive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Delete">
              <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="More">
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          */}
        </div>
      </div>

      {/* Email Details */}
      <div className="flex-1 overflow-y-auto">
        {/* Sender Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {email.sender ? getInitials(email.sender) : 'U'}
            </div>

            {/* Sender Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {email.sender || 'Unknown Sender'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    to me
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                  <Clock className="w-4 h-4" />
                  {email.messageTimestamp ? formatEmailDate(email.messageTimestamp) : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6">
          <div className="prose dark:prose-invert max-w-none">
            <div 
              className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: email.messageText || email.preview?.body || 'No content available' 
              }}
            />
          </div>

          {/* Attachments (if any) */}
          {email.attachmentList && email.attachmentList.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments ({email.attachmentList.length})
              </h3>
              <div className="space-y-2">
                {email.attachmentList.map((attachment: { filename?: string; mimeType?: string }, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {attachment.filename || `Attachment ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {attachment.mimeType || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
