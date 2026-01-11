'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { searchEngine, SearchResult, SearchOptions, SearchIndexEntry } from '@coderef/core/search-client';

interface SearchContextType {
  search: (query: string, options?: SearchOptions) => SearchResult[];
  indexDocument: (doc: SearchIndexEntry) => void;
  removeDocument: (documentKey: string, projectId: number) => void;
  clearIndex: () => void;
  getStatistics: () => {
    totalDocuments: number;
    totalSections: number;
    averageWordCount: number;
  };
}

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  // Auto-index project files and notes on mount
  useEffect(() => {
    const autoIndexAll = async () => {
      try {
        // Index notes
        const notesResponse = await fetch('/api/notes');
        if (notesResponse.ok) {
          const { notes } = await notesResponse.json();
          notes.forEach((notePath: string) => {
            fetch(`/api/notes/${encodeURIComponent(notePath)}`)
              .then(res => res.json())
              .then(data => {
                searchEngine.indexDocument({
                  documentKey: notePath,
                  documentName: notePath,
                  projectId: 1,
                  content: data.content,
                  sections: [],
                  metadata: { type: 'note', path: notePath },
                  tags: ['note'],
                  lastUpdated: new Date().toISOString(),
                  wordCount: data.content.split(/\s+/).length
                });
              })
              .catch(err => console.warn(`Failed to index note: ${notePath}`, err));
          });
        }

        // Index project files from configured projects
        const projectsResponse = await fetch('/api/coderef/projects');
        if (projectsResponse.ok) {
          const { data: projects } = await projectsResponse.json();

          for (const project of projects) {
            // Get file tree for each project
            const treeResponse = await fetch(`/api/coderef/tree?path=${encodeURIComponent(project.path)}`);
            if (!treeResponse.ok) continue;

            const { data: tree } = await treeResponse.json();

            // Flatten tree and filter for important files
            const flattenTree = (nodes: any[], parentPath = ''): any[] => {
              let files: any[] = [];
              for (const node of nodes) {
                const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;
                if (node.type === 'file') {
                  files.push({ ...node, fullPath, projectId: project.id, projectName: project.name, projectPath: project.path });
                } else if (node.children) {
                  files = files.concat(flattenTree(node.children, fullPath));
                }
              }
              return files;
            };

            const allFiles = flattenTree(tree);
            const importantFiles = allFiles.filter(file =>
              file.name.match(/\.(md|json)$/) &&
              (file.name === 'CLAUDE.md' ||
               file.name === 'ARCHITECTURE.md' ||
               file.name === 'README.md' ||
               file.name === 'plan.json' ||
               file.name === 'DELIVERABLES.md' ||
               file.name === 'context.md')
            );

            // Index each important file
            for (const file of importantFiles) {
              try {
                const absolutePath = `${project.path}/${file.fullPath}`.replace(/\\/g, '/');
                const fileResponse = await fetch(`/api/coderef/file?path=${encodeURIComponent(absolutePath)}`);
                if (!fileResponse.ok) continue;

                const { data: fileData } = await fileResponse.json();

                const tags = [];
                if (file.name === 'CLAUDE.md') tags.push('context', 'documentation');
                if (file.name === 'ARCHITECTURE.md') tags.push('architecture', 'documentation');
                if (file.name === 'plan.json') tags.push('plan', 'workorder');
                if (file.name === 'DELIVERABLES.md') tags.push('deliverables', 'workorder');
                if (file.name === 'README.md') tags.push('readme', 'documentation');
                if (file.name === 'context.md') tags.push('context', 'coderef');

                tags.push(project.name);

                searchEngine.indexDocument({
                  documentKey: `${project.id}:${file.fullPath}`,
                  documentName: `${project.name}/${file.name}`,
                  projectId: project.id,
                  content: fileData.content || '',
                  sections: [],
                  metadata: {
                    type: 'file',
                    path: absolutePath,
                    projectName: project.name,
                    fileName: file.name
                  },
                  tags,
                  lastUpdated: fileData.lastModified || new Date().toISOString(),
                  wordCount: (fileData.content || '').split(/\s+/).filter((w: string) => w.length > 0).length
                });

                console.log(`Indexed: ${project.name}/${file.name}`);
              } catch (err) {
                console.warn(`Failed to index ${file.fullPath}:`, err);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to auto-index:', err);
      }
    };

    autoIndexAll();
  }, []);

  return (
    <SearchContext.Provider
      value={{
        search: (query, options) => searchEngine.search(query, options),
        indexDocument: (doc) => searchEngine.indexDocument(doc),
        removeDocument: (documentKey, projectId) => searchEngine.removeDocument(documentKey, projectId),
        clearIndex: () => searchEngine.clearIndex(),
        getStatistics: () => searchEngine.getStatistics()
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};
