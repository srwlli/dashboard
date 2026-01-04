# Create Resource Sheet - Agent Instruction Template

## Purpose
Generate an authoritative, refactor-safe technical documentation resource sheet for a specific feature, component, system, or codebase artifact.

## Usage
```
/create-resource-sheet [target] [scope]

Examples:
/create-resource-sheet AuthService backend
/create-resource-sheet ProjectSelector component
/create-resource-sheet coderef-workflow tool
```

## Agent Instructions

You are tasked with creating an **authoritative resource sheet** that serves as the single source of truth for understanding, maintaining, and extending the target system.

### 1. Document Header Metadata
```markdown
---
Agent: [Your Model Name/Version]
Date: [YYYY-MM-DD]
Task: [REVIEW / CONSOLIDATE / DOCUMENT]
---

# [Target Name] — Authoritative Documentation
```

### 2. Executive Summary (Required)
Write a 2-4 sentence summary covering:
- What the system is
- Primary role/responsibility
- Key architectural position
- Maintenance intent (who uses this doc and why)

### 3. Audience & Intent (Required)
Define the hierarchy of authority:
- **Markdown (this document):** Architectural truth, behavior, state
- **TypeScript/Code:** Compile-time contracts, runtime behavior
- **JSON Schemas:** Validation contracts
- **Other formats:** Specify their role

### 4. Core Documentation Sections

#### 4.1 Architecture Overview
- Role in larger system
- Component hierarchy (use code blocks or Mermaid)
- Key integration points
- Layout/structure contracts

#### 4.2 State Ownership & Source of Truth
Create a canonical table:

| State | Owner | Type | Persistence | Source of Truth |
|-------|-------|------|-------------|-----------------|
| [state name] | [component] | [UI/Domain/System] | [localStorage/none/external] | [authority] |

**Rules section:** Define precedence rules for conflicts

#### 4.3 Data Persistence (if applicable)
- Storage keys and schema
- Versioning strategy
- Failure modes & recovery
- Cross-tab/multi-client sync

#### 4.4 State Lifecycle
Document the canonical sequence:
1. Initialization
2. Hydration
3. Validation
4. Migration
5. Runtime updates
6. Persistence triggers

#### 4.5 Behaviors (Events & Side Effects)
Split into:
- **User behaviors:** Click, toggle, input events
- **System behaviors:** External updates, storage events, network responses

#### 4.6 Event & Callback Contracts
Table format:

| Event | Trigger | Payload | Side Effects |
|-------|---------|---------|--------------|
| `onEvent` | User action | `{ schema }` | What changes |

#### 4.7 Performance Considerations
- Known limits (tested thresholds)
- Bottlenecks
- Optimization opportunities
- Deferred optimizations (with rationale)

#### 4.8 Accessibility
Audit current state:
- **Current Gaps:** Issues table with severity
- **Required Tasks:** Prioritized backlog

#### 4.9 Testing Strategy
- **Must-Cover Scenarios:** Critical paths
- **Explicitly Not Tested:** Out of scope with reasoning

#### 4.10 Non-Goals / Out of Scope
Explicit list of rejected features/patterns

#### 4.11 Common Pitfalls & Sharp Edges
- Known bugs/quirks
- Integration gotchas
- Configuration mistakes
- Edge cases

#### 4.12 Diagrams (Optional)
If included, add maintenance rule:
> Diagrams are **illustrative**, not authoritative. State tables and text define truth.

### 5. Writing Guidelines

#### Voice & Tone
- **Imperative, not conversational:** "The sidebar persists state" not "We persist state"
- **Precision over politeness:** Technical accuracy trumps readability
- **No hedging:** "Must" not "should probably"
- **Active voice:** "Component manages state" not "State is managed by component"

#### Structural Rules
- **Tables over prose** for state, contracts, configurations
- **Code blocks** for sequences, hierarchies, examples
- **Callouts** for critical warnings
- **Versioning** in headers if applicable

#### Exhaustiveness Requirements
- Document **all** persisted state keys
- Document **all** failure recovery paths
- Document **all** external integration contracts
- Explicitly call out **non-goals** to prevent scope creep

#### Refactor Safety Checks
Before finalizing, verify:
- [ ] Can a new developer refactor this without breaking contracts?
- [ ] Are state ownership rules unambiguous?
- [ ] Are failure modes documented with recovery paths?
- [ ] Are non-goals explicit to prevent future scope creep?
- [ ] Do diagrams match text (or are they marked illustrative)?

### 6. Output Format

```markdown
---
Agent: [Model]
Date: [Date]
Task: [Task Type]
---

# [System Name] — Authoritative Documentation

## Executive Summary
[2-4 sentences]

## Audience & Intent
- **Markdown:** [role]
- **Code:** [role]
- **Schemas:** [role]

## 1. Architecture Overview
...

## 2. State Ownership & Source of Truth (Canonical)
...

[Continue with sections 3-12 as needed]

## Conclusion
[Final synthesis: what this doc defines, how to use it, maintenance expectations]
```

### 7. Special Cases

#### For Components
Focus on: Props, state, lifecycle, events, accessibility

#### For Services/APIs
Focus on: Contracts, error handling, state machines, integration points

#### For Tools/CLIs
Focus on: Command interface, configuration, workflows, failure modes

#### For Workflows
Focus on: State transitions, actor responsibilities, handoff points, idempotency

### 8. Maintenance Protocol

When updating the resource sheet:
1. Mark deprecated sections with `⚠️ DEPRECATED` header
2. Add migration notes for breaking changes
3. Update version number if using versioned sections
4. Archive old behavior in appendix if needed

---

## Example Invocation

```
You: /create-resource-sheet WorkflowEngine backend

Agent:
I'll analyze the WorkflowEngine backend system and create an authoritative resource sheet covering:
- State machine architecture
- Task lifecycle contracts
- Event sourcing patterns
- Error recovery mechanisms
- Integration points with orchestrator
- Performance characteristics
- Testing requirements

[Generates comprehensive markdown document following template]
```

---

## Final Checklist

Before submitting resource sheet:
- [ ] Executive summary complete
- [ ] State ownership table included
- [ ] All persistence documented
- [ ] Failure modes covered
- [ ] Non-goals explicit
- [ ] Accessibility gaps noted
- [ ] Common pitfalls listed
- [ ] Refactor-safe contracts defined
- [ ] No ambiguous "should" statements
- [ ] Tables used for structured data
- [ ] Diagrams marked illustrative (if present)

---

**Maintained by:** CodeRef Assistant (Orchestrator Persona)
**Template Version:** 1.0.0
**Created:** 2026-01-02
