'use client';

import React from 'react';
import { Email } from '@/lib/types';
import { Mail, Clock } from 'lucide-react';
import { formatDate, truncateText } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface EmailListProps {
    emails: Email[];
    onRefresh: () => void;
    selectedEmail: Email | null;
    onSelectEmail: (email: Email) => void;
}

export function EmailList({ emails, selectedEmail, onSelectEmail }: EmailListProps) {
    return (
        <div className="flex-1 divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto">
            {emails.map((email) => (
                <div
                    key={email.messageId}
                    onClick={() => onSelectEmail(email)}
                    className={cn(
                        "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-l-4",
                        selectedEmail?.messageId === email.messageId
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-600"
                            : "border-transparent"
                    )}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {email.sender || 'Unknown Sender'}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                    <Clock className="w-3 h-3" />
                                    {email.messageTimestamp ? formatDate(email.messageTimestamp) : 'Unknown'}
                                </div>
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {email.subject || '(No Subject)'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {truncateText(email.preview?.body || '', 150)}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}