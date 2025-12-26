'use client';

import Link from 'next/link';
import { User } from 'lucide-react';

export default function UserAvatar() {
  return (
    <Link href="/user-settings">
      <button
        className="
          flex items-center justify-center
          w-5 h-5 rounded-full
          border border-ind-accent
          bg-ind-bg
          text-ind-accent
          hover:scale-110 hover:shadow-lg
          transition-all duration-200
        "
        aria-label="User Settings"
      >
        <User className="w-4 h-4" />
      </button>
    </Link>
  );
}
