/**
 * CodeRef2 EBNF Parser
 *
 * Parses @Type/path#element:line{metadata} reference strings into structured objects
 * based on the grammar defined in coderef2-specification.md
 *
 * EBNF Grammar:
 * CodeRef ::= '@' TypeDesignator '/' Path ('#' Element)? (':' LineReference)? ('{' Metadata '}')?
 *
 * Implementation follows specification lines 422-451
 */
export interface ParsedCodeRef {
    type: string;
    path: string;
    element?: string;
    line?: string;
    lineEnd?: string;
    blockType?: string;
    blockIdentifier?: string;
    metadata?: Record<string, any>;
    isValid: boolean;
    errors: string[];
}
export interface ParserOptions {
    strict?: boolean;
    allowUnknownTypes?: boolean;
}
export declare class CodeRefParser {
    private strict;
    private allowUnknownTypes;
    private validTypes;
    constructor(options?: ParserOptions);
    /**
     * Parse a CodeRef string into a structured object
     * @param reference - The CodeRef string to parse (e.g., "@Fn/utils/logger#logInfo:42")
     * @returns ParsedCodeRef with all components extracted
     */
    parse(reference: string): ParsedCodeRef;
    /**
     * Validate path format: PathSegment ('/' PathSegment)*
     * PathSegment ::= [A-Za-z0-9_\-\.~%]+ | EscapedChar
     * EscapedChar ::= '\' [#:\/{}]
     */
    private isValidPath;
    /**
     * Validate element format:
     * Element ::= ElementName ('.' SubElement)* | ElementWithParams | 'default'
     * ElementName ::= [A-Za-z0-9_\-]+ | EscapedChar
     * SubElement ::= [A-Za-z0-9_\-]+ | EscapedChar
     * ElementWithParams ::= ElementName '(' ParamList ')'
     */
    private isValidElement;
    /**
     * Parse metadata section
     * Metadata ::= MetadataEntry (',' MetadataEntry)*
     * MetadataEntry ::= CategoryPrefix? Key ('=' Value)?
     * CategoryPrefix ::= [A-Za-z][A-Za-z0-9_\-]* ':'
     */
    private parseMetadata;
    /**
     * Split metadata entries by comma, respecting quoted strings
     */
    private splitMetadataEntries;
    /**
     * Parse metadata value
     * Value ::= QuotedString | Number | Boolean | Array | Timestamp | CodeRefValue
     */
    private parseMetadataValue;
}
export declare const parser: CodeRefParser;
/**
 * Convenience function to parse a single reference
 */
export declare function parseCodeRef(reference: string, options?: ParserOptions): ParsedCodeRef;
/**
 * Batch parse multiple references
 */
export declare function parseCodeRefs(references: string[], options?: ParserOptions): ParsedCodeRef[];
//# sourceMappingURL=parser.d.ts.map