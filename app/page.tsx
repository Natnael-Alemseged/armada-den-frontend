'use client';

import { useAppSelector } from '@/lib/hooks';
import { LoginForm } from '@/components/auth/LoginForm';
import { MainLayout } from '@/components/layout/MainLayout';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading,token } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <MainLayout />;
}
