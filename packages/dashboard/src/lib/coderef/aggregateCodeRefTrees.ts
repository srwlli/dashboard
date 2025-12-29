/**
 * Aggregate CodeRef Trees Utility
 *
 * Merges coderef/ folders from all registered projects into a single tree structure.
 * Used for "All Projects (CodeRef)" view mode in Explorer.
 */

import type { Project, TreeNode } from './types';

/**
 * Aggregate coderef/ folders from multiple projects
 *
 * @param projects - Array of registered projects
 * @returns Promise resolving to aggregated tree structure with project prefixes
 */
export async function aggregateCodeRefTrees(projects: Project[]): Promise<TreeNode[]> {
  if (projects.length === 0) {
    return [];
  }

  const aggregatedNodes: TreeNode[] = [];

  for (const project of projects) {
    try {
      // Fetch tree for this project's coderef/ folder
      const response = await fetch(`/api/coderef/tree?path=${encodeURIComponent(project.path)}`);

      if (!response.ok) {
        console.error(`Failed to fetch tree for project ${project.name}:`, response.statusText);
        continue; // Gracefully skip this project
      }

      const result = await response.json();

      if (!result.success || !result.data?.tree) {
        console.error(`Invalid tree response for project ${project.name}`);
        continue;
      }

      const projectTree = result.data.tree as TreeNode[];

      // Find coderef/ folder in the tree
      const coderefNode = findCodeRefFolder(projectTree);

      if (!coderefNode || !coderefNode.children) {
        // No coderef/ folder or it's empty - skip silently
        continue;
      }

      // Create project-level node with coderef/ contents
      const projectNode: TreeNode = {
        name: project.name,
        type: 'directory',
        path: `${project.name}/coderef`,
        children: prefixPaths(coderefNode.children, project.name),
      };

      aggregatedNodes.push(projectNode);
    } catch (error) {
      console.error(`Error aggregating tree for project ${project.name}:`, error);
      // Continue with other projects (graceful degradation)
    }
  }

  return aggregatedNodes;
}

/**
 * Find coderef/ folder in tree
 */
function findCodeRefFolder(nodes: TreeNode[]): TreeNode | null {
  for (const node of nodes) {
    if (node.type === 'directory' && node.name === 'coderef') {
      return node;
    }

    // Recursively search in children
    if (node.children) {
      const found = findCodeRefFolder(node.children);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Add project name prefix to all paths
 */
function prefixPaths(nodes: TreeNode[], projectName: string): TreeNode[] {
  return nodes.map((node) => ({
    ...node,
    path: `${projectName}/coderef/${node.path}`,
    children: node.children ? prefixPaths(node.children, projectName) : undefined,
  }));
}

/**
 * Filter tree by file type pattern
 *
 * @param nodes - Tree nodes to filter
 * @param pattern - Pattern to match (e.g., 'CLAUDE.md', '**/plan.json')
 * @returns Filtered tree nodes
 */
export function filterTreeByPattern(nodes: TreeNode[], pattern: string): TreeNode[] {
  const filtered: TreeNode[] = [];

  for (const node of nodes) {
    if (node.type === 'file') {
      // Match file name against pattern
      if (matchesPattern(node.name, pattern)) {
        filtered.push(node);
      }
    } else if (node.children) {
      // Recursively filter directory children
      const filteredChildren = filterTreeByPattern(node.children, pattern);
      if (filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren,
        });
      }
    }
  }

  return filtered;
}

/**
 * Check if filename matches pattern
 */
function matchesPattern(filename: string, pattern: string): boolean {
  // Exact match
  if (pattern === filename) {
    return true;
  }

  // Wildcard pattern like **/plan.json
  if (pattern.startsWith('**/')) {
    const suffix = pattern.slice(3);
    return filename === suffix;
  }

  // Extension pattern like *.md
  if (pattern.startsWith('*.')) {
    const ext = pattern.slice(1);
    return filename.endsWith(ext);
  }

  return false;
}

/**
 * Flatten tree to list (for list view mode)
 */
export function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const flattened: TreeNode[] = [];

  function traverse(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (node.type === 'file') {
        flattened.push(node);
      }

      if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return flattened;
}
