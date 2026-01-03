import { ReactNode } from 'react';

export const metadata = {
  title: 'Explorer | CodeRef Dashboard',
  description: 'Browse and explore coderef directories with hybrid local+API access',
};

/**
 * Custom layout for CodeRef Explorer
 *
 * Bypasses RootClientWrapper's content constraints (padding, max-width, grid gap)
 * to allow full-width, full-height layout for the explorer interface.
 *
 * The global sidebar and header are still rendered by RootClientWrapper,
 * but this layout gives the page content complete control over its dimensions.
 */
export default function CodeRefExplorerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-full overflow-hidden">
      {children}
    </div>
  );
}
