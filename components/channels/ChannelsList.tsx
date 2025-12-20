'use client';

import React, {useState, useRef, useEffect} from 'react';
import {Channel, UserWithChatInfo} from '@/lib/types';
import {Plus, LogOut, ChevronDown, Settings, Bot, MessageCircle, Check, Loader2} from 'lucide-react';
import {useAppDispatch, useAppSelector} from '@/lib/hooks';
import {logoutUser} from '@/lib/slices/authThunk';
import {fetchAgents} from '@/lib/slices/agentsSlice';
import {fetchDirectMessages} from '@/lib/slices/directMessagesSlice';
import {notificationService} from '@/lib/services/notificationService';

interface ChannelsListProps {
    channels: Channel[];
    selectedChannelId: string | null;
    onChannelSelect: (channel: Channel) => void;
    onCreateChannel?: () => void;
    isAdmin?: boolean;
    onOpenSettings?: () => void;
    onDirectMessagesClick?: () => void;
    onAgentsClick?: () => void;
    agentsActive?: boolean;
    directMessagesActive?: boolean;
    adminViewActive?: boolean;
}

export function ChannelsList({
                                 channels,
                                 selectedChannelId,
                                 onChannelSelect,
                                 onCreateChannel,
                                 isAdmin,
                                 onOpenSettings,
                                 onDirectMessagesClick,
                                 onAgentsClick,
                                 agentsActive = false,
                                 directMessagesActive = false,
        adminViewActive = false,
                             }: ChannelsListProps) {
    const dispatch = useAppDispatch();
    const {user, token} = useAppSelector((state) => state.auth);
    const {agents} = useAppSelector((state) => state.agents);
    const {users: directMessageUsers} = useAppSelector((state) => state.directMessages);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
    const [isTogglingNotification, setIsTogglingNotification] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch agents and direct messages on mount
    useEffect(() => {
        dispatch(fetchAgents());
        dispatch(fetchDirectMessages());
    }, [dispatch]);

    useEffect(() => {
        const checkNotificationStatus = async () => {
            const isSubscribed = await notificationService.isSubscribed();
            setIsNotificationEnabled(isSubscribed);
        };
        checkNotificationStatus();
    }, []);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    const handleToggleNotifications = async () => {
        if (!token) return;

        setIsTogglingNotification(true);
        try {
            const {
                subscribeToNotifications,
                unsubscribeFromNotifications
            } = await import('@/lib/features/notifications/notificationSlice');

            if (isNotificationEnabled) {
                const resultAction = await dispatch(unsubscribeFromNotifications());
                if (unsubscribeFromNotifications.fulfilled.match(resultAction)) {
                    setIsNotificationEnabled(false);
                }
            } else {
                const resultAction = await dispatch(subscribeToNotifications());
                if (subscribeToNotifications.fulfilled.match(resultAction)) {
                    setIsNotificationEnabled(true);
                }
            }
        } catch (error) {
            console.error('Failed to toggle notifications:', error);
        } finally {
            setIsTogglingNotification(false);
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const getNavButtonClasses = (active: boolean) => `w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
        active
            ? 'bg-[#1A73E8] text-white'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;

    const effectiveDirectMessagesActive = directMessagesActive && !adminViewActive;
    const effectiveAgentsActive = agentsActive && !adminViewActive;

    return (
        <div
            className={`bg-[#e8e8eb] flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-14'
            }`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* User Info / Workspace Header */}
            <div className={`${isExpanded ? 'px-2' : 'px-1.5'} pt-3 pb-2`} ref={dropdownRef}>
                <div
                    className={`rounded-2xl border transition-all ${showDropdown || adminViewActive ? 'bg-white border-gray-200 shadow-xl ring-1 ring-[#1A73E8]/30' : 'border-transparent'}`}
                >
                    <button
                        type="button"
                        onClick={() => setShowDropdown((prev) => !prev)}
                        className={`w-full flex items-center rounded-2xl transition-all ${isExpanded ? 'gap-3 px-2.5 py-2.5' : 'gap-0 justify-center px-1.5 py-1.5'
                        } ${adminViewActive ? 'text-[#1A73E8]' : ''}`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0 relative">
                            <span className="text-[15px] font-bold text-white">A</span>
                            {adminViewActive && !isExpanded && (
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#1A73E8] border border-white shadow-sm" />
                            )}
                        </div>
                        <div
                            className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 text-left ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                            }`}
                        >
                            <div className="text-sm font-semibold text-gray-900 truncate">Armada Dan</div>
                            <div className="text-xs text-gray-500 truncate">Workspace</div>
                        </div>
                        <ChevronDown
                            className={`w-4 h-4 text-gray-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {showDropdown && isExpanded && (
                        <div className="px-2.5 pb-3 space-y-3 border-t border-gray-100">
                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    Notifications
                                </div>
                                <div className="rounded-xl border border-gray-100 bg-white/90 px-3 py-2 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900">Push notifications</p>
                                        <p className="text-xs text-gray-500 truncate">Stay updated from Armada Den</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isTogglingNotification && (
                                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin"/>
                                        )}
                                        <button
                                            onClick={handleToggleNotifications}
                                            disabled={isTogglingNotification}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                                isNotificationEnabled ? 'bg-[#1A73E8]' : 'bg-gray-300'
                                            } ${isTogglingNotification ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
                                            aria-pressed={isNotificationEnabled}
                                        >
                                            <span className="sr-only">Toggle notifications</span>
                                            <span
                                                className={`block h-5 w-5 rounded-full bg-white shadow-sm transform transition ${
                                                    isNotificationEnabled ? 'translate-x-5' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 rounded-xl border border-white px-2 py-2">
                                <div
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
                                >
                                    <span className="text-sm font-semibold text-white">{getUserInitials()}</span>
                                </div>

                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                        {user?.full_name || 'User'}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {user?.email}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                {/* Settings */}
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        onOpenSettings?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <Settings className="w-4 h-4"/>
                                    Settings
                                </button>

                                {/* Logout */}
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4"/>
                                    Log out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Agents Section */}
             <div className="px-2 pt-2">
                <button
                    onClick={onAgentsClick}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors
      ${agentsActive
                        ? "bg-[#1A73E8] text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    title="Agents"
                >
                    <Bot
                        className={`w-6 h-6 flex-shrink-0 ${agentsActive ? "text-white" : "text-gray-800"}`}
                    />
                    <span
                        className={`truncate transition-all duration-300 
        ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"}
      `}
                    >
      Agents
    </span>
                </button>
            </div>

            {/* Direct Messages Section */}
            <div className="px-2 py-2">
                <button
                    onClick={onDirectMessagesClick}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors
      ${effectiveDirectMessagesActive
                        ? "bg-white text-[#1A73E8]"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    title="Direct Messages"
                >
                    <MessageCircle
                        className={`w-6 h-6 flex-shrink-0 ${effectiveDirectMessagesActive ? "text-[#1A73E8]" : "text-gray-700"}`}
                    />

                    <span
                        className={`truncate transition-all duration-300 
        ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"}
      `}
                    >
      Direct Messages
    </span>

                    {/* Unread badge */}
                    {directMessageUsers.reduce((sum: number, u: UserWithChatInfo) => sum + u.unread_count, 0) > 0 && (
                        <span
                            className={`
          ml-auto text-xs font-semibold px-2 py-0.5 rounded-full 
          ${effectiveDirectMessagesActive ? "bg-[#E3EEFF] text-[#1A73E8]" : "bg-blue-600 text-white"}
          ${isExpanded ? "opacity-100" : "opacity-0"}
        `}
                        >
        {directMessageUsers.reduce((sum: number, u: UserWithChatInfo) => sum + u.unread_count, 0)}
      </span>
                    )}
                </button>
            </div>

            {/* Channels Header */}
            <div
                className={`px-3 py-2 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 py-0'
                }`}
                style={{
                    color: '#3D3D3D',
                    fontFamily: '"General Sans Variable", system-ui, sans-serif',
                    fontSize: '14px',
                    fontWeight: 450,
                }}
            >
                CHANNELS
            </div>

            {/* Channels */}
            <div className="flex-1 flex flex-col gap-1 px-2 overflow-y-auto">
                {channels.map((channel) => {
                    const isSelected = selectedChannelId === channel.id && !adminViewActive;
                    const iconBaseClasses =
                        'w-6 h-6 rounded flex items-center justify-center flex-shrink-0';
                    const iconColorClasses = isSelected
                        ? 'bg-[#E3EEFF] text-[#1A73E8]'
                        : 'bg-black text-white';

                    return (
                        <button
                            key={channel.id}
                            onClick={() => onChannelSelect(channel)}
                            className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors ${isSelected
                                ? 'bg-white text-[#1A73E8]'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                            title={channel.name}
                        >
                            {channel.name.includes('HireArmada') ? (
                                <span
                                    className={`${iconBaseClasses} ${iconColorClasses} overflow-hidden p-0.5`}>
                  <img
                      src="/logo_black.png"
                      alt="HireArmada"
                      className={`w-full h-full object-contain ${isSelected ? '' : 'invert'}`}
                  />
                </span>
                            ) : (
                                <span
                                    className={`${iconBaseClasses} ${iconColorClasses} text-xs font-bold`}>
                  {channel.name.charAt(0).toUpperCase()}
                </span>
                            )}
                            <span
                                className={`truncate transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                                }`}
                            >
                {channel.name}
              </span>
                        </button>
                    );
                })}

                {/* Add Channel Button */}
                {isAdmin && onCreateChannel && (
                    <button
                        onClick={onCreateChannel}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        title="Create Channel"
                    >
            <span className="w-6 h-6 rounded bg-black flex items-center justify-center flex-shrink-0">
              <Plus className="w-4 h-4 text-white"/>
            </span>
                        <span
                            className={`truncate transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                            }`}
                        >
              Create Channel
            </span>
                    </button>
                )}
            </div>


        </div>
    );
} 
