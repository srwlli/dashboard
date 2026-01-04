import { ElementData, ScanOptions } from './types';
/**
 * Pattern configurations by language
 */
export declare const LANGUAGE_PATTERNS: Record<string, Array<{
    type: ElementData['type'];
    pattern: RegExp;
    nameGroup: number;
}>>;
/**
 * Scanner class to manage state and context
 */
declare class Scanner {
    private elements;
    private currentFile;
    private currentLine;
    private currentPattern;
    constructor();
    addElement(element: ElementData): void;
    private processLine;
    processFile(file: string, content: string, patterns: Array<{
        type: ElementData['type'];
        pattern: RegExp;
        nameGroup: number;
    }>, includeComments: boolean): void;
    getElements(): ElementData[];
}
export { Scanner };
/**
 * Scans the current codebase for code elements (functions, classes, components, hooks)
 * @param dir Directory to scan
 * @param lang File extension to scan (or array of extensions)
 * @param options Additional scanning options
 * @returns Array of code elements with their type, name, file and line number
 */
export declare function scanCurrentElements(dir: string, lang?: string | string[], options?: ScanOptions): Promise<ElementData[]>;
/**
 * Checks if a line is commented out
 */
export declare function isLineCommented(line: string): boolean;
/**
 * Registry to register custom element pattern recognizers
 */
export declare const ScannerRegistry: {
    /**
     * Register a custom pattern for recognizing elements
     */
    registerPattern(lang: string, type: ElementData["type"], pattern: RegExp, nameGroup?: number): void;
    /**
     * Get all registered patterns for a language
     */
    getPatterns(lang: string): Array<{
        type: ElementData["type"];
        pattern: RegExp;
        nameGroup: number;
    }>;
    /**
     * Check if a language is supported
     */
    isLanguageSupported(lang: string): boolean;
    /**
     * Get all supported languages
     */
    getSupportedLanguages(): string[];
};
//# sourceMappingURL=scanner.d.ts.map