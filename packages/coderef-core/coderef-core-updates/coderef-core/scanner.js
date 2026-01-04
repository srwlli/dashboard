// scanner.ts (AST-based implementation)
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript'; // Import the TypeScript compiler API
// Store elements found during the scan
let elements = [];
/**
 * Extracts the name identifier from various declaration nodes.
 * @param node The AST node (e.g., FunctionDeclaration, ClassDeclaration).
 * @returns The name identifier string or null if not found.
 */
function getNodeName(node) {
    // FunctionDeclaration, ClassDeclaration, InterfaceDeclaration, EnumDeclaration, TypeAliasDeclaration
    if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isEnumDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        return node.name?.getText() || null;
    }
    // MethodDeclaration, PropertyDeclaration, GetAccessorDeclaration, SetAccessorDeclaration
    if (ts.isMethodDeclaration(node) || ts.isPropertyDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) {
        // Check if name is Identifier or StringLiteral/NumericLiteral for computed properties
        if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) || ts.isNumericLiteral(node.name)) {
            return node.name.getText();
        }
        // Handle computed property names if needed, returning a placeholder for now
        // if (ts.isComputedPropertyName(node.name)) { return '[Computed]'; }
        return null;
    }
    // VariableDeclaration (for const/let/var functions/hooks/components)
    if (ts.isVariableDeclaration(node)) {
        if (ts.isIdentifier(node.name)) {
            return node.name.getText();
        }
        // Handle binding patterns (like object/array destructuring) if necessary
        // else if (ts.isObjectBindingPattern(node.name) || ts.isArrayBindingPattern(node.name)) { return '[BindingPattern]'; }
        return null;
    }
    // Parameter (if needed)
    if (ts.isParameter(node)) {
        if (ts.isIdentifier(node.name)) {
            return node.name.getText();
        }
        // Handle binding patterns if necessary
        return null;
    }
    return null;
}
/**
 * Traverses the TypeScript AST to find elements.
 * @param node The current AST node.
 * @param sourceFile The full source file AST node for context (e.g., getting line numbers).
 */
function visitTsNode(node, sourceFile) {
    let elementType = null;
    let elementName = null;
    // --- Identify Element Type and Name ---
    if (ts.isFunctionDeclaration(node)) {
        elementName = getNodeName(node);
        // Basic heuristic for React components/hooks by name convention
        if (elementName && /^[A-Z]/.test(elementName)) {
            elementType = 'component';
        }
        else if (elementName && /^use[A-Z]/.test(elementName)) {
            elementType = 'hook';
        }
        else {
            elementType = 'function';
        }
    }
    else if (ts.isClassDeclaration(node)) {
        elementType = 'class';
        elementName = getNodeName(node);
    }
    else if (ts.isMethodDeclaration(node)) {
        // Could potentially be within a class or object literal
        elementType = 'method';
        elementName = getNodeName(node);
    }
    else if (ts.isVariableDeclaration(node)) {
        // Check if it's an arrow function, potentially a component or hook
        if (node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
            elementName = getNodeName(node);
            if (elementName && /^[A-Z]/.test(elementName)) {
                elementType = 'component'; // Treat PascalCase const/let/var functions as components
            }
            else if (elementName && /^use[A-Z]/.test(elementName)) {
                elementType = 'hook'; // Treat const/let/var starting with 'use' as hooks
            }
            else {
                elementType = 'function'; // Treat as regular function otherwise
            }
        }
    }
    // Add checks for other types like ts.isInterfaceDeclaration, ts.isEnumDeclaration etc. if needed
    // --- Add Element if Found ---
    if (elementType && elementName) {
        try {
            const lineChar = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart(sourceFile));
            elements.push({
                type: elementType,
                name: elementName,
                file: sourceFile.fileName.replace(/\\/g, '/'), // Normalize path separators
                line: lineChar.line + 1, // ts line numbers are 0-based
            });
        }
        catch (e) {
            console.error(`Error getting position for node ${elementName} in ${sourceFile.fileName}: ${e}`);
        }
    }
    // --- Continue Traversal ---
    ts.forEachChild(node, (childNode) => visitTsNode(childNode, sourceFile));
}
/**
 * Scans the codebase using AST for code elements.
 * @param dir Directory to scan
 * @param lang Target language extensions (e.g., 'ts', 'js', 'py')
 * @param options Scan options (recursive, include/exclude etc. - simplified for now)
 * @returns Array of code elements
 */
export async function scanCurrentElements(dir, lang = ['ts', 'js', 'tsx', 'jsx', 'py'], // Default languages
options = {}) {
    elements = []; // Reset elements for each scan call
    const resolvedDir = path.resolve(dir);
    const langsToScan = new Set(Array.isArray(lang) ? lang : [lang]);
    const verbose = options.verbose ?? false;
    if (verbose) {
        console.log('Starting AST scan with options:', { dir: resolvedDir, lang: [...langsToScan], options });
    }
    // Basic recursive file reading (can be enhanced later with glob/exclude patterns from ScanOptions)
    function findFilesRecursively(currentDir) {
        let filesFound = [];
        try {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                const relativePathForExclusion = path.relative(resolvedDir, fullPath).replace(/\\/g, '/');
                // Rudimentary exclude (can be improved with glob matching from options.exclude)
                if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build' || entry.name.startsWith('.')) {
                    if (verbose)
                        console.log(`Excluding standard directory/hidden file: ${fullPath}`);
                    continue;
                }
                // TODO: Implement better include/exclude logic using options.include/exclude glob patterns
                if (entry.isDirectory()) {
                    if (options.recursive !== false) { // Default to recursive
                        if (verbose)
                            console.log(`Scanning directory: ${fullPath}`);
                        filesFound = filesFound.concat(findFilesRecursively(fullPath));
                    }
                    else {
                        if (verbose)
                            console.log(`Skipping directory (recursive=false): ${fullPath}`);
                    }
                }
                else if (entry.isFile()) {
                    filesFound.push(fullPath);
                }
            }
        }
        catch (error) {
            console.error(`Error reading directory ${currentDir}:`, error);
        }
        return filesFound;
    }
    const allFiles = findFilesRecursively(resolvedDir);
    if (verbose)
        console.log(`Found ${allFiles.length} potential files to process.`);
    for (const filePath of allFiles) {
        const ext = path.extname(filePath).substring(1);
        const normalizedFilePath = filePath.replace(/\\/g, '/'); // Normalize path separators
        if (!langsToScan.has(ext)) {
            if (verbose)
                console.log(`Skipping file (extension not targeted): ${normalizedFilePath}`);
            continue;
        }
        // --- TypeScript / JavaScript Handling ---
        if (['ts', 'tsx', 'js', 'jsx'].includes(ext)) {
            if (verbose)
                console.log(`Processing TS/JS file: ${normalizedFilePath}`);
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                // Skip parsing if file looks like it's entirely comments (basic check)
                if (!options.includeComments && content.trim().length === 0 || content.trim().startsWith('//') || content.trim().startsWith('/*')) {
                    if (verbose)
                        console.log(`Skipping likely comment-only file: ${normalizedFilePath}`);
                    continue;
                }
                // Parse the file content into a TypeScript AST SourceFile
                const sourceFile = ts.createSourceFile(normalizedFilePath, // Use normalized path as fileName
                content, ts.ScriptTarget.Latest, // Use latest to support modern syntax
                true // setParentNodes flag - crucial for some API calls
                );
                // Start AST traversal
                visitTsNode(sourceFile, sourceFile); // Pass sourceFile for context
            }
            catch (error) {
                // Log more specific errors if possible
                if (error instanceof Error) {
                    console.error(`Error processing TS/JS file ${normalizedFilePath}: ${error.message}${verbose ? `\n${error.stack}` : ''}`);
                }
                else {
                    console.error(`Unknown error processing TS/JS file ${normalizedFilePath}:`, error);
                }
            }
        }
        // --- Python Handling (Placeholder) ---
        else if (ext === 'py') {
            if (verbose)
                console.log(`Processing Python file (placeholder): ${normalizedFilePath}`);
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                // TODO: Add Python AST parsing using 'ast' module
                // 1. Need a way to invoke Python's 'ast' module from Node.js
                //    (e.g., using child_process.spawn to run a small Python script)
                // 2. Define a Python script that takes code via stdin, parses it,
                //    walks the AST using ast.NodeVisitor, and prints relevant info (name, type, line) as JSON to stdout.
                // 3. Call this script from here, parse the JSON output, and add to 'elements'.
                if (verbose)
                    console.warn(`Python AST parsing requires external script execution - not yet implemented for: ${normalizedFilePath}`);
            }
            catch (error) {
                console.error(`Error reading Python file ${normalizedFilePath}:`, error);
            }
        }
        else {
            if (verbose)
                console.log(`Skipping file (unhandled extension in list): ${normalizedFilePath}`);
        }
    }
    if (verbose)
        console.log(`Scan complete. Found ${elements.length} elements.`);
    return elements;
}
// Note: The old LANGUAGE_PATTERNS, Scanner class, isLineCommented, isEntirelyCommented,
// and ScannerRegistry are removed as they are replaced by the AST approach.
//# sourceMappingURL=scanner.js.map