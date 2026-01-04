// coderef-core/parser.ts
import { ParsedCoderef } from './types';

/**
 * Parses a Coderef2 tag string into its component parts
 * Format: @Type/path#element:line{metadata}
 * 
 * @param tag The Coderef2 tag string to parse
 * @returns A parsed Coderef object or throws an error if invalid
 */
export function parseCoderefTag(tag: string): ParsedCoderef {
  // Main structure regex - captures the parts of the tag
  const regex = /@([A-Z][A-Za-z0-9]*)\/([^#:{}]+)(?:#([^:{}]+))?(?::(\d+))?(?:{(.+)})?/;
  const match = tag.match(regex);
  
  if (!match) {
    throw new Error(`Invalid Coderef2 tag: ${tag}`);
  }
  
  // Extract all parts
  const [, type, path, element, lineStr, metadataStr] = match;
  
  // Parse line number if present
  const line = lineStr ? parseInt(lineStr, 10) : null;
  
  // Parse metadata if present
  let metadata: Record<string, any> | undefined = undefined;
  if (metadataStr) {
    try {
      // Try to parse as JSON
      metadata = JSON.parse(`{${metadataStr}}`);
    } catch (e) {
      // If JSON parsing fails, try to parse as comma-separated key=value pairs
      metadata = {};
      const pairs = metadataStr.split(',');
      
      for (const pair of pairs) {
        const [key, value] = pair.split('=').map(s => s.trim());
        
        if (key && value !== undefined) {
          // Try to convert value to appropriate type
          if (value === 'true') metadata[key] = true;
          else if (value === 'false') metadata[key] = false;
          else if (!isNaN(Number(value))) metadata[key] = Number(value);
          else if (value.startsWith('"') && value.endsWith('"')) {
            metadata[key] = value.slice(1, -1);
          } else {
            metadata[key] = value;
          }
        }
      }
    }
  }
  
  return {
    type,
    path: path.trim(),
    element: element ? element.trim() : null,
    line,
    metadata
  };
}

/**
 * Generates a Coderef2 tag string from component parts
 * 
 * @param parts The parts of the Coderef tag
 * @returns A properly formatted Coderef2 tag string
 */
export function generateCoderefTag(parts: ParsedCoderef): string {
  const { type, path, element, line, metadata } = parts;
  
  let tag = `@${type}/${path}`;
  
  if (element) {
    tag += `#${element}`;
  }
  
  if (line !== null && line !== undefined) {
    tag += `:${line}`;
  }
  
  if (metadata && Object.keys(metadata).length > 0) {
    try {
      // Remove the outer braces from the stringified JSON
      const jsonStr = JSON.stringify(metadata);
      tag += `{${jsonStr.slice(1, -1)}}`;
    } catch (e) {
      // Fallback to simple string representation if JSON stringification fails
      const metadataStr = Object.entries(metadata)
        .map(([key, value]) => {
          if (typeof value === 'string' && !value.startsWith('"')) {
            return `${key}="${value}"`;
          }
          return `${key}=${value}`;
        })
        .join(',');
      
      if (metadataStr) {
        tag += `{${metadataStr}}`;
      }
    }
  }
  
  return tag;
}

/**
 * Extracts all Coderef2 tags from a string (like file content)
 * 
 * @param content The string content to search for tags
 * @returns Array of parsed Coderef tags
 */
export function extractCoderefTags(content: string): ParsedCoderef[] {
  const tagRegex = /@[A-Z][A-Za-z0-9]*\/[^#:{}]+(?:#[^:{}]+)?(?::\d+)?(?:{.+})?/g;
  const matches = content.match(tagRegex) || [];
  
  const parsedTags: ParsedCoderef[] = [];
  
  for (const match of matches) {
    try {
      const parsedTag = parseCoderefTag(match);
      parsedTags.push(parsedTag);
    } catch (error) {
      // Skip invalid tags
      console.warn(`Skipping invalid tag: ${match}`);
    }
  }
  
  return parsedTags;
}

/**
 * Validates if a string is a properly formatted Coderef2 tag
 * 
 * @param tag The tag string to validate
 * @returns True if valid, false otherwise
 */
export function isValidCoderefTag(tag: string): boolean {
  try {
    parseCoderefTag(tag);
    return true;
  } catch (error) {
    return false;
  }
}