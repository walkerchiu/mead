# Hero Decorative Word Breathing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make hero decorative words breathe independently instead of appearing and disappearing as one synchronized group.

**Architecture:** Keep the behavior inside `DecorativeTextCloud`. Use deterministic per-word CSS animation parameters so the effect feels random but remains stable across renders.

**Tech Stack:** Next.js, React, MUI `sx`, Vitest, Testing Library.

---

## Task 1: Decorative Word Breathing

**Files:**

- Modify: `apps/frontend/src/components/public/organisms/DecorativeTextCloud/DecorativeTextCloud.mobile.test.tsx`
- Modify: `apps/frontend/src/components/public/organisms/DecorativeTextCloud/DecorativeTextCloud.tsx`

- [ ] **Step 1: Write the failing test**

Add a Vitest case that renders three decorative words and asserts each visible word has per-word breathing parameters.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @mead/frontend test DecorativeTextCloud.mobile.test.tsx --run`

Expected: FAIL because the current implementation does not set `--word-min-opacity` / `--word-max-opacity` and `portalTwinkle` uses hard-coded opacity values.

- [ ] **Step 3: Write minimal implementation**

In `renderWord`, add deterministic per-word opacity variables and use them in `portalTwinkle`.

- [ ] **Step 4: Run focused test**

Run: `pnpm --filter @mead/frontend test DecorativeTextCloud.mobile.test.tsx --run`

Expected: PASS.

- [ ] **Step 5: Run verification checks**

Run:

```bash
pnpm --filter @mead/frontend type-check
pnpm --filter @mead/frontend lint
```

Expected: both commands complete without errors.
