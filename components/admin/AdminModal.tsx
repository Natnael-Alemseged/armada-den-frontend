'use client';

import React, { useEffect } from 'react';
import { Check, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPendingUsers, approveUser, rejectUser } from '@/lib/features/admin/adminThunk';
import { User } from '@/lib/types';

interface AdminApprovalViewProps {
    onBack?: () => void;
}

export function AdminApprovalView({ onBack }: AdminApprovalViewProps) {
    const dispatch = useAppDispatch();
    const { pendingUsers, loading, error } = useAppSelector((state) => state.admin);

    useEffect(() => {
        dispatch(fetchPendingUsers());
    }, [dispatch]);

    const handleApprove = async (userId: string) => {
        try {
            await dispatch(approveUser(userId)).unwrap();
            // User is removed from list by extraReducer, but we can also manually ensure it if needed
        } catch (err) {
            console.error("Failed to approve user", err);
        }
    };

    const handleReject = async (userId: string) => {
        try {
            await dispatch(rejectUser(userId)).unwrap();
        } catch (err) {
            console.error("Failed to reject user", err);
        }
    };

    const handleRetry = () => {
        dispatch(fetchPendingUsers());
    };

    return (
        <div className="flex-1 flex flex-col bg-white h-full">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                    {/* {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )} */}
                    <div>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Admin</p>
                        <h1 className="text-2xl font-semibold text-gray-900">Pending Approvals</h1>
                        <p className="text-sm text-gray-500">Review and approve new user registrations</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Pending Users</p>
                    <p className="text-xl font-semibold text-gray-900">{pendingUsers.length}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="max-w-3xl mx-auto space-y-4">
                    {loading && pendingUsers.length === 0 ? (
                        <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500">
                            Loading pending users...
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border border-red-100 text-red-500 gap-3 shadow-sm">
                            <p>{error}</p>
                            <button
                                onClick={handleRetry}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Retry
                            </button>
                        </div>
                    ) : pendingUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-500 gap-2 shadow-sm">
                            <p className="text-base font-medium text-gray-700">All caught up!</p>
                            <p className="text-sm text-gray-500">No pending users waiting for approval.</p>
                        </div>
                    ) : (
                        pendingUsers.map((user: User) => (
                            <div
                                key={user.id}
                                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-200 transition-colors"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md">
                                        {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                                            {user.full_name || 'Unknown User'}
                                        </h4>
                                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                        <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400">
                                            <span className="w-2 h-2 rounded-full bg-yellow-400" />
                                            Awaiting approval
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleReject(user.id)}
                                        className="px-4 py-2 rounded-xl border border-red-100 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors flex items-center gap-2"
                                        title="Reject"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(user.id)}
                                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                        title="Approve"
                                    >
                                        <Check className="w-4 h-4" />
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
