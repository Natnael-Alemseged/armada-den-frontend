'use client';

import React, { useState } from 'react';
import { Channel, Topic } from '@/lib/types';
import { Hash, ChevronDown, ChevronRight, Plus, Settings, LogOut } from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { logoutUser } from '@/lib/slices/authThunk';
import { CreateChannelModal } from './CreateChannelModal';
import { CreateTopicModal } from './CreateTopicModal';

interface ChannelsSidebarProps {
  channels: Channel[];
  topics: Topic[];
  currentChannel: Channel | null;
  currentTopic: Topic | null;
  onChannelSelect: (channel: Channel) => void;
  onTopicSelect: (topic: Topic) => void;
  isAdmin?: boolean;
}

export function ChannelsSidebar({
  channels,
  topics,
  currentChannel,
  currentTopic,
  onChannelSelect,
  onTopicSelect,
  isAdmin,
}: ChannelsSidebarProps) {
  const dispatch = useAppDispatch();
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateTopic, setShowCreateTopic] = useState(false);

  const toggleChannel = (channelId: string) => {
    const newExpanded = new Set(expandedChannels);
    if (newExpanded.has(channelId)) {
      newExpanded.delete(channelId);
    } else {
      newExpanded.add(channelId);
    }
    setExpandedChannels(newExpanded);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const getTopicsForChannel = (channelId: string) => {
    return topics.filter((topic) => topic.channel_id === channelId);
  };

  return (
    <>
      <div className="w-64 bg-[#3F0E40] text-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#522653]">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Armada Den</h1>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-[#522653] rounded transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {/* Channels Header */}
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-sm font-semibold text-gray-300">Channels</span>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateChannel(true)}
                  className="p-1 hover:bg-[#522653] rounded transition-colors"
                  title="Create Channel"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Channels */}
            {channels.map((channel) => {
              const isExpanded = expandedChannels.has(channel.id);
              const channelTopics = getTopicsForChannel(channel.id);

              return (
                <div key={channel.id} className="mb-1">
                  {/* Channel Header */}
                  <button
                    onClick={() => {
                      toggleChannel(channel.id);
                      onChannelSelect(channel);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#522653] transition-colors ${
                      currentChannel?.id === channel.id ? 'bg-[#1164A3]' : ''
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="text-lg mr-1">{channel.icon || '#'}</span>
                    <span className="text-sm font-medium truncate flex-1 text-left">
                      {channel.name}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCreateTopic(true);
                          onChannelSelect(channel);
                        }}
                        className="p-1 hover:bg-[#350d36] rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Create Topic"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </button>

                  {/* Topics under this channel */}
                  {isExpanded && channelTopics.length > 0 && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {channelTopics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => onTopicSelect(topic)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#522653] transition-colors ${
                            currentTopic?.id === topic.id ? 'bg-[#1164A3]' : ''
                          }`}
                        >
                          <Hash className="w-4 h-4 flex-shrink-0 text-gray-400" />
                          <span className="text-sm truncate flex-1 text-left">{topic.name}</span>
                          {topic.unread_count && topic.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                              {topic.unread_count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {channels.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                {isAdmin ? (
                  <>
                    <p>No channels yet.</p>
                    <button
                      onClick={() => setShowCreateChannel(true)}
                      className="mt-2 text-blue-400 hover:underline"
                    >
                      Create your first channel
                    </button>
                  </>
                ) : (
                  <p>No channels available.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateChannel && (
        <CreateChannelModal onClose={() => setShowCreateChannel(false)} />
      )}
      {showCreateTopic && currentChannel && (
        <CreateTopicModal
          channelId={currentChannel.id}
          onClose={() => setShowCreateTopic(false)}
        />
      )}
    </>
  );
}
