/**
 * CodeRef2 Type System
 *
 * 26 type designators with validation, priorities, and metadata
 * per specification lines 503-526
 */
export declare enum TypeDesignator {
    F = "F",// File
    D = "D",// Directory
    C = "C",// Component
    Fn = "Fn",// Function
    Cl = "Cl",// Class
    M = "M",// Method
    V = "V",// Variable
    S = "S",// Style
    T = "T",// Test
    A = "A",// API Route
    Cfg = "Cfg",// Config
    H = "H",// Hook
    Ctx = "Ctx",// Context
    R = "R",// Redux
    Q = "Q",// Query
    I = "I",// Interface/Type
    Doc = "Doc",// Documentation
    Gen = "Gen",// Generated
    Dep = "Dep",// Dependency
    E = "E",// Event
    WIP = "WIP",// Work in Progress
    AST = "AST"
}
export declare enum TypePriority {
    High = "High",
    Medium = "Medium",
    Low = "Low"
}
export interface TypeMetadata {
    name: string;
    description: string;
    priority: TypePriority;
    examples: string[];
}
export declare const TYPE_METADATA: Record<TypeDesignator, TypeMetadata>;
/**
 * Validate type designator
 */
export declare function isValidTypeDesignator(type: string): boolean;
/**
 * Get type metadata
 */
export declare function getTypeMetadata(type: string): TypeMetadata | null;
/**
 * Get type priority
 */
export declare function getTypePriority(type: string): TypePriority;
/**
 * Get all high-priority types
 */
export declare function getHighPriorityTypes(): string[];
/**
 * Get all types by priority
 */
export declare function getTypesByPriority(priority: TypePriority): string[];
//# sourceMappingURL=types.d.ts.map