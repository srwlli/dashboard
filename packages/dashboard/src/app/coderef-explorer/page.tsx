import { CodeRefExplorerWidget } from '@/widgets/coderef-explorer';

export const metadata = {
  title: 'CodeRef Explorer | CodeRef Dashboard',
  description: 'Browse and explore coderef directories with hybrid local+API access',
};

export default function CodeRefExplorerPage() {
  return (
    <div className="h-screen flex flex-col">
      <CodeRefExplorerWidget />
    </div>
  );
}
