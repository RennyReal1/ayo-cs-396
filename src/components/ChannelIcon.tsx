import React from 'react';
import { ChannelName } from '../types';

interface ChannelIconProps {
  channel: ChannelName | 'Cart';
  className?: string;
  size?: number;
}

export const ChannelIcon: React.FC<ChannelIconProps> = ({ channel, className = '', size = 28 }) => {
  const s = size;

  switch (channel) {
    case 'Search':
      // Google "G" brand icon
      return (
        <div
          className={`flex items-center justify-center rounded-full bg-white shadow-xs border border-gray-100 shrink-0 ${className}`}
          style={{ width: s, height: s }}
          title="Google Search"
        >
          <svg width={s * 0.65} height={s * 0.65} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        </div>
      );

    case 'YouTube':
      return (
        <div
          className={`flex items-center justify-center rounded-lg bg-[#FF0000] shadow-xs shrink-0 ${className}`}
          style={{ width: s, height: s * 0.8 }}
          title="YouTube"
        >
          <svg width={s * 0.45} height={s * 0.45} viewBox="0 0 24 24" fill="white">
            <polygon points="9.5,7.5 16.5,12 9.5,16.5" />
          </svg>
        </div>
      );

    case 'Display':
      // Green Banner Ad icon
      return (
        <div
          className={`flex items-center justify-center rounded-md bg-[#e6f4ea] border border-[#34a853]/40 shadow-xs shrink-0 ${className}`}
          style={{ width: s, height: s * 0.75 }}
          title="Google Display Network"
        >
          <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 24 24" fill="none" stroke="#137333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M7 8h10" />
            <circle cx="7" cy="14" r="1.5" fill="#137333" />
            <path d="M11 14h6" />
          </svg>
        </div>
      );

    case 'Discover':
      // Google Discover Starburst / Compass icon
      return (
        <div
          className={`flex items-center justify-center rounded-full bg-white shadow-xs border border-gray-100 shrink-0 ${className}`}
          style={{ width: s, height: s }}
          title="Google Discover"
        >
          <svg width={s * 0.65} height={s * 0.65} viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" opacity="0.9" />
            <circle cx="12" cy="12" r="3.5" fill="#4285F4" />
          </svg>
        </div>
      );

    case 'Gmail':
      // Gmail M icon
      return (
        <div
          className={`flex items-center justify-center rounded-md bg-white shadow-xs border border-gray-200 shrink-0 ${className}`}
          style={{ width: s, height: s * 0.8 }}
          title="Gmail Ads"
        >
          <svg width={s * 0.65} height={s * 0.65} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M3 6l9 6 9-6v12H3z" opacity="0.1" />
            <path fill="#EA4335" d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </div>
      );

    case 'Direct':
      // Direct Link icon
      return (
        <div
          className={`flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 shadow-xs shrink-0 ${className}`}
          style={{ width: s, height: s }}
          title="Direct"
        >
          <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
      );

    case 'Cart':
      // Conversion Cart icon
      return (
        <div
          className={`flex items-center justify-center rounded-full bg-[#f1f3f4] text-[#3c4043] shrink-0 ${className}`}
          style={{ width: s, height: s }}
          title="Conversion"
        >
          <svg width={s * 0.55} height={s * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
        </div>
      );

    default:
      return null;
  }
};
