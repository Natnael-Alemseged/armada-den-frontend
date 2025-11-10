'use client';
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getGmailStatus, fetchEmails, connectGmail } from '@/lib/features/gmail/gmailThunk';
import { Email } from '@/lib/types';
import { Mail, RefreshCw, Plus, Loader2, AlertCircle, X, Reply, Forward, Archive, Trash2, Star, MoreVertical, Paperclip, Calendar } from 'lucide-react';
import { ComposeEmailDialog } from './ComposeEmailDialog';
import { EmailList } from './EmailList';
import { EmailDetailPanel } from './EmailDetailPanel';
import { cn } from '@/lib/utils';

export function GmailView() {
    const dispatch = useAppDispatch();
    const { emails, loading, error, connected } = useAppSelector((state) => state.gmail);
    const [composeOpen, setComposeOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

    const loadEmails = () => {
        const query = filter === 'unread' ? 'is:unread' : '';
        dispatch(fetchEmails({ maxResults: 20, query }));
    };

    const handleConnectGmail = async () => {
        try {
            const result = await dispatch(connectGmail({
                redirectUrl: window.location.origin + '/gmail/callback'
            })).unwrap();
            window.location.href = result.connection_url;
        } catch (err) {
            console.error('Failed to connect Gmail:', err);
        }
    };

    useEffect(() => {
        dispatch(getGmailStatus());
    }, [dispatch]);

    useEffect(() => {
        if (connected) {
            loadEmails();
        }
    }, [filter, connected, dispatch]);

    if (loading && emails.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!connected) {
        return (
            <div className="flex items-center justify-center h-full p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Mail className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Connect Your Gmail
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Connect your Gmail account to read and send emails directly from Armada Den.
                    </p>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    <button
                        onClick={handleConnectGmail}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                    >
                        Connect Gmail Account
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Gmail
                        </h2>
                        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
                            <button
                                onClick={() => setFilter('all')}
                                className={cn(
                                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                                    filter === 'all'
                                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                )}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={cn(
                                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                                    filter === 'unread'
                                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-105"
                        >
                            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                            Refresh
                        </button>
                        <button
                            onClick={() => setComposeOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
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
                    <div className="flex h-full">
                        <EmailList 
                            emails={emails} 
                            onRefresh={loadEmails}
                            selectedEmail={selectedEmail}
                            onSelectEmail={setSelectedEmail}
                        />
                        {selectedEmail && (
                            <EmailDetailPanel 
                                email={selectedEmail} 
                                onClose={() => setSelectedEmail(null)}
                            />
                        )}
                    </div>
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