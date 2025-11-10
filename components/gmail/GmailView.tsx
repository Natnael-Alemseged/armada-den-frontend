'use client';
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Email } from '@/lib/types'; // Ensure this matches the API structure (see comment below)
import { Mail, RefreshCw, Plus, Loader2, AlertCircle } from 'lucide-react';
import { ComposeEmailDialog } from './ComposeEmailDialog';
import { EmailList } from './EmailList';
import { cn } from '@/lib/utils';

// Expected Email type shape based on your API response:
// export interface Email {
//   attachmentList: { filename: string; mimeType: string }[];
//   labelIds: string[];
//   messageId: string;
//   messageText: string;
//   messageTimestamp: string;
//   payload: { /* complex object with headers, parts, body, etc. */ };
//   preview: { body: string; subject: string };
//   sender: string;
//   subject: string;
//   threadId: string;
//   to: string;
// }

export function GmailView() {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [checkingConnection, setCheckingConnection] = useState(true);
    const [composeOpen, setComposeOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        checkConnection();
    }, []);

    useEffect(() => {
        if (isConnected) {
            loadEmails();
        }
    }, [filter, isConnected]); // Reload on filter change

    const checkConnection = async () => {
        try {
            setCheckingConnection(true);
            const status = await api.getGmailStatus();
            setIsConnected(status.connected);
            if (status.connected) {
                loadEmails();
            }
        } catch (err) {
            console.error('Failed to check Gmail connection:', err);
            setIsConnected(false);
        } finally {
            setCheckingConnection(false);
        }
    };

    const connectGmail = async () => {
        try {
            setError('');
            const response = await api.connectGmail(
                window.location.origin + '/gmail/callback'
            );
            window.location.href = response.connection_url;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect Gmail');
        }
    };

    const loadEmails = async () => {
        try {
            setLoading(true);
            setError('');
            const query = filter === 'unread' ? 'is:unread' : '';
            const response = await api.readEmails(20, query);
            // Optional: Decode HTML entities in previews if displaying raw
            const decodedEmails = response.emails.map((email: Email) => ({
                ...email,
                preview: {
                    ...email.preview,
                    body: email.preview.body.replace(/&#39;/g, "'"), // Add more decoding as needed
                },
            }));
            setEmails(decodedEmails);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load emails');
        } finally {
            setLoading(false);
        }
    };

    if (checkingConnection) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <div className="text-center max-w-md">
                    <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Connect Your Gmail
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Connect your Gmail account to read and send emails directly from Armada Den.
                    </p>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    <button
                        onClick={connectGmail}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                    >
                        Connect Gmail Account
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Gmail
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={cn(
                                    'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                                    filter === 'all'
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                )}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={cn(
                                    'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                                    filter === 'unread'
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                )}
                            >
                                Unread
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadEmails}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                            Refresh
                        </button>
                        <button
                            onClick={() => setComposeOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Compose
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-auto relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                )}
                {error && (
                    <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    </div>
                )}
                {!loading && emails.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No emails found</p>
                        </div>
                    </div>
                ) : (
                    <EmailList emails={emails} onRefresh={loadEmails} />
                )}
            </div>
            <ComposeEmailDialog
                open={composeOpen}
                onOpenChange={setComposeOpen}
                onEmailSent={loadEmails}
            />
        </div>
    );
}