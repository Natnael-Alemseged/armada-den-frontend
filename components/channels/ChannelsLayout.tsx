'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchChannels, fetchUserTopics } from '@/lib/features/channels/channelsThunk';
import { setCurrentChannel, setCurrentTopic } from '@/lib/features/channels/channelsSlice';
import { ChannelsSidebar } from './ChannelsSidebar';
import { TopicView } from './TopicView';
import { Channel, Topic } from '@/lib/types';
import { Hash, Loader2 } from 'lucide-react';

export function ChannelsLayout() {
  const dispatch = useAppDispatch();
  const { channels, topics, currentChannel, currentTopic, loading } = useAppSelector(
    (state) => state.channels
  );
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Fetch channels and user's topics on mount
    dispatch(fetchChannels());
    dispatch(fetchUserTopics());
  }, [dispatch]);

  const handleChannelSelect = (channel: Channel) => {
    dispatch(setCurrentChannel(channel));
    dispatch(setCurrentTopic(null));
  };

  const handleTopicSelect = (topic: Topic) => {
    dispatch(setCurrentTopic(topic));
  };

  if (loading && channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <ChannelsSidebar
        channels={channels}
        topics={topics}
        currentChannel={currentChannel}
        currentTopic={currentTopic}
        onChannelSelect={handleChannelSelect}
        onTopicSelect={handleTopicSelect}
        isAdmin={user?.role === 'ADMIN' || user?.is_superuser}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentTopic ? (
          <TopicView topic={currentTopic} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <Hash className="w-16 h-16 mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">Welcome to Armada Den</h2>
            <p className="text-center max-w-md">
              Select a topic from the sidebar to start chatting with your team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
