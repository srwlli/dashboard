'use client';

import { Toaster } from 'sonner';
import { industrialToastClassNames, industrialToastStyle } from './notifications/ToastTheme';

/**
 * ToasterWrapper
 * Client-side wrapper for Sonner toast notifications
 * Configured for industrial design theme with top-right positioning
 *
 * Features:
 * - Top-right positioning (non-intrusive)
 * - z-index 9999 (appears above modals)
 * - Industrial design tokens (ind-* colors)
 * - Sharp corners (border-radius: 0)
 * - Dark mode compatible
 */
export function ToasterWrapper() {
  return (
    <Toaster
      position="top-right"
      closeButton
      expand={false}
      richColors={false}
      style={{
        zIndex: 9999,
      }}
      toastOptions={{
        unstyled: true,
        classNames: industrialToastClassNames,
        style: industrialToastStyle,
      }}
    />
  );
}
