'use client';

import React from 'react';

export interface ComingSoonCardProps {
  title?: string;
  description?: string;
  eta?: string;
}

/**
 * Coming Soon placeholder card component
 * Shows a simple message that widgets are coming soon
 */
export function ComingSoonCard({
  title = 'More Widgets Coming Soon',
  description = 'Additional widgets are being developed. Check back later!',
  eta = 'Q1 2025',
}: ComingSoonCardProps) {
  return (
    <div className="w-full">
      {/* Main Card */}
      <div className="bg-ind-panel border-2 border-ind-border p-8 relative">
          {/* Top left corner accent */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ind-accent"></div>

          {/* Top right corner accent */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-ind-accent"></div>

          {/* Content */}
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

            {/* ETA */}
            <div className="pt-4 border-t-2 border-ind-border">
              <p className="text-ind-text-muted text-xs uppercase tracking-widest font-mono mb-2">
                Expected Availability
              </p>
              <p className="text-ind-accent font-bold text-lg uppercase tracking-wider">
                {eta}
              </p>
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="w-2 h-2 bg-ind-accent rounded-full animate-pulse"></div>
              <span className="text-ind-text-muted text-xs font-mono uppercase tracking-wider">
                In Development
              </span>
            </div>
          </div>

          {/* Bottom left corner accent */}
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-ind-accent"></div>

          {/* Bottom right corner accent */}
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ind-accent"></div>

          {/* Side accent lines */}
          <div className="absolute left-0 top-8 bottom-8 w-1 bg-gradient-to-b from-transparent via-ind-accent to-transparent opacity-30"></div>
          <div className="absolute right-0 top-8 bottom-8 w-1 bg-gradient-to-b from-transparent via-ind-accent to-transparent opacity-30"></div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-ind-text-muted text-xs font-mono">
          Version 0.1.0 • CodeRef Dashboard
        </p>
      </div>
    </div>
  );
}

export default ComingSoonCard;
