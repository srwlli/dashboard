/**
 * Parses a Coderef2 tag string into its component parts
 * Format: @Type/path#element:line{metadata}
 *
 * @param tag The Coderef2 tag string to parse
 * @returns A parsed Coderef object or throws an error if invalid
 */
export function parseCoderefTag(tag) {
    // Main structure regex - captures the parts of the tag
    // @Type/path#element:line{metadata}
    // Breakdown:
    // @                  - Literal '@'
    // ([A-Z][A-Za-z0-9]*) - Capture group 1: Type (starts with uppercase letter)
    // /                  - Literal '/'
    // ([^#:{}]+)         - Capture group 2: Path (any char except #, :, {, })
    // (?:#([^:{}]+))?    - Optional non-capturing group for element:
    //   #                - Literal '#'
    //   ([^:{}]+)        - Capture group 3: Element name (any char except :, {, })
    // (?::(\d+))?        - Optional non-capturing group for line:
    //   :                - Literal ':'
    //   (\d+)            - Capture group 4: Line number (digits)
    // (?:{(.+)})?        - Optional non-capturing group for metadata:
    //   {                - Literal '{'
    //   (.+)             - Capture group 5: Metadata content (any char until })
    //   }                - Literal '}'
    const regex = /@([A-Z][A-Za-z0-9]*)\/([^#:{}]+)(?:#([^:{}]+))?(?::(\d+))?(?:{(.+)})?/;
    const match = tag.match(regex);
    if (!match) {
        throw new Error(`Invalid Coderef2 tag format: ${tag}`);
    }
    // Extract all parts
    // Match indices: 0=full match, 1=type, 2=path, 3=element?, 4=line?, 5=metadata?
    const [, type, path, element, lineStr, metadataStr] = match;
    // Parse line number if present
    const line = lineStr ? parseInt(lineStr, 10) : null;
    if (lineStr && isNaN(line)) {
        // This case should technically not happen if regex (\d+) works, but good practice
        throw new Error(`Invalid line number in Coderef2 tag: ${tag}`);
    }
    // Parse metadata if present
    let metadata = undefined;
    if (metadataStr) {
        try {
            // Assume metadata is well-formed JSON within the braces
            // Need to add outer braces back for JSON parsing
            metadata = JSON.parse(`{${metadataStr}}`);
        }
        catch (e) {
            // If JSON parsing fails, try simple key=value parsing (or log warning/error)
            // This fallback might be fragile depending on expected metadata format
            console.warn(`Metadata in tag "${tag}" is not valid JSON. Attempting simple parse. Error: ${e}`);
            metadata = {};
            // Example fallback: comma-separated key=value (adjust regex/split as needed)
            const pairs = metadataStr.split(',');
            for (const pair of pairs) {
                const [key, ...valueParts] = pair.split('=').map(s => s.trim());
                const value = valueParts.join('='); // Re-join in case value contains '='
                if (key && value !== undefined) {
                    // Basic type inference for fallback
                    if (value === 'true')
                        metadata[key] = true;
                    else if (value === 'false')
                        metadata[key] = false;
                    else if (!isNaN(Number(value)) && value.trim() !== '')
                        metadata[key] = Number(value);
                    // Handle quoted strings in fallback
                    else if (value.startsWith('"') && value.endsWith('"'))
                        metadata[key] = value.slice(1, -1);
                    else if (value.startsWith("'") && value.endsWith("'"))
                        metadata[key] = value.slice(1, -1);
                    else
                        metadata[key] = value; // Treat as string
                }
            }
        }
    }
    return {
        type: type.trim(),
        path: path.trim(),
        element: element ? element.trim() : null,
        line: line,
        metadata // Can be undefined if not present or object if present
    };
}
/**
 * Generates a Coderef2 tag string from component parts
 *
 * @param parts The parts of the Coderef tag (must include type and path)
 * @returns A properly formatted Coderef2 tag string
 */
export function generateCoderefTag(parts) {
    // Basic validation
    if (!parts.type || !parts.path) {
        throw new Error("Cannot generate Coderef tag without 'type' and 'path'");
    }
    let tag = `@${parts.type}/${parts.path}`;
    if (parts.element) {
        tag += `#${parts.element}`;
    }
    if (parts.line !== null && parts.line !== undefined) {
        tag += `:${parts.line}`;
    }
    if (parts.metadata && Object.keys(parts.metadata).length > 0) {
        try {
            // Attempt to stringify metadata as JSON, removing the outer braces
            const jsonStr = JSON.stringify(parts.metadata);
            // Ensure it's a valid object representation before slicing
            if (jsonStr.startsWith('{') && jsonStr.endsWith('}')) {
                const innerJson = jsonStr.slice(1, -1);
                if (innerJson) { // Add metadata only if it's not empty
                    tag += `{${innerJson}}`;
                }
            }
            else {
                // Handle cases where stringify might not produce {} e.g. for non-plain objects
                console.warn(`Could not generate standard JSON metadata for tag ${tag}`);
            }
        }
        catch (e) {
            // Fallback if JSON stringification fails (less likely but possible)
            console.warn(`JSON stringification failed for metadata in tag ${tag}. Error: ${e}`);
            // Simple string fallback (might not be robust)
            const metadataStr = Object.entries(parts.metadata)
                .map(([key, value]) => `${key}=${JSON.stringify(value)}`) // Stringify value robustly
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
 * Uses the same regex as parseCoderefTag but globally.
 *
 * @param content The string content to search for tags
 * @returns Array of parsed Coderef tags found in the content
 */
export function extractCoderefTags(content) {
    // Same regex as parseCoderefTag, but with global flag 'g'
    const tagRegex = /@([A-Z][A-Za-z0-9]*)\/([^#:{}]+)(?:#([^:{}]+))?(?::(\d+))?(?:{(.+)})?/g;
    const matches = content.matchAll(tagRegex); // Use matchAll for global regex to get capture groups easily
    const parsedTags = [];
    if (!matches) {
        return []; // No tags found
    }
    for (const match of matches) {
        try {
            // Re-use parseCoderefTag logic by reconstructing the matched tag string
            const fullMatchedTag = match[0];
            const parsedTag = parseCoderefTag(fullMatchedTag); // Validate and parse each match
            parsedTags.push(parsedTag);
        }
        catch (error) {
            // Log or handle invalid tags found within the content
            if (error instanceof Error) {
                console.warn(`Skipping invalid tag found in content: "${match[0]}". Error: ${error.message}`);
            }
            else {
                console.warn(`Skipping invalid tag found in content: "${match[0]}". Unknown error.`);
            }
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
export function isValidCoderefTag(tag) {
    try {
        parseCoderefTag(tag); // If parsing doesn't throw an error, it's valid
        return true;
    }
    catch (error) {
        return false; // Parsing failed, tag is invalid
    }
}
//# sourceMappingURL=parser.js.map