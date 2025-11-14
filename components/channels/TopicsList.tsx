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
      <div className="w-80 bg-[#0D0D0D] border-r border-[#1A1A1A] flex flex-col">
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
    <div className="w-80 bg-[#0D0D0D] border-r border-[#1A1A1A] flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-[#1A1A1A] flex items-center justify-between px-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg">{channel.icon || '#'}</span>
          <h2 className="text-white font-semibold truncate text-base">{channel.name}</h2>
        </div>
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

      {/* Search Bar */}
      <div className="p-3 border-b border-[#1A1A1A]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1A73E8]"
          />
        </div>
      </div>

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto">
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
          <div className="py-1">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className={`w-full flex items-start gap-3 px-4 py-3 transition-colors border-l-2 group ${
                  selectedTopicId === topic.id
                    ? 'bg-[#1A1A1A] border-[#1A73E8]'
                    : 'border-transparent hover:bg-[#151515]'
                }`}
              >
                <button
                  onClick={() => onTopicSelect(topic)}
                  className="flex items-start gap-3 flex-1 min-w-0 text-left"
                >
                  {topic.unread_count && topic.unread_count > 0 && (
                    <div className="w-2 h-2 rounded-full bg-[#1A73E8] mt-1.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium truncate ${
                        selectedTopicId === topic.id ? 'text-white' : 'text-gray-200'
                      }`}>
                        {topic.name}
                      </span>
                    </div>
                    {topic.description && (
                      <p className="text-xs text-gray-500 truncate">
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
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2A2A2A] rounded transition-all text-gray-500 hover:text-gray-300"
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
