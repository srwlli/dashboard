# WO-UNIFIED-ACTION-MODAL-001: Unified Action Modal

**Feature:** Unified Action Modal
**Status:** Planning Complete - Ready for Implementation
**Created:** 2026-01-23
**Estimated Effort:** 6-8 hours
**Difficulty:** Medium (6/10)

---

## 🎯 Overview

Replace right-click context menu with modal that hosts ALL actions (Copy Path, Share, Add to Target, etc.) for 100% consistent UX across all entity types.

### Current Flow
```
Right-click → Context Menu → Click "Add to Target" → Modal
```

### New Flow
```
Right-click → Modal opens with ALL options
  ├─ Copy Path (immediate, closes modal)
  ├─ Copy Content (immediate, closes modal)
  ├─ Share (immediate, closes modal)
  ├─ Add to Favorites (immediate, closes modal)
  └─ Add to Target → Multi-step flow (existing)
```

---

## 📋 Requirements

### Functional
- Add "Main Menu" step to UniversalEntityActionModal
- Support immediate actions (Copy Path, Share) that execute and close
- Support flow actions (Add to Target) that transition to multi-step
- Update StubCard, WorkorderCard, FileTreeNode to use modal
- Add back button navigation
- Maintain toast notifications

### Non-Functional
- Mobile-friendly click-based interaction
- Keyboard navigation support (1-9 hotkeys optional)
- TypeScript type safety maintained
- No breaking changes to existing flows
- Performance: modal opens < 100ms

---

## 🏗️ Architecture

### Components Modified

**1. UniversalEntityActionModal** (637 lines)
- Add `ActionMenuItem` interface
- Add `'main_menu'` to ModalStep type
- Add `actionMenuItems` and `skipMainMenu` props
- Implement main menu rendering
- Add back button to Step 2

**2. StubCard** (213 lines)
- Remove ContextMenu usage
- Define `actionMenuItems` array (4 actions)
- Update right-click to open modal

**3. WorkorderCard** (200 lines)
- Same changes as StubCard

**4. FileTreeNode**
- File-specific actionMenuItems
- Update context menu handling

### New Interface

```typescript
interface ActionMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  type: 'immediate' | 'flow';
  onClick?: () => void | Promise<void>;
  iconClassName?: string;
}
```

---

## 📊 Implementation Plan

### Phase 1: SETUP (1 hour)
- [ ] SETUP-001: Review UniversalEntityActionModal implementation (0.5h)
- [ ] SETUP-002: Inventory all menu actions (0.5h)

### Phase 2: IMPL (5-6 hours)
- [ ] IMPL-001: Add ActionMenuItem interface (0.5h)
- [ ] IMPL-002: Add main menu step to modal state (0.5h)
- [ ] IMPL-003: Implement main menu rendering (1.5h)
- [ ] IMPL-004: Add back button navigation (0.5h)
- [ ] IMPL-005: Update StubCard to use modal (1h)
- [ ] IMPL-006: Update WorkorderCard to use modal (1h)
- [ ] IMPL-007: Update FileTreeNode to use modal (1.5h)
- [ ] IMPL-008: Add keyboard navigation [OPTIONAL] (1h)

### Phase 3: TEST (2 hours)
- [ ] TEST-001: Test StubCard modal flow (0.5h)
- [ ] TEST-002: Test WorkorderCard modal flow (0.5h)
- [ ] TEST-003: Test FileTreeNode modal flow (0.5h)
- [ ] TEST-004: Test back button navigation (0.25h)
- [ ] TEST-005: Test mobile responsiveness (0.5h)
- [ ] TEST-006: Test keyboard navigation [OPTIONAL] (0.25h)

### Phase 4: DOC (1.25 hours)
- [ ] DOC-001: Update coderef-dashboard-patterns skill (0.5h)
- [ ] DOC-002: Create workorder README (0.5h)
- [ ] DOC-003: Update CLAUDE.md (0.25h)

**Total:** 17 tasks (16 required + 2 optional)

---

## ✅ Success Criteria

### Must Have
- ✅ All components use modal instead of ContextMenu
- ✅ Main menu displays all available actions
- ✅ Immediate actions work with toast feedback
- ✅ Flow actions work (Add to Target multi-step)
- ✅ Back button navigation works
- ✅ Mobile responsive (320px+ screens)
- ✅ No TypeScript errors
- ✅ No breaking changes

### Nice to Have
- Keyboard shortcuts (1-9) implemented
- Smooth animations
- Action success states (checkmarks)
- Performance < 100ms modal open

---

## 🎨 UI Mockup

```
┌─────────────────────────────────┐
│ What would you like to do?      │
├─────────────────────────────────┤
│ 📁 Copy Path                    │
│ 📄 Copy Content                 │
│ 🔗 Share                        │
│ ⭐ Add to Favorites             │
│ 🎯 Add to Target...          → │
└─────────────────────────────────┘
```

---

## 🚨 Risks & Mitigation

| Risk | Severity | Mitigation |
|------|----------|------------|
| User expects context menu at cursor | Medium | Position modal near cursor or use consistent center |
| Immediate actions need visual feedback | Low | Brief 200ms delay showing success before close |
| Timeline may expand with edge cases | Low | Timebox tasks, defer nice-to-haves if needed |

---

## 🔄 Rollback Plan

If issues arise:
1. Restore ContextMenu imports in components
2. Revert UniversalEntityActionModal changes
3. Test original context menu flow
4. Document issues for future attempt

**Estimated Rollback Time:** 1 hour

---

## 📁 Files

**Created:**
- `context.json` - Requirements and constraints
- `analysis.json` - Project analysis
- `plan.json` - Detailed implementation plan
- `README.md` - This file

**To Be Modified:**
- `UniversalEntityActionModal.tsx`
- `StubCard/index.tsx`
- `WorkorderCard/index.tsx`
- `FileTreeNode.tsx`
- `.skills/coderef-dashboard-patterns.md`
- `CLAUDE.md`

---

## 🚀 Next Steps

1. Review the plan.json for detailed task breakdown
2. Start with SETUP phase (1 hour)
3. Implement IMPL phase incrementally (5-6 hours)
4. Test thoroughly on TEST phase (2 hours)
5. Document in DOC phase (1.25 hours)

**Ready to begin implementation!**

---

**Generated:** 2026-01-23
**Workorder ID:** WO-UNIFIED-ACTION-MODAL-001
**Maintained By:** CodeRef Team
