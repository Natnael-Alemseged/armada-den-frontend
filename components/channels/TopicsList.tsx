'use client';

import React, { useState } from 'react';
import { Topic, Channel } from '@/lib/types';
import { Hash, Plus, Lock, Search, Settings, Pencil } from 'lucide-react';
import { ManageChannelModal } from './ManageChannelModal';
import { ManageTopicModal } from './ManageTopicModal';
import { useNotificationContext } from '@/components/providers/NotificationProvider';

interface TopicsListProps {
  channel: Channel | null;
  topics: Topic[];
  selectedTopicId: string | null;
  onTopicSelect: (topic: Topic) => void;
  onCreateTopic?: () => void;
  isAdmin?: boolean;
}

export function TopicsList({
  channel,
  topics,
  selectedTopicId,
  onTopicSelect,
  onCreateTopic,
  isAdmin,
}: TopicsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showManageChannel, setShowManageChannel] = useState(false);
  const [managingTopic, setManagingTopic] = useState<Topic | null>(null);
  
  // Get real-time unread counts
  let getUnreadCount = (topicId: string) => 0;
  try {
    const { getUnreadCount: contextGetUnreadCount } = useNotificationContext();
    getUnreadCount = contextGetUnreadCount;
  } catch (error) {
    // Context not available, use topic.unread_count as fallback
    console.warn('NotificationContext not available in TopicsList');
  }

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!channel) {
    return (
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center px-4">
            <Hash className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Select a channel to view topics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-900 font-semibold text-lg">
            # {channel.name}
          </h2>
          {isAdmin && (
            <button
              onClick={() => setShowManageChannel(true)}
              className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
              title="Manage Channel"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-9 pr-3 py-2 bg-gray-100 border-none rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
          />
        </div>
      </div>

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTopics.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">
              {searchQuery ? 'No topics found' : 'No topics yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 px-4 pt-2 pb-4">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className={`group relative rounded-xl transition-all ${selectedTopicId === topic.id
                  ? 'bg-gray-100 shadow-sm'
                  : 'bg-white hover:shadow-sm'
                  }`}
              >
                {/* Blue left curve */}
                {selectedTopicId === topic.id && (
                  <div className="absolute left-0 top-0 h-full w-0.5 bg-blue-500 rounded-l-xl" />
                )}


                <button
                  onClick={() => onTopicSelect(topic)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-medium text-black">
                        {topic.name}
                      </h3>


                      {/* Message count next to title - Real-time updates */}
                      {(() => {
                        const unreadCount = getUnreadCount(topic.id) || topic.unread_count || 0;
                        return unreadCount > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white">
                            {unreadCount}
                          </span>
                        ) : null;
                      })()}
                    </div>

                    {topic.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {topic.description}
                      </p>
                    )}
                  </div>


                </button>

              </div>
            ))}
          </div>
        )}
      </div>
      {/* Create Topic Button */}
      {isAdmin && onCreateTopic && filteredTopics.length > 0 && (
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={onCreateTopic}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
          >
            {/* The container for the icon is now styled with blue background and white content */}
            <div className="bg-blue-500 rounded p-1">
              <Plus className="w-4 h-4 text-white" />
            </div>

            {/* The text remains grey as defined in the button's main class */}
            <span className="text-sm">Add Topic</span>
          </button>
        </div>
      )}

      {/* Modals */}
      {showManageChannel && channel && (
        <ManageChannelModal
          channel={channel}
          onClose={() => setShowManageChannel(false)}
        />
      )}
      {managingTopic && (
        <ManageTopicModal
          topic={managingTopic}
          onClose={() => setManagingTopic(null)}
        />
      )}
    </div>
  );
}
