'use client';

import React, { useState } from 'react';
import { Topic, Channel } from '@/lib/types';
import { Hash, Plus, Lock, Search, Settings } from 'lucide-react';
import { ManageChannelModal } from './ManageChannelModal';
import { ManageTopicModal } from './ManageTopicModal';

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

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!channel) {
    return (
      <div className="w-96 bg-[#0D0D0D] border-r border-[#1A1A1A] flex flex-col">
        <div className="flex-1 flex items-center justify-center text-gray-600">
          <div className="text-center px-4">
            <Hash className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Select a channel to view topics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-[#0D0D0D] border-r border-[#1A1A1A] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1A1A1A]">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">
            # {channel.name}
          </h2>
          {isAdmin && (
            <button
              onClick={() => setShowManageChannel(true)}
              className="p-1 hover:bg-[#1A1A1A] rounded transition-colors text-gray-500 hover:text-gray-300"
              title="Manage Channel"
            >
              <Settings className="w-4 h-4" />
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
            className="w-full pl-9 pr-3 py-2 bg-[#1A1A1A] border-none rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
          />
        </div>
      </div>

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {filteredTopics.length === 0 ? (
          <div className="p-4 text-center text-gray-600">
            <p className="text-sm mb-3">{searchQuery ? 'No topics found' : 'No topics yet'}</p>
            {isAdmin && onCreateTopic && !searchQuery && (
              <button
                onClick={onCreateTopic}
                className="text-[#1A73E8] hover:underline text-sm"
              >
                Create your first topic
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className={`relative rounded-xl transition-all group ${
                  selectedTopicId === topic.id
                    ? 'bg-[#454545]/80'
                    : 'hover:bg-[#151515]/50'
                }`}
              >
                {/* Blue border indicator for selected topic */}
                {selectedTopicId === topic.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1A73E8] rounded-l-xl" />
                )}
                
                <button
                  onClick={() => onTopicSelect(topic)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left"
                >
                  {/* Unread indicator */}
                  {topic.unread_count && topic.unread_count > 0 && (
                    <div className="w-2 h-2 rounded-full bg-[#1A73E8] mt-2 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-medium mb-1 ${
                      selectedTopicId === topic.id ? 'text-white' : 'text-gray-200'
                    }`}>
                      {topic.name}
                    </h3>
                    {topic.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {topic.description}
                      </p>
                    )}
                  </div>
                </button>
                
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setManagingTopic(topic);
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2A2A2A] rounded transition-all text-gray-500 hover:text-gray-300"
                    title="Manage Topic"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Topic Button */}
      {isAdmin && onCreateTopic && filteredTopics.length > 0 && (
        <div className="border-t border-[#1A1A1A] p-2">
          <button
            onClick={onCreateTopic}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:bg-[#1A1A1A] rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
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
