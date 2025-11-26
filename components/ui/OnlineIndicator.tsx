import React from 'react';

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  showOffline?: boolean;
  className?: string;
}

/**
 * Component to display online/offline status indicator
 */
export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  isOnline,
  size = 'md',
  showOffline = false,
  className = '',
}) => {
  if (!isOnline && !showOffline) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClass = isOnline ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div
      className={`${sizeClasses[size]} ${colorClass} rounded-full border-2 border-white ${className}`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};
