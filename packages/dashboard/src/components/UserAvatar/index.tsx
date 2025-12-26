'use client';

import Link from 'next/link';
import { User } from 'lucide-react';

export default function UserAvatar() {
  return (
    <Link href="/user-settings">
      <button
        className="
          relative flex items-center justify-center
          w-5 h-5 rounded-full
          border border-ind-accent
          bg-ind-bg
          text-ind-accent
          hover:scale-110 hover:shadow-lg
          transition-all duration-200
          group
        "
        aria-label="User Settings"
      >
        <User className="w-4 h-4" />

        <div className="absolute bottom-full right-0 mb-2 bg-ind-panel text-ind-text text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-ind-border">
          User Settings
        </div>
      </button>
    </Link>
  );
}
