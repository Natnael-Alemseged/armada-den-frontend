'use client';

import React from 'react';
import { Mail, Search, MessageSquare, LogOut, Settings } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logoutUser } from '@/lib/slices/authThunk';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: 'gmail' | 'search' | 'chat';
  onTabChange: (tab: 'gmail' | 'search' | 'chat') => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const tabs = [
    { id: 'gmail' as const, icon: Mail, label: 'Gmail' },
    { id: 'search' as const, icon: Search, label: 'Search' },
    { id: 'chat' as const, icon: MessageSquare, label: 'Chat' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Armada Den
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {user?.email}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                activeTab === tab.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}