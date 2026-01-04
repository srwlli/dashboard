import { ParsedCoderef } from './types';
/**
 * Parses a Coderef2 tag string into its component parts
 * Format: @Type/path#element:line{metadata}
 *
 * @param tag The Coderef2 tag string to parse
 * @returns A parsed Coderef object or throws an error if invalid
 */
export declare function parseCoderefTag(tag: string): ParsedCoderef;
/**
 * Generates a Coderef2 tag string from component parts
 *
 * @param parts The parts of the Coderef tag
 * @returns A properly formatted Coderef2 tag string
 */
export declare function generateCoderefTag(parts: ParsedCoderef): string;
/**
 * Extracts all Coderef2 tags from a string (like file content)
 *
 * @param content The string content to search for tags
 * @returns Array of parsed Coderef tags
 */
export declare function extractCoderefTags(content: string): ParsedCoderef[];
/**
 * Validates if a string is a properly formatted Coderef2 tag
 *
 * @param tag The tag string to validate
 * @returns True if valid, false otherwise
 */
export declare function isValidCoderefTag(tag: string): boolean;
//# sourceMappingURL=parser.d.ts.map