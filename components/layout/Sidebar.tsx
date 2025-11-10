'use client';

import React from 'react';
import { Mail, Users, MessageSquare, LogOut, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logoutUser } from '@/lib/slices/authThunk';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: 'gmail' | 'messages' | 'chat';
  onTabChange: (tab: 'gmail' | 'messages' | 'chat') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ activeTab, onTabChange, isCollapsed, onToggleCollapse }: SidebarProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const tabs = [
    { id: 'gmail' as const, icon: Mail, label: 'Gmail', description: 'Email management' },
    { id: 'messages' as const, icon: Users, label: 'Messages', description: 'Chat with users' },
    { id: 'chat' as const, icon: MessageSquare, label: 'AI Chat', description: 'AI assistant' },
  ];

  return (
    <div 
      className={cn(
        'relative bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out shadow-lg',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 z-10 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className={cn(
          'flex items-center gap-3 transition-all duration-300',
          isCollapsed && 'justify-center'
        )}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-bold text-lg">AD</span>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                Armada Den
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md scale-[1.02]'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:scale-[1.02]',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? tab.label : undefined}
            >
              <Icon className={cn(
                'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                isActive && 'scale-110'
              )} />
              {!isCollapsed && (
                <div className="flex-1 text-left overflow-hidden">
                  <span className="font-medium block truncate">{tab.label}</span>
                  <span className={cn(
                    "text-xs block truncate transition-colors",
                    isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {tab.description}
                  </span>
                </div>
              )}
              {isActive && !isCollapsed && (
                <div className="w-1 h-8 bg-white/30 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-1 bg-gray-50/50 dark:bg-gray-800/50">
        <button
          className={cn(
            'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-[1.02]',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </button>
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-[1.02]',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}