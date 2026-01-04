# Scroll Wheel Debug Tests - Full Page File Viewer

**Date:** 2026-01-02
**Issue:** Persistent scroll wheel appearing in full-page file viewer
**Component:** `/viewer/full` route with FileViewer component

---

## Test Cases

### Test 1: HTML/Body Overflow Check
**What to test:** Browser DevTools → Elements → Inspect `<html>` and `<body>` tags
**Expected:** `overflow: hidden` on body
**Actual:**
- [ ] body has overflow: hidden
- [ ] html has no overflow styles causing scroll

**Fix if failing:**
```tsx
// Add to page.tsx or layout.tsx
useEffect(() => {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  return () => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  };
}, []);
```

---

### Test 2: FileViewer Container Height
**What to test:** DevTools → Inspect FileViewer root div (`<div className="flex flex-col h-full h-screen">`)
**Expected:** Computed height = 100vh exactly
**Actual:**
- [ ] Computed height: ___px
- [ ] 100vh = ___px
- [ ] Match: YES / NO

**Check:**
- Is there padding/margin pushing it beyond viewport?
- Is `h-screen` being overridden?
- Does `h-full` conflict with `h-screen`?

**Fix if failing:**
```tsx
// Remove h-full from FileViewer root, keep only h-screen
<div className="flex flex-col h-screen">
```

---

### Test 3: Content Area Overflow
**What to test:** DevTools → Inspect content div (line 359: `<div className="flex-1 overflow-y-auto p-4 bg-ind-bg min-h-0">`)
**Expected:** This div scrolls internally, not the page
**Actual:**
- [ ] Scrollbar appears inside this div
- [ ] Scrollbar appears on page body
- [ ] Content height: ___px
- [ ] Container height: ___px

**Check:**
- Is `flex-1` properly constraining height?
- Is `min-h-0` working to prevent flex item overflow?
- Does padding affect total height calculation?

**Fix if failing:**
```tsx
// Try max-h-0 instead of min-h-0, or remove padding from height calculation
<div className="flex-1 overflow-y-auto bg-ind-bg max-h-0">
  <div className="p-4">
    {/* content */}
  </div>
</div>
```

---

### Test 4: Header Height Impact
**What to test:** DevTools → Measure header height
**Expected:** Header has fixed height, doesn't grow
**Actual:**
- [ ] Header height: ___px
- [ ] Has flex-shrink-0: YES / NO
- [ ] Content area calc: `100vh - header height`

**Check:**
- Does header wrap or expand beyond expected height?
- Are button labels causing extra height?

**Fix if failing:**
```tsx
// Add explicit max-height to header
<div className="flex items-center justify-between p-3 border-b border-ind-border bg-ind-panel/50 flex-shrink-0 max-h-20">
```

---

### Test 5: Next.js Layout Wrapper
**What to test:** DevTools → Check if layout.tsx adds wrapper divs
**Expected:** No extra divs between body and FileViewer
**Actual:**
- [ ] Extra wrapper divs found: ___
- [ ] Any with min-h-screen or height styles: YES / NO

**Check:**
```tsx
// Look for these in layout.tsx or root layout
<body>
  <div className="min-h-screen"> {/* THIS COULD CAUSE SCROLL */}
    <FileViewer className="h-screen" />
  </div>
</body>
```

**Fix if failing:**
Remove any wrapper divs with height constraints in `/viewer/full/layout.tsx`

---

### Test 6: Viewport Units Calculation
**What to test:** Console → Check actual viewport height
```javascript
console.log('window.innerHeight:', window.innerHeight);
console.log('100vh in px:', getComputedStyle(document.documentElement).getPropertyValue('--vh'));
console.log('Body scrollHeight:', document.body.scrollHeight);
console.log('Body clientHeight:', document.body.clientHeight);
```

**Expected:**
- scrollHeight === clientHeight (no scroll needed)

**Actual:**
- [ ] scrollHeight: ___px
- [ ] clientHeight: ___px
- [ ] Difference: ___px (THIS IS THE SCROLL AMOUNT)

**Fix if failing:**
If scrollHeight > clientHeight, something is adding extra height. Inspect elements to find what.

---

### Test 7: Computed Styles Audit
**What to test:** DevTools → Computed tab for each element
**Check these elements:**

1. **body**
   - [ ] overflow: hidden
   - [ ] height: ___
   - [ ] max-height: ___

2. **FileViewer root div**
   - [ ] height: ___
   - [ ] max-height: ___
   - [ ] overflow: ___

3. **Content div**
   - [ ] flex-basis: ___
   - [ ] height: ___
   - [ ] overflow-y: auto
   - [ ] min-height: 0

---

### Test 8: Browser Zoom Level
**What to test:** Browser zoom setting
**Expected:** 100% zoom
**Actual:**
- [ ] Zoom level: ___%
- [ ] Does changing zoom fix scroll? YES / NO

**Note:** Non-100% zoom can cause subpixel rendering issues with vh units

---

### Test 9: Different Content Types
**What to test:** Open different file types in full-page viewer
**Test with:**
- [ ] Small markdown file (< 1 screen)
- [ ] Large markdown file (> 5 screens)
- [ ] JSON file
- [ ] TypeScript file with syntax highlighting

**Expected:** Scroll appears ONLY inside content area, never on body

**Actual for each file type:**
- Small MD: Body scroll: YES / NO | Content scroll: YES / NO
- Large MD: Body scroll: YES / NO | Content scroll: YES / NO
- JSON: Body scroll: YES / NO | Content scroll: YES / NO
- TS: Body scroll: YES / NO | Content scroll: YES / NO

---

### Test 10: CSS Cascade Inspection
**What to test:** DevTools → Styles tab → Check for conflicting styles
**Look for:**
- [ ] Global CSS adding body min-height
- [ ] Tailwind prose class adding margins
- [ ] SyntaxHighlighter custom styles affecting height
- [ ] ReactMarkdown container styles

**Check these files:**
- `globals.css`
- `tailwind.config.ts`
- Any CSS modules imported in FileViewer

---

## Diagnostic Commands

Run these in browser DevTools console:

```javascript
// 1. Find all elements with overflow styles
document.querySelectorAll('*').forEach(el => {
  const overflow = window.getComputedStyle(el).overflow;
  if (overflow !== 'visible') {
    console.log(el, 'overflow:', overflow);
  }
});

// 2. Find all elements taller than viewport
const vh = window.innerHeight;
document.querySelectorAll('*').forEach(el => {
  const height = el.getBoundingClientRect().height;
  if (height > vh) {
    console.log(el, 'height:', height, 'exceeds viewport:', vh);
  }
});

// 3. Check FileViewer specific
const fileViewer = document.querySelector('[class*="h-screen"]');
if (fileViewer) {
  console.log('FileViewer computed height:', window.getComputedStyle(fileViewer).height);
  console.log('FileViewer scrollHeight:', fileViewer.scrollHeight);
  console.log('FileViewer clientHeight:', fileViewer.clientHeight);
}

// 4. Check body scroll
console.log('Body overflow:', window.getComputedStyle(document.body).overflow);
console.log('Body scrollHeight:', document.body.scrollHeight);
console.log('Body clientHeight:', document.body.clientHeight);
console.log('Scroll needed?', document.body.scrollHeight > document.body.clientHeight);
```

---

## Common Root Causes

### Cause 1: Flexbox Height Calculation
**Symptom:** flex-1 child grows beyond container
**Fix:**
```tsx
// Parent must have explicit height
<div className="flex flex-col h-screen">
  {/* Child needs min-h-0 to allow shrinking */}
  <div className="flex-1 overflow-auto min-h-0">
```

### Cause 2: Padding in Height Calculation
**Symptom:** Padding adds to 100vh making it > viewport
**Fix:**
```tsx
// Use box-sizing: border-box or move padding inside
<div className="flex-1 overflow-auto">
  <div className="p-4">
    {/* content with padding */}
  </div>
</div>
```

### Cause 3: Multiple Height Constraints
**Symptom:** Both h-full and h-screen applied
**Fix:**
```tsx
// Choose ONE height strategy
<div className="h-screen"> {/* NOT h-full h-screen */}
```

### Cause 4: Global Body Styles
**Symptom:** CSS elsewhere sets body min-height: 100vh
**Fix:**
```css
/* In globals.css or via useEffect */
body {
  overflow: hidden;
  height: 100vh;
  max-height: 100vh;
}
```

### Cause 5: Browser Chrome (Address Bar)
**Symptom:** Mobile browsers with dynamic address bars
**Fix:**
```tsx
// Use dynamic vh units
useEffect(() => {
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  setVh();
  window.addEventListener('resize', setVh);
  return () => window.removeEventListener('resize', setVh);
}, []);

// Then use calc(var(--vh, 1vh) * 100) instead of 100vh
```

---

## Test Results Summary

**Date:** ___________
**Browser:** ___________
**Screen Resolution:** ___________

**Failed Tests:**
1.
2.
3.

**Root Cause Identified:**


**Fix Applied:**


**Verification:**
- [ ] No scroll wheel on body
- [ ] Content scrolls inside FileViewer only
- [ ] Works with small files
- [ ] Works with large files
- [ ] Escape key closes viewer
- [ ] X button closes viewer
- [ ] All tests pass

---

## Next Steps

1. Run all 10 test cases above
2. Fill in actual values
3. Identify which test(s) fail
4. Apply corresponding fix
5. Re-test to verify
6. Document final solution in CLAUDE.md
