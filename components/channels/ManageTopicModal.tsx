'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Trash2, Settings, Users, Search, UserPlus, UserMinus } from 'lucide-react';
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

type Tab = 'general' | 'members';

// Extracted UserCard component for better maintainability
interface UserCardProps {
  user: UserForTopicAddition;
  isMember: boolean;
  isCurrentUser: boolean;
  onAction: (userId: string) => void;
  isProcessing?: boolean;
}

function UserCard({ user, isMember, isCurrentUser, onAction, isProcessing }: UserCardProps) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors group w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
          {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
        </div>
        <div>
          <div className="font-medium text-gray-900">{user.full_name || 'Unknown'}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
      </div>
      {!isCurrentUser && (
        <button
          onClick={() => onAction(user.id)}
          disabled={isProcessing}
          className={`p-2 rounded-full transition-colors ${isMember
              ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isMember ? 'Remove member' : 'Add member'}
        >
          {isMember ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}

// Extracted EmptyState component
interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200">
      {message}
    </div>
  );
}

export function ManageTopicModal({ topic, onClose }: ManageTopicModalProps) {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);

  // UI State
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [users, setUsers] = useState<UserForTopicAddition[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());

  // Form State
  const [name, setName] = useState(topic.name);
  const [description, setDescription] = useState(topic.description || '');
  const [loading, setLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Fetch users immediately on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadUsers = useCallback(async () => {
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
  }, [dispatch, topic.id, searchQuery]);

  // Memoized filtered lists
  const { currentMembers, availableMembers } = useMemo(() => {
    return {
      currentMembers: users.filter(u => u.is_member),
      availableMembers: users.filter(u => !u.is_member)
    };
  }, [users]);

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
    if (deleteConfirmation !== topic.name) return;

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

  // Optimistic UI update for adding member
  const handleAddMember = useCallback(async (userId: string) => {
    // Mark user as processing
    setProcessingUsers(prev => new Set(prev).add(userId));

    // Optimistic update
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId ? { ...u, is_member: true } : u
      )
    );

    try {
      await dispatch(addTopicMember({ topicId: topic.id, userId })).unwrap();
    } catch (error) {
      console.error('Failed to add member:', error);
      // Revert on error
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? { ...u, is_member: false } : u
        )
      );
    } finally {
      setProcessingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }, [dispatch, topic.id]);

  // Optimistic UI update for removing member
  const handleRemoveMember = useCallback(async (userId: string) => {
    // Mark user as processing
    setProcessingUsers(prev => new Set(prev).add(userId));

    // Optimistic update
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId ? { ...u, is_member: false } : u
      )
    );

    try {
      await dispatch(removeTopicMember({ topicId: topic.id, userId })).unwrap();
    } catch (error) {
      console.error('Failed to remove member:', error);
      // Revert on error
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? { ...u, is_member: true } : u
        )
      );
    } finally {
      setProcessingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }, [dispatch, topic.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Topic & Members</h2>
            <p className="text-gray-500 mt-1">Add or remove people from the topic.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-100 p-6 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'general'
                  ? 'bg-white border border-gray-200 shadow-sm text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Settings className="w-5 h-5" />
              General
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'members'
                  ? 'bg-white border border-gray-200 shadow-sm text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                Members
              </div>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {currentMembers.length}
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            {activeTab === 'general' ? (
              <div className="max-w-2xl space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Topic Information</h3>
                  <p className="text-gray-500 text-sm mt-1">Update your topic's public details.</p>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      placeholder="e.g., Logo Redesign, API Architecture"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-1 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                      placeholder="What this topic is about?"
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || !name.trim()}
                      className="px-6 py-2 bg-[#007AFF] text-white rounded-full font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>

                <div className="pt-4 border-t border-gray-100">
                  <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Trash2 className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-900">Delete Topic</h3>
                        <p className="text-red-700 text-sm mt-1 font-medium">
                          Irreversible actions for this topic.
                        </p>
                        <p className="text-red-600 text-sm mt-4 mb-2">
                          To delete <span className="font-bold">{topic.name}</span>, please type the topic name below.
                        </p>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder={topic.name}
                            className="flex-1 px-4 py-2 bg-white border border-red-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
                          />
                          <button
                            onClick={handleDelete}
                            disabled={loading || deleteConfirmation !== topic.name}
                            className="px-6 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 whitespace-nowrap"
                          >
                            {loading ? 'Deleting...' : 'Delete Topic'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Manage members</h3>
                  <p className="text-gray-500 text-sm mt-1">Add or remove people from the topic.</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Users by name or email"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  {/* Current Members */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Current Members ({currentMembers.length})</h4>
                        <p className="text-xs text-gray-500">This are added members</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentMembers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          isMember={true}
                          isCurrentUser={user.id === currentUser?.id}
                          onAction={handleRemoveMember}
                          isProcessing={processingUsers.has(user.id)}
                        />
                      ))}
                      {currentMembers.length === 0 && (
                        <EmptyState message="No members yet" />
                      )}
                    </div>
                  </div>

                  {/* Add Members */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Add Members</h4>
                        <p className="text-xs text-gray-500">Add users who aren't members yet</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {availableMembers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          isMember={false}
                          isCurrentUser={false}
                          onAction={handleAddMember}
                          isProcessing={processingUsers.has(user.id)}
                        />
                      ))}
                      {availableMembers.length === 0 && (
                        <EmptyState message={searchQuery ? 'No users found' : 'All users are members'} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={onClose}
                    className="px-8 py-2.5 bg-[#007AFF] text-white rounded-full font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
