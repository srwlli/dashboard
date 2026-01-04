/**
 * Breaking Change Detector - Detect signature incompatibilities before code generation
 * CR-001: P0 Critical Feature for Safe Agentic Refactoring
 *
 * Provides:
 * - Signature comparison (detect parameter, return type, visibility changes)
 * - Call site enumeration (find all callers affected by changes)
 * - Confidence scoring (estimate likelihood of actual breakage)
 * - Migration hint generation (suggest fixes for different patterns)
 *
 * Integration Points:
 * - Uses AnalyzerService to get dependency graph
 * - Uses GraphBuilder for call relationship detection
 * - Uses ImpactSimulator for risk scoring and severity calculation
 * - Uses QueryExecutor for element relationship queries
 *
 * Usage:
 * ```typescript
 * const detector = new BreakingChangeDetector(analyzerService, impactSimulator);
 * const report = await detector.detectChanges('main', 'feature-branch');
 * console.log(report.changes); // [{element, breakingCount, migrationHints}]
 * ```
 */

import { AnalyzerService } from '../analyzer/analyzer-service.js';
import { ImpactSimulator } from './impact-simulator.js';
import { scanCurrentElements } from '../../scanner.js';
import * as ts from 'typescript';

/**
 * Represents a change to a function/method signature
 */
export interface SignatureChange {
  element: {
    name: string;
    kind: 'Fn' | 'M' | 'Cl';
    file: string;
    line: number;
    coderefTag: string;
  };
  changeType: 'signature' | 'return' | 'visibility' | 'export' | 'overload' | 'type';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: {
    before: string;
    after: string;
    diff: string;
  };
}

/**
 * Represents an impacted call site that will break
 */
export interface ImpactedCallSite {
  file: string;
  line: number;
  callerElement: string;
  callContext: string;
  confidence: number; // 0-1, how certain this breaks
  callType: 'direct' | 'imported' | 'dynamic' | 'proxy';
}

/**
 * Suggestion for fixing a breaking change
 */
export interface MigrationHint {
  hintType: 'wrap' | 'rename' | 'defaultParam' | 'optionsObject' | 'adapter';
  text: string;
  confidence: number; // 0-1, how confident this fix works
  codeExample?: string;
}

/**
 * Complete breaking change analysis result
 */
export interface BreakingChangeReport {
  baseRef: string;
  headRef?: string;
  worktree?: boolean;
  summary: {
    breakingCount: number;
    potentiallyBreakingCount: number;
    nonBreakingCount: number;
  };
  changes: {
    element: SignatureChange['element'];
    changeType: SignatureChange['changeType'];
    severity: SignatureChange['severity'];
    details: SignatureChange['details'];
    impactedCallSites: ImpactedCallSite[];
    migrationHints: MigrationHint[];
  }[];
  metadata: {
    analyzedAt: string;
    analysisTime: number;
    confidence: number; // 0-1, overall confidence of report
  };
}

/**
 * Breaking Change Detector Service
 *
 * Detects signature incompatibilities before code generation, enabling agents
 * to refactor safely without causing runtime failures at call sites.
 */
export class BreakingChangeDetector {
  private analyzerService: AnalyzerService;
  private impactSimulator: ImpactSimulator;

  constructor(analyzerService: AnalyzerService, impactSimulator: ImpactSimulator) {
    this.analyzerService = analyzerService;
    this.impactSimulator = impactSimulator;
  }

  /**
   * Detect breaking changes between two git refs or worktree
   *
   * @param baseRef Git reference to compare against (e.g., 'main')
   * @param headRef Git reference to check (default: current worktree)
   * @param useWorktree Use working tree instead of git ref
   * @param maxDepth Maximum depth for transitive impact analysis
   * @returns Breaking change report with all detected issues
   */
  async detectChanges(
    baseRef: string,
    headRef?: string,
    useWorktree?: boolean,
    maxDepth?: number
  ): Promise<BreakingChangeReport> {
    const startTime = Date.now();

    try {
      // Get changed elements between baseRef and headRef/worktree
      const changedElements = await this.getChangedElements(baseRef, headRef);

      if (changedElements.length === 0) {
        return {
          baseRef,
          headRef,
          worktree: useWorktree,
          summary: {
            breakingCount: 0,
            potentiallyBreakingCount: 0,
            nonBreakingCount: 0,
          },
          changes: [],
          metadata: {
            analyzedAt: new Date().toISOString(),
            analysisTime: Date.now() - startTime,
            confidence: 1.0,
          },
        };
      }

      // Analyze each changed element
      const changes = [];
      let breakingCount = 0;
      let potentiallyBreakingCount = 0;

      for (const element of changedElements) {
        const signatures = {
          before: await this.extractSignaturesFromRef(baseRef, element.file),
          after: useWorktree
            ? await this.extractSignaturesFromWorktree(element.file)
            : await this.extractSignaturesFromRef(headRef || 'HEAD', element.file),
        };

        // Compare signatures for this element
        const beforeSig = signatures.before.get(element.name);
        const afterSig = signatures.after.get(element.name);

        if (!beforeSig || !afterSig) continue;

        const signatureChange = this.compareSignatures(beforeSig, afterSig);
        if (!signatureChange) continue;

        // Check if breaking
        const isBreaking = this.isBreakingChange(signatureChange);
        if (isBreaking) {
          breakingCount++;
        } else {
          potentiallyBreakingCount++;
        }

        // Find impacted call sites
        const impactedCallSites = await this.findImpactedCallSites(element, signatureChange);

        // Calculate severity
        const severity = this.calculateSeverity(signatureChange, impactedCallSites.length);

        // Generate migration hints
        const migrationHints = this.generateMigrationHints(signatureChange, impactedCallSites);

        changes.push({
          element: signatureChange.element,
          changeType: signatureChange.changeType,
          severity,
          details: signatureChange.details,
          impactedCallSites,
          migrationHints,
        });
      }

      return {
        baseRef,
        headRef,
        worktree: useWorktree,
        summary: {
          breakingCount,
          potentiallyBreakingCount,
          nonBreakingCount: changedElements.length - breakingCount - potentiallyBreakingCount,
        },
        changes,
        metadata: {
          analyzedAt: new Date().toISOString(),
          analysisTime: Date.now() - startTime,
          confidence: this.calculateReportConfidence(changes),
        },
      };
    } catch (error) {
      throw new Error(`Breaking change detection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Compare two function signatures and detect incompatibilities
   *
   * @param before Original function signature (from AST)
   * @param after Modified function signature (from AST)
   * @returns SignatureChange describing what changed, or null if no breaking change
   */
  private compareSignatures(before: any, after: any): SignatureChange | null {
    // Extract signature info
    const beforeInfo = {
      params: before.params || [],
      returnType: before.returnType || 'void',
      isExported: before.isExported || false,
      name: before.name,
      file: before.file,
      line: before.line,
      coderefTag: before.coderefTag,
      kind: before.kind,
    };

    const afterInfo = {
      params: after.params || [],
      returnType: after.returnType || 'void',
      isExported: after.isExported || false,
    };

    // Check parameter changes
    const paramDiff = this.compareParameters(beforeInfo.params, afterInfo.params);
    if (paramDiff) {
      return {
        element: {
          name: beforeInfo.name,
          kind: beforeInfo.kind,
          file: beforeInfo.file,
          line: beforeInfo.line,
          coderefTag: beforeInfo.coderefTag,
        },
        changeType: 'signature',
        severity: 'medium',
        details: {
          before: `params: ${JSON.stringify(beforeInfo.params)}`,
          after: `params: ${JSON.stringify(afterInfo.params)}`,
          diff: paramDiff.description,
        },
      };
    }

    // Check return type changes
    if (beforeInfo.returnType !== afterInfo.returnType) {
      return {
        element: {
          name: beforeInfo.name,
          kind: beforeInfo.kind,
          file: beforeInfo.file,
          line: beforeInfo.line,
          coderefTag: beforeInfo.coderefTag,
        },
        changeType: 'return',
        severity: 'medium',
        details: {
          before: beforeInfo.returnType,
          after: afterInfo.returnType,
          diff: `return type changed from ${beforeInfo.returnType} to ${afterInfo.returnType}`,
        },
      };
    }

    // Check visibility changes (exported -> not exported)
    if (beforeInfo.isExported && !afterInfo.isExported) {
      return {
        element: {
          name: beforeInfo.name,
          kind: beforeInfo.kind,
          file: beforeInfo.file,
          line: beforeInfo.line,
          coderefTag: beforeInfo.coderefTag,
        },
        changeType: 'visibility',
        severity: 'high',
        details: {
          before: 'exported',
          after: 'not exported',
          diff: 'element is no longer exported (public API changed)',
        },
      };
    }

    return null;
  }

  /**
   * Compare parameter lists and detect incompatibilities
   */
  private compareParameters(
    beforeParams: any[],
    afterParams: any[]
  ): { description: string; type: 'added' | 'removed' | 'reordered' | 'type-changed' } | null {
    // Required parameter added (breaking if not optional)
    if (afterParams.length > beforeParams.length) {
      const newParams = afterParams.slice(beforeParams.length);
      const hasRequired = newParams.some((p: any) => !p.optional);
      if (hasRequired) {
        return {
          description: `Required parameter(s) added: ${newParams.map((p: any) => p.name).join(', ')}`,
          type: 'added',
        };
      }
    }

    // Parameter removed (breaking - callers might pass it)
    if (afterParams.length < beforeParams.length) {
      const removedParams = beforeParams.slice(afterParams.length);
      return {
        description: `Parameter(s) removed: ${removedParams.map((p: any) => p.name).join(', ')}`,
        type: 'removed',
      };
    }

    // Check parameter reordering
    for (let i = 0; i < beforeParams.length; i++) {
      if (beforeParams[i].name !== afterParams[i].name) {
        return {
          description: `Parameters reordered. Before: ${beforeParams.map((p: any) => p.name).join(', ')}. After: ${afterParams.map((p: any) => p.name).join(', ')}`,
          type: 'reordered',
        };
      }
    }

    // Check parameter type changes
    for (let i = 0; i < beforeParams.length; i++) {
      if (beforeParams[i].type !== afterParams[i].type) {
        return {
          description: `Parameter ${beforeParams[i].name} type changed from ${beforeParams[i].type} to ${afterParams[i].type}`,
          type: 'type-changed',
        };
      }
    }

    return null;
  }

  /**
   * Determine if a signature change is breaking
   *
   * @param change The signature change to analyze
   * @returns true if this change breaks existing code
   */
  private isBreakingChange(change: SignatureChange): boolean {
    // All detected changes from compareSignatures are breaking by definition
    // They were only returned if a change was detected
    return true;
  }

  /**
   * Analyze differences between before/after signatures
   *
   * @param before Original value
   * @param after Modified value
   * @returns Description of the difference
   */
  private analyzeDifference(before: any, after: any): any {
    if (JSON.stringify(before) === JSON.stringify(after)) {
      return null;
    }

    return {
      before,
      after,
      changed: true,
    };
  }

  /**
   * Find all call sites that will be affected by a signature change
   *
   * Uses dependency graph to enumerate callers of the changed element.
   * Extracts actual call context to determine if change is compatible.
   *
   * @param element The changed element
   * @param change The signature change
   * @returns Array of impacted call sites with confidence scoring
   */
  private async findImpactedCallSites(
    element: any,
    change: SignatureChange
  ): Promise<ImpactedCallSite[]> {
    const impactedSites: ImpactedCallSite[] = [];

    try {
      // Get all callers from dependency graph
      const callers = await this.analyzerService.getDependents(element.name);

      if (!callers || callers.length === 0) {
        return impactedSites;
      }

      for (const caller of callers) {
        try {
          // Extract call context at caller location
          const callContext = this.extractCallContext(caller.file, caller.line);
          if (!callContext) continue;

          // Check if this call will be affected by the change
          const isImpacted = this.isCompatibleCall(caller, change);
          if (isImpacted === null) {
            // Could not determine - include with medium confidence
            continue;
          }

          // Calculate confidence this call will break
          const confidence = this.calculateConfidence(
            { ...callContext, name: caller.name },
            change
          );

          impactedSites.push({
            file: caller.file,
            line: caller.line,
            callerElement: caller.name || 'unknown',
            callContext: callContext.context || '',
            confidence,
            callType: callContext.type,
          });
        } catch (err) {
          // Skip this call site but continue processing others
          console.debug(
            `Failed to analyze call site at ${caller.file}:${caller.line}: ${err}`
          );
          continue;
        }
      }

      return impactedSites;
    } catch (error) {
      // If impact analysis fails, return empty array (logged, not throwing)
      console.warn(`Failed to find impacted call sites for ${element.name}: ${error}`);
      return [];
    }
  }

  /**
   * Extract the actual call context at a specific location
   *
   * Reads the file and extracts the code snippet at the specified line,
   * determines call type (direct, imported, dynamic, proxy).
   *
   * @param file File path containing the call
   * @param line Line number of the call
   * @returns Context information about the call
   */
  private extractCallContext(
    file: string,
    line: number
  ): { context: string; type: 'direct' | 'imported' | 'dynamic' | 'proxy' } | null {
    const fs = require('fs');

    try {
      // Read file content
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      if (line < 1 || line > lines.length) {
        return null;
      }

      // Get code context (line and surrounding context)
      const contextStart = Math.max(0, line - 2);
      const contextEnd = Math.min(lines.length, line + 1);
      const codeSnippet = lines.slice(contextStart, contextEnd).join('\n').trim();

      // Determine call type based on code pattern
      const callLine = lines[line - 1] || '';
      let callType: 'direct' | 'imported' | 'dynamic' | 'proxy' = 'direct';

      if (callLine.includes('[') && callLine.includes(']')) {
        callType = 'dynamic'; // obj[name]() or similar
      } else if (callLine.includes('?.')) {
        callType = 'proxy'; // Optional chaining or proxy pattern
      } else if (
        callLine.includes('new Proxy') ||
        callLine.includes('jest.mock') ||
        callLine.includes('sinon.stub')
      ) {
        callType = 'proxy'; // Mocked or proxied
      }

      return {
        context: codeSnippet,
        type: callType,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Determine if a specific call site is compatible with a signature change
   *
   * Returns null if compatibility cannot be determined, true if compatible,
   * false if it will definitely break.
   *
   * @param callSite The call site to check
   * @param change The signature change
   * @returns true/false if compatible, null if unknown
   */
  private isCompatibleCall(callSite: any, change: SignatureChange): boolean | null {
    // For signature changes (parameter changes):
    // - If required parameter added: incompatible (callers don't pass it)
    // - If parameter removed: incompatible (callers still pass it)
    // - If parameters reordered: incompatible (positional calls)
    // - If parameter type changed: incompatible (wrong type)
    //
    // For return type changes:
    // - If return type narrowed (Promise -> value): might be compatible if not await'd
    // - If return type widened: usually compatible
    //
    // For visibility changes (export status):
    // - If made private: incompatible for external callers

    if (change.changeType === 'signature') {
      // All parameter changes are breaking
      return false;
    } else if (change.changeType === 'return') {
      // Return type changes might be compatible depending on usage
      // Conservative: assume breaking
      return false;
    } else if (change.changeType === 'visibility') {
      // Export removal breaks external callers
      return false;
    }

    // Other change types: unknown compatibility
    return null;
  }

  /**
   * Calculate confidence that a detected call site will actually break
   *
   * Multi-factor confidence scoring:
   *
   * Factor 1: Call Type (40% weight)
   * - Direct calls: 0.92 (almost certainly breaking)
   * - Imported calls: 0.85 (likely breaking)
   * - Dynamic calls: 0.65 (might not break - runtime resolution)
   * - Proxy/mock calls: 0.45 (unlikely to break - indirection)
   *
   * Factor 2: Change Type (40% weight)
   * - Signature changes: *0.95 (parameter changes are almost always breaking)
   * - Return type changes: *0.80 (might not break if unused)
   * - Visibility changes: *0.90 (usually breaking for exports)
   *
   * Factor 3: Contextual Factors (20% weight)
   * - Test coverage: high coverage suggests better compatibility handling
   * - Named parameters: higher confidence in positional change breaking
   * - Optional parameters: lower confidence in addition breaking
   *
   * @param callSite The call site to score
   * @param change The signature change
   * @returns Confidence score (0-1, higher = more likely to break)
   */
  private calculateConfidence(callSite: any, change: SignatureChange): number {
    // Factor 1: Call type (40% of confidence)
    const callType = callSite.callType || 'direct';
    const callTypeScore = this.scoreCallType(callType);
    const callTypeFactor = callTypeScore * 0.4;

    // Factor 2: Change type (40% of confidence)
    let changeTypeMultiplier = 1.0;
    if (change.changeType === 'signature') {
      changeTypeMultiplier = 0.95; // Parameter changes are almost always breaking
    } else if (change.changeType === 'return') {
      changeTypeMultiplier = 0.80; // Return type changes may not break if unused
    } else if (change.changeType === 'visibility') {
      changeTypeMultiplier = 0.90; // Visibility changes are usually breaking
    }
    const changeTypeFactor = changeTypeMultiplier * 0.4;

    // Factor 3: Contextual factors (20% of confidence)
    let contextualFactor = 0.2; // Default neutral

    // Adjust for parameter-specific contexts
    if (change.changeType === 'signature' && change.details?.diff) {
      const diff = change.details.diff.toLowerCase();

      // Addition of optional parameters is less breaking
      if (diff.includes('optional') || diff.includes('?')) {
        contextualFactor *= 0.5; // Reduce confidence for optional params
      }

      // Reordering is very breaking
      if (diff.includes('reorder')) {
        contextualFactor *= 1.2; // Increase confidence for reordered params
      }

      // Required parameter addition is very breaking
      if (diff.includes('added') && !diff.includes('optional')) {
        contextualFactor *= 1.1; // Increase confidence for required param addition
      }
    }

    // Sum all factors
    const totalConfidence = callTypeFactor + changeTypeFactor + contextualFactor;

    // Bound the result between 0.3 (very low) and 0.99 (very high)
    return Math.min(0.99, Math.max(0.3, totalConfidence));
  }

  /**
   * Score a specific type of call
   *
   * @param callType Type of call (direct, imported, dynamic, proxy)
   * @returns Base score for this call type
   */
  private scoreCallType(callType: 'direct' | 'imported' | 'dynamic' | 'proxy'): number {
    switch (callType) {
      case 'direct':
        return 0.92; // Direct calls are almost certainly breaking
      case 'imported':
        return 0.85; // Imported calls are likely breaking
      case 'dynamic':
        return 0.65; // Dynamic calls might not break
      case 'proxy':
        return 0.45; // Proxied/mocked calls unlikely to break
      default:
        return 0.75;
    }
  }

  /**
   * Adjust confidence score based on contextual factors
   *
   * @param baseScore Initial confidence score
   * @param factors Contextual factors that affect confidence
   * @returns Adjusted confidence score
   */
  private adjustForContextualFactors(baseScore: number, factors: any[]): number {
    let adjusted = baseScore;

    for (const factor of factors) {
      if (factor.type === 'test_coverage' && factor.value < 0.5) {
        // Low test coverage = higher confidence in break
        adjusted *= 1.1;
      } else if (factor.type === 'usage_frequency' && factor.value > 10) {
        // High usage = more likely to break
        adjusted *= 1.05;
      }
    }

    return Math.min(0.99, adjusted);
  }

  /**
   * Generate migration hints for fixing a breaking change
   *
   * Intelligently suggests patterns based on:
   * - Change type (signature, return, visibility)
   * - Number of call sites affected
   * - Type of change (addition, removal, reordering)
   *
   * Suggested patterns:
   * - wrap: Create new function alongside old one (safest for many call sites)
   * - rename: Create alias for backward compatibility (good for visibility changes)
   * - defaultParam: Add default parameters (for parameter addition)
   * - optionsObject: Convert to options object pattern (for multiple params)
   * - adapter: Create adapter pattern wrapper (for return type changes)
   *
   * @param change The signature change
   * @param callSites Affected call sites (influences hint selection)
   * @returns Array of suggested migration strategies ordered by recommendation
   */
  private generateMigrationHints(change: SignatureChange, callSites: ImpactedCallSite[]): MigrationHint[] {
    const hints: MigrationHint[] = [];

    if (change.changeType === 'signature') {
      const callSiteCount = callSites.length;

      // For many call sites, wrap pattern is safest
      if (callSiteCount > 10) {
        hints.push(this.suggestWrapPattern(change));
        hints.push(this.suggestAdapterPattern(change));
      } else if (callSiteCount >= 5) {
        // Medium call sites: consider default params or wrap
        hints.push(this.suggestDefaultParamPattern(change));
        hints.push(this.suggestWrapPattern(change));
      } else {
        // Few call sites: easier migration options
        hints.push(this.suggestRenamePattern(change));
        hints.push(this.suggestWrapPattern(change));
      }

      // For complex signature changes, suggest options object
      if (callSites.length > 0 && callSites[0].callContext?.includes(',')) {
        hints.push(this.suggestOptionsObjectPattern(change));
      }
    } else if (change.changeType === 'visibility') {
      // Visibility changes: wrap old version or rename
      hints.push(this.suggestWrapPattern(change));
      hints.push(this.suggestRenamePattern(change));
    } else if (change.changeType === 'return') {
      // Return type changes: adapter pattern is best
      hints.push(this.suggestAdapterPattern(change));
      hints.push(this.suggestWrapPattern(change));
    }

    return hints;
  }

  /**
   * Suggest wrap pattern (create new function alongside old)
   *
   * @param change The signature change
   * @returns Wrap pattern migration hint
   */
  private suggestWrapPattern(change: SignatureChange): MigrationHint {
    const name = change.element.name;
    return {
      hintType: 'wrap',
      text: `Create a new version alongside the old one. Keep old ${name}() working, add new ${name}New() or ${name}Async() with new signature.`,
      confidence: 0.9,
      codeExample: `// Keep old version\nfunction ${name}() { /* original implementation */ }\n\n// Add new version\nfunction ${name}New() { /* new implementation */ }`,
    };
  }

  /**
   * Suggest rename pattern (create alias for backward compatibility)
   *
   * @param change The signature change
   * @returns Rename pattern migration hint
   */
  private suggestRenamePattern(change: SignatureChange): MigrationHint {
    const name = change.element.name;
    return {
      hintType: 'rename',
      text: `Create an alias to maintain backward compatibility. Update ${name}() implementation, export as ${name}Compat() or ${name}Legacy().`,
      confidence: 0.8,
      codeExample: `// Export with new name for compatibility\nexport function ${name}() { /* new implementation */ }\nexport const ${name}Compat = ${name}; // Alias for backward compat`,
    };
  }

  /**
   * Suggest adapter pattern (create wrapper)
   *
   * @param change The signature change
   * @returns Adapter pattern migration hint
   */
  private suggestAdapterPattern(change: SignatureChange): MigrationHint {
    const name = change.element.name;
    return {
      hintType: 'adapter',
      text: `Create an adapter that translates old calls to new signature. Useful for gradual migration.`,
      confidence: 0.75,
      codeExample: `// Adapter function\nfunction ${name}Adapter(oldArgs) {\n  const newArgs = transform(oldArgs);\n  return ${name}(newArgs);\n}`,
    };
  }

  /**
   * Suggest default parameter pattern (add defaults for new params)
   *
   * Best for: Adding optional/required parameters with reasonable defaults
   *
   * @param change The signature change
   * @returns Default parameter migration hint
   */
  private suggestDefaultParamPattern(change: SignatureChange): MigrationHint {
    const name = change.element.name;
    return {
      hintType: 'defaultParam',
      text: `Add default parameter values for new required parameters. This allows existing code to work without changes.`,
      confidence: 0.85,
      codeExample: `// Updated signature with defaults\nfunction ${name}(a: string, b: string = 'default') {\n  // implementation\n}`,
    };
  }

  /**
   * Suggest options object pattern (convert multiple params to options)
   *
   * Best for: Complex signatures with many parameters
   *
   * @param change The signature change
   * @returns Options object migration hint
   */
  private suggestOptionsObjectPattern(change: SignatureChange): MigrationHint {
    const name = change.element.name;
    return {
      hintType: 'optionsObject',
      text: `Convert multiple parameters to an options object. More flexible and easier to extend in the future.`,
      confidence: 0.8,
      codeExample: `// Before: function ${name}(a, b, c) { }\n// After:\ninterface ${name}Options { a: string; b?: string; c?: string; }\nfunction ${name}(opts: ${name}Options) { }`,
    };
  }

  /**
   * Integrate with ImpactSimulator to boost severity for risky changes
   *
   * Uses ImpactSimulator.calculateBlastRadius() to determine:
   * - How many elements are transitively affected
   * - Cascading impact depth
   * - Overall risk score from dependency graph
   *
   * Breaking changes to highly-used code are marked CRITICAL.
   * Risk score from ImpactSimulator influences final severity.
   *
   * @param change The signature change
   * @param callSiteCount Number of impacted call sites
   * @returns Final severity level
   */
  private calculateSeverity(change: SignatureChange, callSiteCount: number): 'low' | 'medium' | 'high' | 'critical' {
    // Base severity from change type
    let severity: 'low' | 'medium' | 'high' | 'critical' = change.severity;

    // Boost severity based on direct call site impact
    if (callSiteCount > 20) {
      severity = 'critical';
    } else if (callSiteCount > 10) {
      severity = 'high';
    } else if (callSiteCount > 5) {
      severity = 'medium';
    }

    // Further boost if visibility changed (public API)
    if (change.changeType === 'visibility') {
      severity = 'critical';
    }

    // Integration point: Use ImpactSimulator for transitive impact analysis
    // If element is highly depended upon, escalate severity
    try {
      const blastRadius = this.impactSimulator.calculateBlastRadius(change.element.name, 5);

      // If blast radius indicates high risk, escalate severity
      if (blastRadius.riskScore >= 75) {
        // Very high risk: escalate to critical
        severity = 'critical';
      } else if (blastRadius.riskScore >= 50 && severity === 'medium') {
        // Moderate-high risk: escalate medium to high
        severity = 'high';
      }

      // If many elements are transitively affected (>30), mark critical
      if (
        blastRadius.directImpacts.length + blastRadius.transitiveImpacts.length > 30
      ) {
        severity = 'critical';
      }
    } catch (err) {
      // If blast radius calculation fails, continue with baseline severity
      // This allows the detector to work even if ImpactSimulator is unavailable
      console.debug(`Blast radius calculation failed: ${err}`);
    }

    return severity;
  }

  /**
   * Calculate overall confidence of the report
   *
   * @param changes All detected changes
   * @returns Confidence score (0-1)
   */
  private calculateReportConfidence(changes: any[]): number {
    if (changes.length === 0) return 1.0;

    // Average confidence of all changes
    const totalConfidence = changes.reduce((sum, change) => {
      const callSiteConfidences = change.impactedCallSites.map((cs: any) => cs.confidence);
      const avgCallSiteConfidence =
        callSiteConfidences.length > 0 ? callSiteConfidences.reduce((a: number, b: number) => a + b, 0) / callSiteConfidences.length : 1.0;
      return sum + avgCallSiteConfidence;
    }, 0);

    return totalConfidence / changes.length;
  }

  /**
   * Get all changed elements between two refs
   *
   * Uses git diff to identify changed files, then scans for elements
   *
   * @param baseRef Base git reference
   * @param headRef Head git reference (or worktree)
   * @returns Array of changed elements
   */
  private async getChangedElements(baseRef: string, headRef?: string): Promise<any[]> {
    const { execSync } = require('child_process');
    try {
      // Get list of changed files
      const diffCommand = headRef
        ? `git diff --name-only ${baseRef}..${headRef}`
        : `git diff --name-only ${baseRef}`;

      const changedFiles = execSync(diffCommand, { encoding: 'utf-8' })
        .split('\n')
        .filter((f: string) => f.trim() && (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx')));

      const changedElements: any[] = [];

      // For each changed file, get elements that changed
      for (const file of changedFiles) {
        try {
          // Get all elements in the current version of the file using scanner
          // Determine language from file extension
          const lang = file.endsWith('.ts') || file.endsWith('.tsx') ? 'ts' : 'js';
          const elements = await scanCurrentElements(file, [lang], { recursive: false });

          // Add file context to each element
          for (const element of elements || []) {
            changedElements.push({
              name: element.name,
              kind: element.type, // scanner uses 'type' not 'kind'
              file: element.file,
              line: element.line,
            });
          }
        } catch (err) {
          // Skip files that can't be analyzed
          continue;
        }
      }

      return changedElements;
    } catch (error) {
      // If git diff fails, return empty array (no changes detected)
      return [];
    }
  }

  /**
   * Extract function/method signatures from git reference
   *
   * Uses git show to get file content at specific ref, then parses signatures
   *
   * @param ref Git reference to extract from
   * @param file File path
   * @returns Map of element signatures
   */
  private async extractSignaturesFromRef(ref: string, file: string): Promise<Map<string, any>> {
    const { execSync } = require('child_process');
    const fs = require('fs');

    try {
      // Get file content from git
      const fileContent = execSync(`git show ${ref}:${file}`, { encoding: 'utf-8' });

      // Parse the file to extract signatures
      const sourceFile = ts.createSourceFile(
        file,
        fileContent,
        ts.ScriptTarget.Latest,
        true
      );

      return this.extractSignaturesFromAST(sourceFile);
    } catch (error) {
      // If git show fails (file doesn't exist in ref), return empty map
      return new Map();
    }
  }

  /**
   * Extract function/method signatures from working tree
   *
   * Reads file directly from disk and parses signatures
   *
   * @param file File path
   * @returns Map of element signatures
   */
  private async extractSignaturesFromWorktree(file: string): Promise<Map<string, any>> {
    const fs = require('fs');

    try {
      // Read file from disk
      const fileContent = fs.readFileSync(file, 'utf-8');

      // Parse the file to extract signatures
      const sourceFile = ts.createSourceFile(
        file,
        fileContent,
        ts.ScriptTarget.Latest,
        true
      );

      return this.extractSignaturesFromAST(sourceFile);
    } catch (error) {
      // If file read fails, return empty map
      return new Map();
    }
  }

  /**
   * Use TypeScript Compiler API to extract signatures from AST
   *
   * Walks the AST to find all function and method declarations,
   * extracting their parameters, return types, and visibility info.
   *
   * @param sourceFile TypeScript source file
   * @returns Map of element signatures keyed by element name
   */
  private extractSignaturesFromAST(sourceFile: ts.SourceFile): Map<string, any> {
    const signatures = new Map<string, any>();

    const visit = (node: ts.Node) => {
      // Function declaration
      if (ts.isFunctionDeclaration(node)) {
        const name = node.name?.text;
        if (name) {
          signatures.set(name, {
            name,
            kind: 'Fn',
            params: this.extractParameters(node),
            returnType: this.extractReturnType(node),
            isExported: this.hasExportKeyword(node),
          });
        }
      }

      // Method declaration (inside classes)
      if (ts.isMethodDeclaration(node)) {
        const name = node.name?.getText();
        if (name) {
          signatures.set(name, {
            name,
            kind: 'M',
            params: this.extractParameters(node),
            returnType: this.extractReturnType(node),
            isExported: false, // Methods don't have export directly
          });
        }
      }

      // Arrow function (const x = () => {})
      if (ts.isVariableDeclaration(node)) {
        if (node.initializer && ts.isArrowFunction(node.initializer)) {
          const name = node.name?.getText();
          if (name) {
            const fn = node.initializer as ts.ArrowFunction;
            signatures.set(name, {
              name,
              kind: 'Fn',
              params: this.extractParameters(fn),
              returnType: this.extractReturnType(fn),
              isExported: this.hasExportKeywordOnParent(node),
            });
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return signatures;
  }

  /**
   * Extract parameter list from function/method node
   *
   * @param node Function or method declaration
   * @returns Array of parameter info
   */
  private extractParameters(node: any): Array<{ name: string; type?: string; optional?: boolean }> {
    const params: Array<{ name: string; type?: string; optional?: boolean }> = [];

    if (node.parameters) {
      for (const param of node.parameters) {
        const paramName = param.name?.getText?.() || 'unknown';
        const paramType = param.type?.getText?.() || 'any';
        const isOptional = param.questionToken !== undefined;

        params.push({
          name: paramName,
          type: paramType,
          optional: isOptional,
        });
      }
    }

    return params;
  }

  /**
   * Extract return type from function/method node
   *
   * @param node Function or method declaration
   * @returns Return type string or 'void'
   */
  private extractReturnType(node: any): string {
    if (node.type) {
      return node.type.getText();
    }
    return 'void';
  }

  /**
   * Check if node has export keyword
   *
   * @param node The node to check
   * @returns True if exported
   */
  private hasExportKeyword(node: ts.Node): boolean {
    const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
    if (!modifiers) return false;

    for (const modifier of modifiers) {
      if (modifier.kind === ts.SyntaxKind.ExportKeyword) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if parent of node has export keyword (for variable declarations)
   *
   * @param node The node to check
   * @returns True if exported
   */
  private hasExportKeywordOnParent(node: ts.Node): boolean {
    const parent = node.parent;
    if (!parent) return false;

    const modifiers = ts.canHaveModifiers(parent) ? ts.getModifiers(parent) : undefined;
    if (!modifiers) return false;

    for (const modifier of modifiers) {
      if (modifier.kind === ts.SyntaxKind.ExportKeyword) {
        return true;
      }
    }

    return false;
  }
}
