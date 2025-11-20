'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Edit2, UserPlus, Loader2, Search, Users, UserMinus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  updateTopic,
  deleteTopic,
  addTopicMember,
  removeTopicMember,
  fetchUsersForTopicAddition
} from '@/lib/features/channels/channelsThunk';
import { Topic, UserForTopicAddition } from '@/lib/types';

interface ManageTopicModalProps {
  topic: Topic;
  onClose: () => void;
}

export function ManageTopicModal({ topic, onClose }: ManageTopicModalProps) {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<UserForTopicAddition[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [name, setName] = useState(topic.name);
  const [description, setDescription] = useState(topic.description || '');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (showAddMembers) {
      loadUsers();
    }
  }, [showAddMembers]);

  useEffect(() => {
    if (showAddMembers && searchQuery !== undefined) {
      const timer = setTimeout(() => {
        loadUsers();
      }, 300); // Debounce search
      return () => clearTimeout(timer);
    }
  }, [searchQuery, showAddMembers]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const result = await dispatch(
        fetchUsersForTopicAddition({
          topicId: topic.id,
          search: searchQuery || undefined
        })
      ).unwrap();
      setUsers(result);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await dispatch(
        updateTopic({
          topicId: topic.id,
          data: { name: name.trim(), description: description.trim() || undefined },
        })
      ).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deleteTopic(topic.id)).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to delete topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      await dispatch(addTopicMember({ topicId: topic.id, userId })).unwrap();
      // Refresh users list to update is_member status
      await loadUsers();
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await dispatch(removeTopicMember({ topicId: topic.id, userId })).unwrap();
      // Refresh users list to update is_member status
      await loadUsers();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {showAddMembers ? 'Manage Members' : showDeleteConfirm ? 'Delete Topic' : 'Manage Topic'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
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
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Topic?
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Are you sure you want to delete <span className="font-semibold text-gray-900">#{topic.name}</span>?
                This will delete all messages in this topic. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Topic'}
              </button>
            </div>
          </div>
        ) : showAddMembers ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#1A73E8]"
                />
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="flex-1 overflow-hidden flex">
              {usersLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1A73E8]" />
                </div>
              ) : (
                <>
                  {/* Current Members */}
                  <div className="flex-1 border-r border-gray-200 flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <h3 className="text-sm font-semibold text-gray-900">
                          Current Members ({users.filter(u => u.is_member).length})
                        </h3>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      {users.filter(u => u.is_member).length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          No members yet
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {users.filter(u => u.is_member).map((user) => {
                            const isCurrentUser = user.id === currentUser?.id;
                            return (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                    {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate flex items-center gap-2">
                                      {user.full_name || user.email}
                                      {isCurrentUser && (
                                        <span className="text-xs text-gray-500">(You)</span>
                                      )}
                                    </div>
                                    {user.full_name && (
                                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                    )}
                                  </div>
                                </div>
                                {!isCurrentUser && (
                                  <button
                                    onClick={() => handleRemoveMember(user.id)}
                                    className="ml-2 p-1.5 rounded-md text-red-400 hover:bg-red-600/20 transition-colors flex-shrink-0"
                                    title="Remove member"
                                  >
                                    <UserMinus className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Available to Add */}
                  <div className="flex-1 flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-gray-600" />
                        <h3 className="text-sm font-semibold text-gray-900">
                          Add Members ({users.filter(u => !u.is_member).length})
                        </h3>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      {users.filter(u => !u.is_member).length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          {searchQuery ? 'No users found' : 'All users are members'}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {users.filter(u => !u.is_member).map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                  {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {user.full_name || user.email}
                                  </div>
                                  {user.full_name && (
                                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleAddMember(user.id)}
                                className="ml-2 p-1.5 rounded-md bg-[#1A73E8] text-white hover:bg-[#1557B0] transition-colors flex-shrink-0"
                                title="Add member"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowAddMembers(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#1A73E8]"
                placeholder="e.g., general-chat, project-updates"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#1A73E8] resize-none"
                placeholder="What's this topic about?"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMembers(true)}
                className="px-4 py-2 bg-[#1A73E8]/20 text-[#1A73E8] rounded-md hover:bg-[#1A73E8]/30 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Members
              </button>
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
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
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
