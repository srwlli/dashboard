import { ElementData, ScanOptions } from './types';
/**
 * Scans the codebase using AST for code elements.
 * @param dir Directory to scan
 * @param lang Target language extensions (e.g., 'ts', 'js', 'py')
 * @param options Scan options (recursive, include/exclude etc. - simplified for now)
 * @returns Array of code elements
 */
export declare function scanCurrentElements(dir: string, lang?: string | string[], // Default languages
options?: ScanOptions): Promise<ElementData[]>;
//# sourceMappingURL=scanner.d.ts.map