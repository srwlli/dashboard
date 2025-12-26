'use client';

import React from 'react';

interface ComingSoonProps {
  title?: string;
  description?: string;
  eta?: string;
}

/**
 * ComingSoon Component
 * Placeholder component for features under development
 * Displays coming soon status, ETA, and in-development indicator
 */
export const ComingSoon: React.FC<ComingSoonProps> = ({
  title = 'More Features Coming Soon',
  description = 'Additional features are being developed. Check back later!',
  eta = 'Q1 2025',
}) => {

  return (
    <div className="w-full">
      <div className="bg-ind-panel border-2 border-ind-border p-8 relative">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ind-accent"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ind-accent"></div>

        {/* Center content */}
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-ind-bg border-2 border-ind-accent flex items-center justify-center">
              <span className="text-ind-accent text-3xl">🔧</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold uppercase tracking-wider text-ind-text">
            {title}
          </h1>

          {/* Description */}
          <p className="text-ind-text-muted font-mono text-sm leading-relaxed">
            {description}
          </p>

          {/* Status */}
          <div className="px-4 py-2 bg-ind-bg border border-ind-border rounded">
            <p className="text-ind-text-muted text-xs font-mono">
              Status: Coming Soon
            </p>
          </div>

          {/* ETA Section */}
          <div className="pt-4 border-t-2 border-ind-border">
            <p className="text-ind-text-muted text-xs uppercase tracking-widest font-mono mb-2">
              Expected Availability
            </p>
            <p className="text-ind-accent font-bold text-lg uppercase tracking-wider">
              {eta}
            </p>
          </div>

          {/* In Development Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="w-2 h-2 bg-ind-accent rounded-full animate-pulse"></div>
            <span className="text-ind-text-muted text-xs font-mono uppercase tracking-wider">
              In Development
            </span>
          </div>
        </div>

        {/* Corner accents bottom */}
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ind-accent"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ind-accent"></div>

        {/* Side gradient bars */}
        <div className="absolute left-0 top-8 bottom-8 w-1 bg-gradient-to-b from-transparent via-ind-accent to-transparent opacity-30"></div>
        <div className="absolute right-0 top-8 bottom-8 w-1 bg-gradient-to-b from-transparent via-ind-accent to-transparent opacity-30"></div>
      </div>

      {/* Version footer */}
      <div className="mt-4 text-center">
        <p className="text-ind-text-muted text-xs font-mono">
          Version 0.1.0 • CodeRef Dashboard
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
