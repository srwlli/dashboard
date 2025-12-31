# Deliverables - CodeRefExplorerWidget Fixes

**Workorder ID:** WO-EXPLORER-FIXES-001
**Feature:** coderef-explorer-fixes
**Status:** 🔴 Not Started
**Priority:** High
**Created:** 2025-12-31
**Assigned:** Unassigned

---

## Executive Summary

Fix three critical state management issues in CodeRefExplorerWidget:
1. **Fix #2 (CRITICAL):** Add QuotaExceededError handling to prevent crashes
2. **Fix #1 (HIGH):** Add restoration flag check to prevent wasteful writes
3. **Fix #3 (OPTIONAL):** Add cross-tab storage sync for better UX

**Current Test Status:** 36/48 comprehensive tests passing (75%)
**Target:** 48/48 tests passing (100%)

---

## Phase 1: QuotaExceededError Handling (CRITICAL)

**Status:** ⏳ Pending
**Estimated:** 1 hour

### Tasks

- [ ] **FIX2-001:** Add try-catch to favorites save effect (line 76-82)
  - Wrap `localStorage.setItem` in try block
  - Catch `QuotaExceededError` specifically
  - Log warning with context
  - Status: ⏳ Not Started

- [ ] **FIX2-002:** Add try-catch to project save effect (line 84-90)
  - Wrap `localStorage.setItem` in try block
  - Handle quota exceeded gracefully
  - Status: ⏳ Not Started

- [ ] **FIX2-003:** Verify quota exceeded tests pass (7/7)
  - Command: `npm test -- issue-2-quota-exceeded.test`
  - Current: 5/7 passing
  - Target: 7/7 passing
  - Status: ⏳ Not Started

**Phase Success Criteria:**
- ✅ All quota exceeded tests pass
- ✅ Component does not crash when localStorage is full
- ✅ Warnings logged with proper context

---

## Phase 2: Restoration Flag Fix (HIGH)

**Status:** ⏳ Pending
**Estimated:** 1 hour

### Tasks

- [ ] **FIX1-001:** Add isRestoringProject check to favorites save
  - Add condition: `if (selectedProject && !isRestoringProject)`
  - Add to dependency array
  - Status: ⏳ Not Started

- [ ] **FIX1-002:** Verify restoration flag tests pass (5/5)
  - Command: `npm test -- issue-1-restoration-flag.test`
  - Current: 4/5 passing
  - Target: 5/5 passing
  - Status: ⏳ Not Started

- [ ] **FIX1-003:** Verify comprehensive restoration tests pass
  - Command: `npm test -- CodeRefExplorerWidget.state.test`
  - Verify "should NOT save during restoration" tests pass
  - Status: ⏳ Not Started

**Phase Success Criteria:**
- ✅ Zero wasteful localStorage writes during mount
- ✅ All restoration flag tests pass
- ✅ Console logs confirm only user-triggered saves

---

## Phase 3: Cross-Tab Sync (OPTIONAL)

**Status:** ⏳ Pending
**Estimated:** 1.5 hours

### Tasks

- [ ] **FIX3-001:** Add storage event listener useEffect
  - Listen for project selection changes
  - Listen for favorites changes
  - Log changes to console
  - Status: ⏳ Not Started

- [ ] **FIX3-002:** Document sync strategy options
  - Add comments explaining conservative approach
  - Document alternative strategies
  - Status: ⏳ Not Started

- [ ] **FIX3-003:** Verify cross-tab sync tests pass (9/9)
  - Command: `npm test -- issue-3-cross-tab-sync.test`
  - Current: 7/9 passing
  - Target: 9/9 passing
  - Status: ⏳ Not Started

- [ ] **FIX3-004:** Fix test render issues
  - Use `getAllByTestId` for multiple renders
  - Status: ⏳ Not Started

**Phase Success Criteria:**
- ✅ Storage event listener registered
- ✅ Changes from other tabs logged to console
- ✅ All cross-tab sync tests pass

---

## Phase 4: Comprehensive Testing

**Status:** ⏳ Pending
**Estimated:** 0.5 hours

### Tasks

- [ ] **TEST-001:** Run all comprehensive test suites
  - Command: `npm test -- CodeRefExplorerWidget`
  - Current: 36/48 passing (75%)
  - Target: 48/48 passing (100%)
  - Status: ⏳ Not Started

- [ ] **TEST-002:** Run all focused issue test suites
  - Command: `npm test -- issue-`
  - Current: 14/21 passing (67%)
  - Target: 21/21 passing (100%)
  - Status: ⏳ Not Started

- [ ] **TEST-003:** Manual testing - quota exceeded
  - Fill localStorage to 5MB
  - Verify no crash
  - Verify graceful degradation
  - Status: ⏳ Not Started

**Phase Success Criteria:**
- ✅ All 48 comprehensive tests pass
- ✅ All 21 focused issue tests pass
- ✅ Manual testing confirms graceful behavior

---

## Files Modified

### Code Changes

- **packages/dashboard/src/widgets/coderef-explorer/CodeRefExplorerWidget.tsx**
  - Lines Modified: ~20
  - Lines Added: ~30 (if Fix #3 included)
  - Changes:
    - Added try-catch to favorites save effect
    - Added try-catch to project save effect
    - Added isRestoringProject check to favorites save
    - Added storage event listener (optional)

### Test Changes

- **packages/dashboard/src/widgets/coderef-explorer/__tests__/issue-3-cross-tab-sync.test.tsx**
  - Lines Modified: ~5
  - Changes: Fixed multiple render test issues

---

## Metrics

### Test Coverage

| Suite | Before | After | Target |
|-------|--------|-------|--------|
| State Management | 25/32 (78%) | TBD | 32/32 (100%) |
| Refresh/Reload | 11/16 (69%) | TBD | 16/16 (100%) |
| Issue #1 Tests | 4/5 (80%) | TBD | 5/5 (100%) |
| Issue #2 Tests | 5/7 (71%) | TBD | 7/7 (100%) |
| Issue #3 Tests | 7/9 (78%) | TBD | 9/9 (100%) |
| **TOTAL** | **36/48 (75%)** | **TBD** | **48/48 (100%)** |

### Performance Impact

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Component Mount Time | <100ms | TBD | <100ms (no regression) |
| localStorage Writes on Mount | 2 | TBD | 1 (50% reduction) |
| Crash on Quota Exceeded | YES | TBD | NO |

### Lines of Code

| Category | Count |
|----------|-------|
| Code Modified | ~20 lines |
| Code Added | ~30 lines |
| Tests Modified | ~5 lines |
| Total Changed | ~55 lines |

---

## Testing Results

### Unit Tests

```bash
# Run after each phase
npm test -- CodeRefExplorerWidget
npm test -- issue-1-restoration-flag.test
npm test -- issue-2-quota-exceeded.test
npm test -- issue-3-cross-tab-sync.test
```

**Results:**
- Phase 1: ⏳ Pending
- Phase 2: ⏳ Pending
- Phase 3: ⏳ Pending
- Phase 4: ⏳ Pending

### Manual Testing

**Quota Exceeded Scenario:**
- [ ] Fill localStorage to ~5MB
- [ ] Select project
- [ ] Verify: No crash
- [ ] Verify: Warning logged
- [ ] Verify: Component still functional

**Refresh Scenario:**
- [ ] Select project in fresh browser
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Verify: Project restored
- [ ] Verify: Only 1 localStorage write (not 2)

**Cross-Tab Scenario (if Fix #3):**
- [ ] Open dashboard in 2 tabs
- [ ] Change project in Tab 1
- [ ] Verify: Tab 2 console shows log message

---

## Standards Compliance

### Validated Against Codebase Standards

✅ **Error Handling:** Matches BEHAVIOR-STANDARDS.md
- Pattern: try-catch blocks
- Used in 75 other components
- Our implementation: try-catch with specific QuotaExceededError handling

✅ **Loading States:** Follows isLoading pattern
- Pattern: State variables for async operations
- Our implementation: isRestoringProject flag

✅ **UI Patterns:** Uses standard color tokens (if notifications added)
- Pattern: ind-bg, ind-accent, ind-border, ind-text
- Transition duration: 200ms

---

## Success Criteria Checklist

### Must-Have (Required for Completion)

- [ ] All quota exceeded tests pass (7/7)
- [ ] All restoration flag tests pass (5/5)
- [ ] No localStorage crashes under any condition
- [ ] Zero wasteful writes during component mount
- [ ] All 48 comprehensive tests pass
- [ ] Manual testing scenarios pass

### Nice-to-Have (Optional)

- [ ] Cross-tab sync logging works
- [ ] 95%+ test coverage maintained
- [ ] Performance targets met

---

## Risk Mitigation

### Identified Risks

1. **Breaking localStorage persistence** (LOW)
   - Mitigation: Only add error handling, no behavioral changes
   - Validation: All existing tests still pass

2. **Test timing issues** (LOW)
   - Mitigation: Use waitFor() with proper async handling
   - Validation: Tests already handle this correctly

3. **Storage event overhead** (NEGLIGIBLE)
   - Mitigation: Listener only fires on cross-tab changes (rare)
   - Validation: Performance tests show no regression

---

## Notes & Decisions

### Architectural Decisions

1. **Use try-catch vs global error boundary**
   - Decision: try-catch
   - Rationale: localStorage errors are expected edge cases, should be handled locally

2. **Conservative cross-tab sync (log only)**
   - Decision: Log changes, don't auto-sync
   - Rationale: Avoid interrupting user's work in different tabs

3. **Preserve existing restoration flag**
   - Decision: Extend usage, don't refactor
   - Rationale: Flag works correctly, just needs broader application

### Implementation Tips

- Run tests after each phase to catch regressions early
- Check console logs during manual testing
- Use DevTools → Application → Storage to simulate quota exceeded
- Test in multiple browsers for localStorage behavior differences

---

## Timeline

| Phase | Estimated | Actual | Status |
|-------|-----------|--------|--------|
| Phase 1 (Fix #2) | 1 hour | TBD | ⏳ Pending |
| Phase 2 (Fix #1) | 1 hour | TBD | ⏳ Pending |
| Phase 3 (Fix #3) | 1.5 hours | TBD | ⏳ Pending |
| Phase 4 (Testing) | 0.5 hours | TBD | ⏳ Pending |
| **TOTAL** | **4 hours** | **TBD** | ⏳ **Pending** |

---

## References

- **Standards:** coderef/standards/BEHAVIOR-STANDARDS.md
- **Plan:** coderef/workorder/coderef-explorer-fixes/plan.json
- **Tests:** packages/dashboard/src/widgets/coderef-explorer/__tests__/
- **Component:** packages/dashboard/src/widgets/coderef-explorer/CodeRefExplorerWidget.tsx

---

**Last Updated:** 2025-12-31
**Status:** 🔴 Not Started
**Next Action:** Begin Phase 1 - Add QuotaExceededError handling
