'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, ChevronLeft, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateUserProfile } from '@/lib/slices/authThunk';

interface ProfileUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileUpdateModal({ isOpen, onClose }: ProfileUpdateModalProps) {
    const dispatch = useAppDispatch();
    const { user, loading, error, message } = useAppSelector((state) => state.auth);

    const [view, setView] = useState<'profile' | 'security'>('profile');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || '');
        }
    }, [user, isOpen]);

    useEffect(() => {
        if (message === 'Profile updated successfully') {
            setIsSuccess(true);
            const timer = setTimeout(() => {
                setIsSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Reset view when modal closes/opens
    useEffect(() => {
        if (!isOpen) {
            setView('profile');
            setPassword('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (fullName !== user?.full_name) {
            dispatch(updateUserProfile({ full_name: fullName }));
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return;
        }

        setPasswordError(null);
        if (password) {
            dispatch(updateUserProfile({ password }));
            setPassword('');
            setConfirmPassword('');
        }
    };

    const getUserInitials = () => {
        if (user?.full_name) {
            const names = user.full_name.split(' ');
            return names.length > 1
                ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
                : names[0][0].toUpperCase();
        }
        return user?.email?.[0]?.toUpperCase() || 'U';
    };

    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    const timezoneOffset = -new Date().getTimezoneOffset() / 60;
    const timezoneString = `(UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset})`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
                {/* Header Actions */}
                <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
                    {view === 'security' && (
                        <button
                            onClick={() => setView('profile')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 flex items-center gap-1"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <div className="absolute right-4 top-4 z-10">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Profile Top Section */}
                <div className="pt-12 pb-6 flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full bg-[#D6EFFF] flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                            <span className="text-3xl font-bold text-blue-600">
                                {getUserInitials()}
                            </span>
                        </div>
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#4ADE80] border-4 border-white rounded-full shadow-sm" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {view === 'security' ? 'Security Settings' : (user?.full_name || 'User')}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">{user?.email}</p>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{timezoneString} • {currentTime}</span>
                        <span className="w-1 h-1 bg-blue-500 rounded-full" />
                        <span className="text-gray-500 font-medium">Online</span>
                    </div>
                </div>

                <div className="px-8">
                    <div className="h-px bg-gray-100 w-full" />
                </div>

                {/* View Controller */}
                <div className="p-8 pb-10">
                    {passwordError && (
                        <div className="mb-6 p-3 rounded-xl bg-orange-50 text-orange-600 text-sm font-medium border border-orange-100 italic">
                            {passwordError}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    {isSuccess && (
                        <div className="mb-6 p-3 rounded-xl bg-green-50 text-green-600 text-sm font-medium border border-green-100 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            {view === 'security' ? 'Password updated' : 'Profile updated'}
                        </div>
                    )}

                    {view === 'profile' ? (
                        <form onSubmit={handleUpdateName} className="space-y-8">
                            <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                                <label className="text-xs font-bold text-black uppercase tracking-widest px-1">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full px-5 py-3.5 rounded-2xl border border-black bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900 font-semibold placeholder:text-gray-300"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-xs font-bold text-black uppercase tracking-widest">Security</label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setView('security')}
                                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-black hover:bg-gray-50 hover:border-gray-200 transition-all group"
                                >
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <Lock className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <span className="font-bold text-sm">Update Password</span>
                                    </div>
                                    <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180 group-hover:text-gray-500 transition-colors" />
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || fullName === user?.full_name}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-30 disabled:hover:translate-y-0 disabled:shadow-none mt-4"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleUpdatePassword} className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                                    <label className="text-xs font-bold text-black uppercase tracking-widest px-1">New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (passwordError) setPasswordError(null);
                                        }}
                                        placeholder="Min. 8 characters"
                                        className="w-full px-5 py-3.5 rounded-2xl border border-black bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900 font-semibold placeholder:text-gray-300"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
                                    <label className="text-xs font-bold text-black uppercase tracking-widest px-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (passwordError) setPasswordError(null);
                                        }}
                                        placeholder="Repeat your password"
                                        className="w-full px-5 py-3.5 rounded-2xl border border-black bg-gray-50/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900 font-semibold placeholder:text-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !password || !confirmPassword}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-black text-white text-sm font-bold shadow-xl shadow-black/10 hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-30 disabled:hover:translate-y-0 disabled:shadow-none"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setView('profile')}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-gray-500 text-sm font-bold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
