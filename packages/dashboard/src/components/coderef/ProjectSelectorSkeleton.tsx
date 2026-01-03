/**
 * ProjectSelectorSkeleton - Loading skeleton for ProjectSelector
 *
 * Animated placeholder that matches exact dimensions of ProjectSelector
 * to prevent layout shift during project loading.
 */

export function ProjectSelectorSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {/* Select skeleton */}
        <div className="flex-1 min-w-0">
          <div
            className="
              w-full h-10 rounded
              bg-ind-border
              animate-pulse
            "
            aria-label="Loading projects..."
          />
        </div>

        {/* Add button skeleton */}
        <div
          className="
            w-10 h-10 rounded
            bg-ind-border
            animate-pulse
          "
          aria-hidden="true"
        />

        {/* Remove button skeleton */}
        <div
          className="
            w-10 h-10 rounded
            bg-ind-border
            animate-pulse
          "
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
