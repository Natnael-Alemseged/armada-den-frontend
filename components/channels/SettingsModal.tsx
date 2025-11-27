'use client';

import React from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { NotificationSettings } from '@/components/ui/NotificationSettings';
import { useAppSelector } from '@/lib/hooks';

interface SettingsModalProps {
    onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const { token } = useAppSelector((state) => state.auth);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <SettingsIcon className="w-5 h-5 text-gray-700" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Notifications Section */}
                    <section>
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Notifications</h3>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Receive alerts for new messages when you're away
                                        </p>
                                    </div>
                                </div>
                                <NotificationSettings token={token || undefined} />
                            </div>
                        </div>
                    </section>

                    {/* Add more settings sections here in the future */}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
