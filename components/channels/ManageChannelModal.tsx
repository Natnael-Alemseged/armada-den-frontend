'use client';

import React, { useState } from 'react';
import { X, Trash2, Edit2 } from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { updateChannel, deleteChannel } from '@/lib/features/channels/channelsThunk';
import { Channel } from '@/lib/types';

interface ManageChannelModalProps {
  channel: Channel;
  onClose: () => void;
}

export function ManageChannelModal({ channel, onClose }: ManageChannelModalProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description || '');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await dispatch(
        updateChannel({
          channelId: channel.id,
          data: { name: name.trim(), description: description.trim() || undefined },
        })
      ).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update channel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deleteChannel(channel.id)).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to delete channel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-lg shadow-xl max-w-md w-full border border-[#2A2A2A]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
          <h2 className="text-lg font-semibold text-white">Manage Channel</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2A2A2A] rounded transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showDeleteConfirm ? (
          <div className="p-6">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-white text-center mb-2">
                Delete Channel?
              </h3>
              <p className="text-sm text-gray-400 text-center">
                Are you sure you want to delete <span className="font-semibold text-white">#{channel.name}</span>? 
                This will delete all topics and messages in this channel. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-[#2A2A2A] text-white rounded-md hover:bg-[#3A3A3A] transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Channel'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Channel Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#2A2A2A] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#1A73E8]"
                placeholder="e.g., general, random, dev-team"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#2A2A2A] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#1A73E8] resize-none"
                placeholder="What's this channel about?"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600/20 text-red-400 rounded-md hover:bg-red-600/30 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#2A2A2A] text-white rounded-md hover:bg-[#3A3A3A] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1A73E8] text-white rounded-md hover:bg-[#1557B0] transition-colors flex items-center gap-2"
                disabled={loading || !name.trim()}
              >
                <Edit2 className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
