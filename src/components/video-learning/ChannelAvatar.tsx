import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface ChannelAvatarProps {
  channelName?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ChannelAvatar: React.FC<ChannelAvatarProps> = ({
  channelName = 'Physics Wallah',
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const getInitials = (name: string) => {
    if (!name) return 'PW';
    if (name.toLowerCase().includes('gate')) return 'GW';
    if (name.toLowerCase().includes('jee')) return 'JW';
    if (name.toLowerCase().includes('neet')) return 'PW';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getTheme = (name: string) => {
    if (name.toLowerCase().includes('gate')) {
      return { bg: 'bg-[#1C201D]', text: 'text-[#D4AF37]', border: 'border-[#D4AF37]/30' };
    }
    if (name.toLowerCase().includes('alakh') || name.toLowerCase().includes('pandey')) {
      return { bg: 'bg-[#C86D51]', text: 'text-[#FFFFFF]', border: 'border-[#C86D51]' };
    }
    return { bg: 'bg-[#2D5A3F]', text: 'text-[#D4AF37]', border: 'border-[#2D5A3F]' };
  };

  const initials = getInitials(channelName);
  const theme = getTheme(channelName);

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      {!imgError && avatarUrl ? (
        <img
          src={avatarUrl}
          alt={channelName}
          onError={() => setImgError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover border ${theme.border} bg-[#EDE8DB] shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${theme.bg} ${theme.text} ${theme.border} rounded-full border flex items-center justify-center font-bold font-mono tracking-wider shadow-sm relative`}
          title={channelName}
        >
          <span>{initials}</span>
          <ShieldCheck className={`absolute -bottom-0.5 -right-0.5 ${iconSizes[size]} text-[#D4AF37] fill-[#1C201D]`} />
        </div>
      )}
    </div>
  );
};
