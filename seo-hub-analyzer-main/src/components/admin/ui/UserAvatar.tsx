// src/components/admin/ui/UserAvatar.tsx
import React from 'react';

interface UserAvatarProps {
  name?: string | null;
  email?: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-[13px]',
  lg: 'h-12 w-12 text-[15px]',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, email, avatarUrl, size = 'md' }) => {
  const initials = (name ?? email ?? '?')[0].toUpperCase();
  const sizeClass = SIZE_MAP[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? email ?? 'User'}
        className={`${sizeClass} rounded-full object-cover shrink-0`}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-[#c96442]/15 flex items-center justify-center shrink-0`}
    >
      <span className="font-bold text-[#c96442]">{initials}</span>
    </div>
  );
};
