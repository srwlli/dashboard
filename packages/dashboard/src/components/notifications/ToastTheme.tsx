/**
 * ToastTheme Configuration
 * Industrial design theme for Sonner toast notifications
 *
 * Provides consistent styling matching dashboard aesthetic:
 * - Sharp corners (border-radius: 0)
 * - Industrial color tokens (ind-*)
 * - Monospace fonts for technical details
 * - Dark mode compatible
 */

/**
 * Toast classNames configuration for unstyled mode
 * Applied to Toaster component via toastOptions.classNames
 */
export const industrialToastClassNames = {
  // Base toast container - reduced border, added subtle backdrop
  toast: 'bg-ind-panel/95 backdrop-blur-sm border border-ind-border shadow-lg',

  // Toast title styling - normal case, better readability
  title: 'text-sm font-semibold text-ind-text',

  // Toast description/message styling - improved spacing
  description: 'text-xs text-ind-text-muted mt-1.5 leading-relaxed',

  // Action button styling (retry, undo, etc.)
  actionButton: 'bg-ind-accent hover:bg-ind-accent-hover text-black px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors rounded-sm',

  // Close button styling
  closeButton: 'bg-transparent hover:bg-ind-border/50 text-ind-text-muted hover:text-ind-text transition-colors',

  // Success variant - subtle left accent
  success: 'border-l-4 border-l-ind-success border-ind-border',

  // Error variant
  error: 'border-l-4 border-l-ind-error border-ind-border',

  // Warning variant
  warning: 'border-l-4 border-l-ind-warning border-ind-border',

  // Info variant
  info: 'border-l-4 border-l-ind-info border-ind-border',

  // Loading variant
  loading: 'border-ind-border',
};

/**
 * Toast style configuration
 * Applied to Toaster component via toastOptions.style
 */
export const industrialToastStyle = {
  borderRadius: '2px', // Subtle rounding for modern look
};

/**
 * Success toast color scheme
 */
export const successToastColors = {
  border: 'var(--color-ind-success)',
  background: 'var(--color-ind-panel)',
  text: 'var(--color-ind-text)',
};

/**
 * Error toast color scheme
 */
export const errorToastColors = {
  border: 'var(--color-ind-error)',
  background: 'var(--color-ind-panel)',
  text: 'var(--color-ind-text)',
};

/**
 * Warning toast color scheme
 */
export const warningToastColors = {
  border: 'var(--color-ind-warning)',
  background: 'var(--color-ind-panel)',
  text: 'var(--color-ind-text)',
};

/**
 * Info toast color scheme
 */
export const infoToastColors = {
  border: 'var(--color-ind-accent)',
  background: 'var(--color-ind-panel)',
  text: 'var(--color-ind-text)',
};

/**
 * Toast duration configuration
 * Based on UX best practices and accessibility guidelines
 */
export const toastDurations = {
  success: 3000,   // 3 seconds - quick confirmation
  error: 8000,     // 8 seconds - time to read and click retry
  warning: 5000,   // 5 seconds - moderate importance
  info: 4000,      // 4 seconds - informational
  loading: Infinity, // Manual dismiss only
};
