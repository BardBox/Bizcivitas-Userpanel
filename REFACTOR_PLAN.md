# Production Refactor Plan

This plan outlines the step-by-step process to elevate the BizCivitas User Panel to production standards, focusing on Architecture, UX, and Performance.

**Constraint:** Maintain current `localStorage` based authentication (keep login as is).

## Phase 1: User Experience (The "Premium Feel")
- [x] **Task 1.1: Create Skeleton Components**
    - Create `PostSkeleton` (for feeds)
    - Create `ProfileSkeleton` (for sidebar/profile pages)
    - Create `CardSkeleton` (for grid items like events/connections)
- [x] **Task 1.2: Implement Skeletons in Main Feeds**
    - Replace full-page spinners in `src/app/feeds/page.tsx` with `PostSkeleton`.
    - Replace spinners in `BizPulseDetailPage`.

## Phase 2: Architecture (Unified Data Layer)
- [x] **Task 2.1: Setup RTK Query for BizPulse**
    - Create/Update `src/store/api/bizpulseApi.ts` (RTK Query definition).
    - Define endpoints: `getDailyFeeds`, `getWallFeeds`, `likePost`.
- [ ] **Task 2.2: Migrate Dashboard Page**
    - Refactor `src/app/feeds/page.tsx` to use `useGetDailyFeedsQuery` instead of `useEffect` + `bizpulseApi` direct calls.
    - Remove manual loading states (`isLoading`, `posts` state) and use the hook's `data` and `isLoading`.
- [ ] **Task 2.3: Migrate Post Detail Page**
    - Refactor `src/app/feeds/biz-pulse/[id]/page.tsx` to use `useGetPostQuery`.
- [ ] **Task 2.4: Implement Optimistic Updates**
    - Use `onQueryStarted` in RTK Query for the "Like" mutation to update the UI instantly before the server responds.

## Phase 3: Code Quality & Performance
- [ ] **Task 3.1: Strict TypeScript Interfaces**
    - Audit `src/types` and ensure no `any` is used for Post or User objects.
    - Unify `WallFeedPost` and `BizHubPost` interfaces where possible.
- [ ] **Task 3.2: Image Optimization**
    - Audit `Avatar` component to ensure it uses `next/image` correctly.
    - Ensure all feed images use `next/image` with proper sizing.
- [ ] **Task 3.3: Code Splitting (Dynamic Imports)**
    - Identify heavy components (e.g., Rich Text Editors, complex Modals) and implement `next/dynamic` imports.

## Phase 4: Reliability & Safety
- [ ] **Task 4.1: Global Error Boundary**
    - Create `components/ErrorBoundary.tsx`.
    - Wrap the main feed layout in it to catch crashes gracefully.
- [ ] **Task 4.2: Unit & Component Testing (Future)**
    - Setup Vitest/Jest.
    - Write tests for `PostCard` and `auth` logic.
