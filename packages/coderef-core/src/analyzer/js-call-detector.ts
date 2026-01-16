/**
 * JavaScript Call Detector - Detects function/method calls in JavaScript code
 * Phase 2, Task JS-006: Implement JSCallDetector class
 *
 * Detects:
 * - Direct function calls: foo()
 * - Method calls: obj.method(), this.method()
 * - Constructor calls: new ClassName()
 * - Callbacks: array.map(fn)
 * - Module imports: import/require statements
 * - Function parameters from signatures
 *
 * Uses Acorn AST parser for JavaScript-specific analysis
 * Mirrors TypeScript CallDetector architecture for consistency
 */

import { Node } from 'acorn';
import { parseJavaScriptFile } from './js-parser.js';

/**
 * Parameter information extracted from function signature
 */
export interface Parameter {
  name: string;           // 'a', '{x, y}', '...args'
  hasDefault: boolean;    // Has default value
  isRest: boolean;        // Rest parameter (...)
  isDestructured: boolean; // Object/array destructuring
}

/**
 * Represents a function/method call detected in JavaScript code
 */
export interface CallExpression {
  callerFunction?: string;
  callerClass?: string;
  calleeFunction: string;
  calleeObject?: string;
  callType: 'function' | 'method' | 'constructor' | 'static';
  isAsync: boolean;
  line: number;
  column: number;
  isNested: boolean;
}

/**
 * Represents a call relationship edge in the dependency graph
 */
export interface CallEdge {
  sourceFile: string;
  targetFile: string;
  calls: CallExpression[];
  edgeType: 'calls';
}

/**
 * Represents a module import/require statement
 */
export interface ModuleImport {
  source: string;           // './utils', 'lodash'
  importType: 'esm' | 'commonjs';
  specifiers: string[];     // ['foo', 'bar'] or ['default']
  line: number;
  isDefault: boolean;
  dynamic?: boolean;        // PHASE 5: True for dynamic imports (import() calls)
}

/**
 * Represents a module export statement
 */
export interface ModuleExport {
  exportType: 'esm' | 'commonjs';
  specifiers: string[];     // ['foo', 'bar'] or ['default']
  line: number;
  isDefault: boolean;
}

/**
 * Context information while traversing AST
 */
interface TraversalContext {
  functionName?: string;
  className?: string;
  parameters?: Parameter[];
  isAsync?: boolean;
}

/**
 * JavaScript Call Detector
 * Analyzes JavaScript files to extract function calls and parameters
 */
export class JSCallDetector {
  private basePath: string;
  private callCache: Map<string, CallExpression[]> = new Map();
  private parameterCache: Map<string, Map<string, Parameter[]>> = new Map();
  private importsCache: Map<string, ModuleImport[]> = new Map();
  private exportsCache: Map<string, ModuleExport[]> = new Map();

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
  }

  /**
   * Detect calls in a single JavaScript file
   */
  detectCalls(filePath: string): CallExpression[] {
    // Check cache first
    if (this.callCache.has(filePath)) {
      return this.callCache.get(filePath)!;
    }

    const result = parseJavaScriptFile(filePath);
    if (!result.success || !result.ast) {
      return [];
    }

    const calls: CallExpression[] = [];
    this.visitNode(result.ast, calls, filePath);

    // Cache results
    this.callCache.set(filePath, calls);
    return calls;
  }

  /**
   * Get parameters for all functions in a file
   */
  getFileParameters(filePath: string): Map<string, Parameter[]> {
    // Check cache
    if (this.parameterCache.has(filePath)) {
      return this.parameterCache.get(filePath)!;
    }

    const result = parseJavaScriptFile(filePath);
    if (!result.success || !result.ast) {
      return new Map();
    }

    const parameters = new Map<string, Parameter[]>();
    this.extractParametersFromAST(result.ast, filePath, parameters);

    // Cache results
    this.parameterCache.set(filePath, parameters);
    return parameters;
  }

  /**
   * Detect module imports in a file (ESM import + CommonJS require)
   */
  detectImports(filePath: string): ModuleImport[] {
    // Check cache
    if (this.importsCache.has(filePath)) {
      return this.importsCache.get(filePath)!;
    }

    const result = parseJavaScriptFile(filePath);
    if (!result.success || !result.ast) {
      return [];
    }

    const imports: ModuleImport[] = [];
    this.extractImportsFromAST(result.ast, imports);

    // Cache results
    this.importsCache.set(filePath, imports);
    return imports;
  }

  /**
   * Detect module exports in a file (ESM export + CommonJS module.exports)
   */
  detectExports(filePath: string): ModuleExport[] {
    // Check cache
    if (this.exportsCache.has(filePath)) {
      return this.exportsCache.get(filePath)!;
    }

    const result = parseJavaScriptFile(filePath);
    if (!result.success || !result.ast) {
      return [];
    }

    const exports: ModuleExport[] = [];
    this.extractExportsFromAST(result.ast, exports);

    // Cache results
    this.exportsCache.set(filePath, exports);
    return exports;
  }

  /**
   * Recursively visit AST nodes to find call expressions
   */
  private visitNode(
    node: any,
    calls: CallExpression[],
    filePath: string,
    context?: TraversalContext
  ): void {
    if (!node || typeof node !== 'object') return;

    // Track current context (function/class scope)
    let currentContext = context;

    // Update context based on node type
    if (node.type === 'FunctionDeclaration' && node.id) {
      currentContext = {
        functionName: node.id.name,
        className: context?.className,
        parameters: node.params ? this.extractParameters(node.params) : [],
        isAsync: node.async || false,
      };
    } else if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
      // Anonymous function - keep parent context
      currentContext = {
        ...context,
        isAsync: node.async || false,
      };
    } else if (node.type === 'MethodDefinition' && node.key) {
      const methodName = node.key.type === 'Identifier' ? node.key.name : '';
      currentContext = {
        functionName: methodName,
        className: context?.className,
        parameters: node.value?.params ? this.extractParameters(node.value.params) : [],
        isAsync: node.value?.async || false,
      };
    } else if (node.type === 'ClassDeclaration' && node.id) {
      currentContext = {
        functionName: context?.functionName,
        className: node.id.name,
      };
    }

    // Handle call expressions
    if (node.type === 'CallExpression') {
      const call = this.parseCallExpression(node, filePath, currentContext);
      if (call) {
        calls.push(call);
      }
    }

    // Handle new expressions (constructors)
    if (node.type === 'NewExpression') {
      const call = this.parseNewExpression(node, filePath, currentContext);
      if (call) {
        calls.push(call);
      }
    }

    // Recursively visit children
    for (const key in node) {
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          this.visitNode(item, calls, filePath, currentContext);
        }
      } else if (child && typeof child === 'object') {
        this.visitNode(child, calls, filePath, currentContext);
      }
    }
  }

  /**
   * Parse a CallExpression node
   */
  private parseCallExpression(
    node: any,
    filePath: string,
    context?: TraversalContext
  ): CallExpression | null {
    const callee = node.callee;
    let calleeFunction = '';
    let calleeObject = '';
    let callType: 'function' | 'method' | 'constructor' | 'static' = 'function';

    // Handle different callee patterns
    if (callee.type === 'Identifier') {
      // Direct function call: foo()
      calleeFunction = callee.name;
      callType = 'function';
    } else if (callee.type === 'MemberExpression') {
      // Method call: obj.method() or this.method()
      if (callee.property.type === 'Identifier') {
        calleeFunction = callee.property.name;
      }

      if (callee.object.type === 'Identifier') {
        calleeObject = callee.object.name;
        callType = 'method';
      } else if (callee.object.type === 'ThisExpression') {
        calleeObject = 'this';
        callType = 'method';
      } else if (callee.object.type === 'MemberExpression') {
        // Nested: obj.prop.method()
        calleeObject = this.extractObjectName(callee.object);
        callType = 'method';
      }
    }

    // Skip if we couldn't extract a callee function name
    if (!calleeFunction) {
      return null;
    }

    // Get location
    const line = node.loc?.start.line || 0;
    const column = node.loc?.start.column || 0;

    // Check if async (await expression)
    const isAsync = context?.isAsync || false;

    // Check if nested
    const isNested = this.isNestedCall(node);

    return {
      callerFunction: context?.functionName,
      callerClass: context?.className,
      calleeFunction,
      calleeObject: calleeObject || undefined,
      callType,
      isAsync,
      line,
      column,
      isNested,
    };
  }

  /**
   * Parse a NewExpression node (constructor call)
   */
  private parseNewExpression(
    node: any,
    filePath: string,
    context?: TraversalContext
  ): CallExpression | null {
    const callee = node.callee;
    let calleeFunction = '';

    if (callee.type === 'Identifier') {
      calleeFunction = callee.name;
    } else if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
      calleeFunction = callee.property.name;
    }

    if (!calleeFunction) {
      return null;
    }

    const line = node.loc?.start.line || 0;
    const column = node.loc?.start.column || 0;

    return {
      callerFunction: context?.functionName,
      callerClass: context?.className,
      calleeFunction,
      calleeObject: undefined,
      callType: 'constructor',
      isAsync: false,
      line,
      column,
      isNested: false,
    };
  }

  /**
   * Extract object name from nested MemberExpression
   */
  private extractObjectName(node: any): string {
    if (node.type === 'Identifier') {
      return node.name;
    } else if (node.type === 'MemberExpression') {
      const base = this.extractObjectName(node.object);
      const prop = node.property.type === 'Identifier' ? node.property.name : '?';
      return `${base}.${prop}`;
    } else if (node.type === 'ThisExpression') {
      return 'this';
    }
    return '?';
  }

  /**
   * Check if a call is nested inside another call
   */
  private isNestedCall(node: any): boolean {
    // Simple heuristic: check if parent node type suggests nesting
    // (Note: Acorn doesn't provide parent pointers, so this is limited)
    return false; // TODO: Could enhance with full parent tracking
  }

  /**
   * Extract parameters from function params array
   */
  private extractParameters(params: any[]): Parameter[] {
    return params.map(param => this.extractParameter(param));
  }

  /**
   * Extract a single parameter
   */
  private extractParameter(param: any): Parameter {
    // Simple identifier: a, b, c
    if (param.type === 'Identifier') {
      return {
        name: param.name,
        hasDefault: false,
        isRest: false,
        isDestructured: false,
      };
    }

    // Default parameter: a = 1
    if (param.type === 'AssignmentPattern') {
      const inner = this.extractParameter(param.left);
      return {
        ...inner,
        hasDefault: true,
      };
    }

    // Rest parameter: ...args
    if (param.type === 'RestElement') {
      const inner = this.extractParameter(param.argument);
      return {
        ...inner,
        name: '...' + inner.name,
        isRest: true,
      };
    }

    // Object destructuring: { x, y }
    if (param.type === 'ObjectPattern') {
      const props = param.properties
        .map((p: any) => {
          if (p.type === 'Property' && p.key.type === 'Identifier') {
            return p.key.name;
          }
          if (p.type === 'RestElement' && p.argument.type === 'Identifier') {
            return '...' + p.argument.name;
          }
          return '?';
        })
        .filter((p: string) => p !== '?');

      return {
        name: `{${props.join(', ')}}`,
        hasDefault: false,
        isRest: false,
        isDestructured: true,
      };
    }

    // Array destructuring: [a, b]
    if (param.type === 'ArrayPattern') {
      const elements = param.elements
        .map((e: any) => {
          if (!e) return null;
          if (e.type === 'Identifier') return e.name;
          if (e.type === 'RestElement' && e.argument.type === 'Identifier') {
            return '...' + e.argument.name;
          }
          return '?';
        })
        .filter((e: any) => e !== null && e !== '?');

      return {
        name: `[${elements.join(', ')}]`,
        hasDefault: false,
        isRest: false,
        isDestructured: true,
      };
    }

    // Fallback
    return {
      name: '<unknown>',
      hasDefault: false,
      isRest: false,
      isDestructured: false,
    };
  }

  /**
   * Extract parameters from all functions in AST
   */
  private extractParametersFromAST(
    ast: any,
    filePath: string,
    result: Map<string, Parameter[]>,
    context?: { className?: string }
  ): void {
    if (!ast || typeof ast !== 'object') return;

    // Track class context
    let currentContext = context;

    if (ast.type === 'ClassDeclaration' && ast.id) {
      currentContext = { className: ast.id.name };
    }

    // Extract from function declarations
    if (ast.type === 'FunctionDeclaration' && ast.id && ast.params) {
      const functionName = ast.id.name;
      const parameters = this.extractParameters(ast.params);
      const key = currentContext?.className
        ? `${currentContext.className}.${functionName}`
        : functionName;
      result.set(key, parameters);
    }

    // Extract from method definitions
    if (ast.type === 'MethodDefinition' && ast.key && ast.value?.params) {
      const methodName = ast.key.type === 'Identifier' ? ast.key.name : '';
      const parameters = this.extractParameters(ast.value.params);
      const key = currentContext?.className
        ? `${currentContext.className}.${methodName}`
        : methodName;
      result.set(key, parameters);
    }

    // Recursively traverse
    for (const key in ast) {
      const child = ast[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          this.extractParametersFromAST(item, filePath, result, currentContext);
        }
      } else if (child && typeof child === 'object') {
        this.extractParametersFromAST(child, filePath, result, currentContext);
      }
    }
  }

  /**
   * Build call relationship edges from detected calls
   */
  buildCallEdges(
    filePaths: string[],
    elementMap?: Map<string, { file: string; type: string }>
  ): CallEdge[] {
    const edges: CallEdge[] = [];
    const edgeMap = new Map<string, CallEdge>();

    for (const filePath of filePaths) {
      const calls = this.detectCalls(filePath);

      for (const call of calls) {
        // Map callee function to element
        const calleeIdentifier = call.calleeObject
          ? `${call.calleeObject}.${call.calleeFunction}`
          : call.calleeFunction;

        // Find target file if elementMap provided
        let targetFile = call.calleeFunction;
        if (elementMap) {
          const element = elementMap.get(calleeIdentifier);
          if (element) {
            targetFile = element.file;
          }
        }

        const edgeKey = `${filePath} -> ${targetFile}`;

        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, {
            sourceFile: filePath,
            targetFile,
            calls: [],
            edgeType: 'calls',
          });
        }

        edgeMap.get(edgeKey)!.calls.push(call);
      }
    }

    return Array.from(edgeMap.values());
  }

  /**
   * Analyze call frequency and patterns
   */
  analyzeCallPatterns(filePaths: string[]): {
    totalCalls: number;
    uniqueFunctions: Set<string>;
    methodCalls: number;
    constructorCalls: number;
    asyncCalls: number;
    nestedCalls: number;
  } {
    let totalCalls = 0;
    const uniqueFunctions = new Set<string>();
    let methodCalls = 0;
    let constructorCalls = 0;
    let asyncCalls = 0;
    let nestedCalls = 0;

    for (const filePath of filePaths) {
      const calls = this.detectCalls(filePath);

      for (const call of calls) {
        totalCalls++;
        uniqueFunctions.add(call.calleeFunction);

        if (call.callType === 'method') methodCalls++;
        if (call.callType === 'constructor') constructorCalls++;
        if (call.isAsync) asyncCalls++;
        if (call.isNested) nestedCalls++;
      }
    }

    return {
      totalCalls,
      uniqueFunctions,
      methodCalls,
      constructorCalls,
      asyncCalls,
      nestedCalls,
    };
  }

  /**
   * Extract imports from AST
   */
  private extractImportsFromAST(ast: any, imports: ModuleImport[]): void {
    if (!ast || typeof ast !== 'object') return;

    // ESM import: import { foo } from './bar'
    if (ast.type === 'ImportDeclaration') {
      const specifiers: string[] = [];
      let isDefault = false;

      for (const spec of ast.specifiers || []) {
        if (spec.type === 'ImportDefaultSpecifier') {
          specifiers.push('default');
          isDefault = true;
        } else if (spec.type === 'ImportSpecifier' && spec.imported) {
          specifiers.push(spec.imported.name);
        } else if (spec.type === 'ImportNamespaceSpecifier') {
          specifiers.push('*');
        }
      }

      imports.push({
        source: ast.source.value,
        importType: 'esm',
        specifiers,
        line: ast.loc?.start.line || 0,
        isDefault,
      });
    }

    // CommonJS require: const foo = require('./bar')
    if (ast.type === 'CallExpression' &&
        ast.callee?.type === 'Identifier' &&
        ast.callee.name === 'require' &&
        ast.arguments[0]?.type === 'Literal') {

      imports.push({
        source: ast.arguments[0].value,
        importType: 'commonjs',
        specifiers: ['*'], // CommonJS typically imports the whole module
        line: ast.loc?.start.line || 0,
        isDefault: false,
      });
    }

    // PHASE 5: Dynamic import: import('./module') or await import('./module')
    if (ast.type === 'CallExpression' &&
        ast.callee?.type === 'Import' && // Acorn uses 'Import' type for dynamic imports
        ast.arguments[0]) {

      let source = '<dynamic>'; // Default for non-literal expressions

      // Try to extract the module path
      if (ast.arguments[0].type === 'Literal') {
        source = ast.arguments[0].value;
      } else if (ast.arguments[0].type === 'TemplateLiteral') {
        // Template literal - extract the static part
        const quasis = ast.arguments[0].quasis || [];
        if (quasis.length > 0 && quasis[0].value?.cooked) {
          source = quasis[0].value.cooked + '...'; // Mark as dynamic template
        }
      }

      imports.push({
        source,
        importType: 'esm', // Dynamic imports use ESM module resolution
        specifiers: ['*'], // Dynamic imports can access any export
        line: ast.loc?.start.line || 0,
        isDefault: false,
        dynamic: true, // PHASE 5: Mark as dynamic import
      });
    }

    // Recursively traverse
    for (const key in ast) {
      const child = ast[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          this.extractImportsFromAST(item, imports);
        }
      } else if (child && typeof child === 'object') {
        this.extractImportsFromAST(child, imports);
      }
    }
  }

  /**
   * Extract exports from AST
   */
  private extractExportsFromAST(ast: any, exports: ModuleExport[]): void {
    if (!ast || typeof ast !== 'object') return;

    // ESM export: export { foo, bar }
    if (ast.type === 'ExportNamedDeclaration') {
      const specifiers: string[] = [];

      for (const spec of ast.specifiers || []) {
        if (spec.exported?.name) {
          specifiers.push(spec.exported.name);
        }
      }

      // export const foo = ...
      if (ast.declaration) {
        if (ast.declaration.type === 'VariableDeclaration') {
          for (const decl of ast.declaration.declarations) {
            if (decl.id?.name) {
              specifiers.push(decl.id.name);
            }
          }
        } else if (ast.declaration.id?.name) {
          // export function foo() or export class Foo
          specifiers.push(ast.declaration.id.name);
        }
      }

      if (specifiers.length > 0) {
        exports.push({
          exportType: 'esm',
          specifiers,
          line: ast.loc?.start.line || 0,
          isDefault: false,
        });
      }
    }

    // ESM default export: export default foo
    if (ast.type === 'ExportDefaultDeclaration') {
      const specifier = ast.declaration?.id?.name || ast.declaration?.name || 'default';

      exports.push({
        exportType: 'esm',
        specifiers: [specifier],
        line: ast.loc?.start.line || 0,
        isDefault: true,
      });
    }

    // CommonJS: module.exports = {...}
    if (ast.type === 'AssignmentExpression' &&
        ast.left?.type === 'MemberExpression' &&
        ast.left.object?.name === 'module' &&
        ast.left.property?.name === 'exports') {

      const specifiers: string[] = [];

      // module.exports = { foo, bar }
      if (ast.right?.type === 'ObjectExpression') {
        for (const prop of ast.right.properties || []) {
          if (prop.key?.name) {
            specifiers.push(prop.key.name);
          }
        }
      } else {
        specifiers.push('default');
      }

      exports.push({
        exportType: 'commonjs',
        specifiers,
        line: ast.loc?.start.line || 0,
        isDefault: specifiers.includes('default'),
      });
    }

    // CommonJS: exports.foo = ...
    if (ast.type === 'AssignmentExpression' &&
        ast.left?.type === 'MemberExpression' &&
        ast.left.object?.name === 'exports' &&
        ast.left.property?.name) {

      exports.push({
        exportType: 'commonjs',
        specifiers: [ast.left.property.name],
        line: ast.loc?.start.line || 0,
        isDefault: false,
      });
    }

    // Recursively traverse
    for (const key in ast) {
      const child = ast[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          this.extractExportsFromAST(item, exports);
        }
      } else if (child && typeof child === 'object') {
        this.extractExportsFromAST(child, exports);
      }
    }
  }

  /**
   * PHASE 1: AST Integration - Detect code elements (interfaces, types, decorators, properties)
   *
   * Extracts TypeScript/JavaScript elements beyond what regex can detect:
   * - Interfaces
   * - Type aliases
   * - Decorators (@Component, @Injectable)
   * - Class properties
   *
   * @param filePath Path to the file to analyze
   * @returns Array of ElementData matching scanner format
   */
  detectElements(filePath: string): Array<{
    type: 'interface' | 'type' | 'decorator' | 'property' | 'function' | 'class' | 'method';
    name: string;
    file: string;
    line: number;
    exported?: boolean;
  }> {
    const result = parseJavaScriptFile(filePath);
    if (!result.success || !result.ast) {
      return [];
    }

    const elements: Array<{
      type: 'interface' | 'type' | 'decorator' | 'property' | 'function' | 'class' | 'method';
      name: string;
      file: string;
      line: number;
      exported?: boolean;
    }> = [];

    this.extractElementsFromAST(result.ast, filePath, elements);
    return elements;
  }

  /**
   * Recursively extract elements from AST
   */
  private extractElementsFromAST(
    ast: any,
    filePath: string,
    elements: Array<{
      type: 'interface' | 'type' | 'decorator' | 'property' | 'function' | 'class' | 'method';
      name: string;
      file: string;
      line: number;
      exported?: boolean;
    }>,
    parentExported: boolean = false
  ): void {
    if (!ast || typeof ast !== 'object') {
      return;
    }

    const isExported = parentExported ||
                      (ast.type === 'ExportNamedDeclaration' || ast.type === 'ExportDefaultDeclaration');

    // TypeScript Interface
    if (ast.type === 'TSInterfaceDeclaration' && ast.id) {
      elements.push({
        type: 'interface',
        name: ast.id.name,
        file: filePath,
        line: ast.loc?.start.line || 0,
        exported: isExported
      });
    }

    // TypeScript Type Alias
    if (ast.type === 'TSTypeAliasDeclaration' && ast.id) {
      elements.push({
        type: 'type',
        name: ast.id.name,
        file: filePath,
        line: ast.loc?.start.line || 0,
        exported: isExported
      });
    }

    // Decorators (both class and method decorators)
    if (ast.decorators && Array.isArray(ast.decorators)) {
      for (const decorator of ast.decorators) {
        let decoratorName = '';

        if (decorator.expression?.type === 'Identifier') {
          decoratorName = decorator.expression.name;
        } else if (decorator.expression?.type === 'CallExpression' &&
                   decorator.expression.callee?.type === 'Identifier') {
          decoratorName = decorator.expression.callee.name;
        }

        if (decoratorName) {
          elements.push({
            type: 'decorator',
            name: decoratorName,
            file: filePath,
            line: decorator.loc?.start.line || 0,
            exported: false // Decorators aren't directly exported
          });
        }
      }
    }

    // Class Properties (PropertyDefinition in newer acorn, ClassProperty in older)
    if ((ast.type === 'PropertyDefinition' || ast.type === 'ClassProperty') && ast.key) {
      const propertyName = ast.key.type === 'Identifier' ? ast.key.name : '';
      if (propertyName) {
        elements.push({
          type: 'property',
          name: propertyName,
          file: filePath,
          line: ast.loc?.start.line || 0,
          exported: false // Properties inherit class export status
        });
      }
    }

    // Functions (also capture these for completeness)
    if (ast.type === 'FunctionDeclaration' && ast.id) {
      elements.push({
        type: 'function',
        name: ast.id.name,
        file: filePath,
        line: ast.loc?.start.line || 0,
        exported: isExported
      });
    }

    // Classes
    if (ast.type === 'ClassDeclaration' && ast.id) {
      elements.push({
        type: 'class',
        name: ast.id.name,
        file: filePath,
        line: ast.loc?.start.line || 0,
        exported: isExported
      });
    }

    // Methods
    if (ast.type === 'MethodDefinition' && ast.key) {
      const methodName = ast.key.type === 'Identifier' ? ast.key.name : '';
      if (methodName) {
        elements.push({
          type: 'method',
          name: methodName,
          file: filePath,
          line: ast.loc?.start.line || 0,
          exported: false // Methods inherit class export status
        });
      }
    }

    // Recursively traverse AST
    for (const key in ast) {
      const child = ast[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          this.extractElementsFromAST(item, filePath, elements, isExported);
        }
      } else if (child && typeof child === 'object') {
        this.extractElementsFromAST(child, filePath, elements, isExported);
      }
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.callCache.clear();
    this.parameterCache.clear();
    this.importsCache.clear();
    this.exportsCache.clear();
  }
}

export default JSCallDetector;
