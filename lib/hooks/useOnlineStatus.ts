import { useEffect, useState } from 'react';
import { socketService } from '@/lib/services/socketService';
import type { SocketUserStatusChangeEvent } from '@/lib/types';

/**
 * Hook for tracking online/offline status of users
 */
export const useOnlineStatus = () => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!socketService.isConnected()) return;

    const handleStatusChange = (data: SocketUserStatusChangeEvent) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (data.is_online) {
          newSet.add(data.user_id);
        } else {
          newSet.delete(data.user_id);
        }
        return newSet;
      });
    };

    socketService.onUserStatusChange(handleStatusChange);

    return () => {
      socketService.offUserStatusChange(handleStatusChange);
    };
  }, []);

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
  };

  return {
    onlineUsers,
    isUserOnline,
  };
};
