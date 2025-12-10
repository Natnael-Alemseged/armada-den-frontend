'use client';

import React, { useState } from 'react';
import { RefreshCw, LogOut, Clock } from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { fetchUserProfile } from '@/lib/slices/authThunk';
import { logoutUser } from '@/lib/slices/authThunk';

export function WaitingApprovalScreen() {
    const dispatch = useAppDispatch();
    const [isChecking, setIsChecking] = useState(false);

    const handleCheckStatus = async () => {
        setIsChecking(true);
        try {
            await dispatch(fetchUserProfile()).unwrap();
            // If successful and user is approved, the auth state will update
            // and this component will unmount automatically
        } catch (error) {
            console.error('Failed to check approval status:', error);
        } finally {
            setIsChecking(false);
        }
    };

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo/Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg mb-4">
                        <span className="text-2xl font-bold text-white">A</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Armada Den</h1>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center">
                                <Clock className="w-10 h-10 text-yellow-500" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center">
                                <span className="text-white text-xs font-bold">!</span>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                        Pending Approval
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 text-center mb-6">
                        Your account has been created successfully! An administrator will review and approve your account shortly.
                    </p>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">What's next?</span>
                            <br />
                            You'll receive access to Armada Den once an admin approves your registration. This usually takes a few minutes to a few hours.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleCheckStatus}
                            disabled={isChecking}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                        >
                            <RefreshCw className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
                            {isChecking ? 'Checking...' : 'Check Status'}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Need help? Contact your administrator
                </p>
            </div>
        </div>
    );
}
