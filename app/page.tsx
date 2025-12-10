'use client';

import { useAppSelector } from '@/lib/hooks';
import { LoginForm } from '@/components/auth/LoginForm';
import { MainLayout } from '@/components/layout/MainLayout';
import { WaitingApprovalScreen } from '@/components/auth/WaitingApprovalScreen';
import { Loader2 } from 'lucide-react';
import React from "react";

export default function Home() {
  const { user, loading,token } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user;

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="relative p-5 rounded-3xl border-2 border-white bg-white/30 backdrop-blur-md shadow-lg">
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-[4px] border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-blue-500 border-l-blue-400 animate-spin"></div>
                </div>
            </div>
        </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Check if user is verified but not approved
  if (user && user.is_verified && !user.is_approved) {
    return <WaitingApprovalScreen />;
  }

  return <MainLayout />;
}
