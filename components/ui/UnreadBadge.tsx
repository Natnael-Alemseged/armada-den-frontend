import React from 'react';

interface UnreadBadgeProps {
  count: number;
  maxCount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Component to display unread message count badge
 */
export const UnreadBadge: React.FC<UnreadBadgeProps> = ({
  count,
  maxCount = 99,
  size = 'md',
  className = '',
}) => {
  if (count <= 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1 py-0.5 min-w-[16px] h-4',
    md: 'text-xs px-1.5 py-0.5 min-w-[20px] h-5',
    lg: 'text-sm px-2 py-1 min-w-[24px] h-6',
  };

  const displayCount = count > maxCount ? `${maxCount}+` : count;

  return (
    <span
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center
        bg-red-500 text-white font-semibold
        rounded-full
        ${className}
      `}
      title={`${count} unread message${count !== 1 ? 's' : ''}`}
    >
      {displayCount}
    </span>
  );
};
