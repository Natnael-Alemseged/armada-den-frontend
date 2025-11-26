'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchChannels, fetchUserTopics, fetchTopicsByChannel } from '@/lib/features/channels/channelsThunk';
import { setCurrentChannel, setCurrentTopic } from '@/lib/features/channels/channelsSlice';
import { getGmailStatus } from '@/lib/features/gmail/gmailThunk';
import { getSearchStatus } from '@/lib/features/search/searchThunk';
import { ChannelsList } from './ChannelsList';
import { TopicsList } from './TopicsList';
import { TopicView } from './TopicView';
import { CreateChannelModal } from './CreateChannelModal';
import { CreateTopicModal } from './CreateTopicModal';
import { NotificationPrompt } from '@/components/ui/NotificationPrompt';
import { Channel, Topic, TopicMessage } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function ChannelsLayout() {
  const dispatch = useAppDispatch();
  const { channels, topics, currentChannel, currentTopic, loading } = useAppSelector(
    (state) => state.channels
  );
  const { user, token } = useAppSelector((state) => state.auth);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(true);

  useEffect(() => {
    // Fetch channels and user's topics on mount
    dispatch(fetchChannels());
    dispatch(fetchUserTopics());

    // Check Gmail and Search connection status
    dispatch(getGmailStatus());
    // dispatch(getSearchStatus());
  }, [dispatch]);

  useEffect(() => {
    // Fetch topics when channel changes
    if (currentChannel) {
      dispatch(fetchTopicsByChannel(currentChannel.id));
    }
  }, [currentChannel, dispatch]);

  const handleChannelSelect = (channel: Channel) => {
    dispatch(setCurrentChannel(channel));
    dispatch(setCurrentTopic(null));
  };

  const handleTopicSelect = (topic: Topic) => {
    dispatch(setCurrentTopic(topic));
  };

  const getTopicsForChannel = () => {
    if (!currentChannel) return [];
    return topics.filter((topic: Topic) => topic.channel_id === currentChannel.id);
  };

  if (loading && channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="relative p-5 rounded-3xl border-2 border-white bg-white/30 backdrop-blur-md shadow-lg">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-[4px] border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-blue-500 border-l-blue-400 animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Notification Prompt Banner */}
      {showNotificationPrompt && (
        <NotificationPrompt 
          token={token || undefined}
          onDismiss={() => setShowNotificationPrompt(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Column 1: Channels */}
        <ChannelsList
        channels={channels}
        selectedChannelId={currentChannel?.id || null}
        onChannelSelect={handleChannelSelect}
        onCreateChannel={() => setShowCreateChannel(true)}
        isAdmin={user?.is_superuser}
      />

      {/* Column 2: Topics - Only show when channel is selected */}
      {currentChannel && (
        <TopicsList
          channel={currentChannel}
          topics={getTopicsForChannel()}
          selectedTopicId={currentTopic?.id || null}
          onTopicSelect={handleTopicSelect}
          onCreateTopic={() => setShowCreateTopic(true)}
          isAdmin={user?.is_superuser}
        />
      )}

      {/* Column 3: Messages/Chat or Welcome Screen */}
      {currentTopic ? (
        <TopicView topic={currentTopic} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-600 bg-white">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-32 h-32 mb-4 object-contain"
          >
            <source src="/logo.mp4" type="video/mp4" />
          </video>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Welcome to Armada Den</h2>
          <p className="text-center max-w-md text-sm">
            {!currentChannel
              ? 'Select a channel to get started'
              : 'Select a topic to start chatting with your team'}
          </p>
        </div>
      )}

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
      </div>
    </div>
  );
}
