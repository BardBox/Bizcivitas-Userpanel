# BizCivitas User Panel - AI Coding Guide

## 🏗️ Architecture Overview

**Tech Stack:** Next.js 15 (App Router) + TypeScript + Redux Toolkit + RTK Query + Tailwind CSS

This is a business networking platform user panel that mimics the React Native mobile app (`bizcivitas-apk/`). The backend (`bizcivitas-backend/`) is **off-limits** - never modify MongoDB/Express backend code.

### Key Directories
- `src/app/` - Next.js 15 App Router pages (all use `"use client"`)
- `store/api/` - RTK Query endpoints split by domain (profileApi, connectionsApi, etc.)
- `store/slices/` - Redux state slices
- `types/` - Centralized TypeScript types (import from `types/index.ts`)
- `src/components/` - Reusable React components
- `src/lib/` - Utilities (Firebase lazy-loaded for notifications)

## 🚨 Critical Rules

### Backend Boundary
- **NEVER** touch `bizcivitas-backend/` - it's shared across web/mobile platforms
- Backend runs MongoDB + Express + JWT auth with HttpOnly cookies
- All performance fixes must be frontend-only
- Transform backend responses in RTK Query `transformResponse` if needed

### No Loading States
- **NEVER** create `loading.tsx` files in routes
- All pages use `"use client"` and render instantly
- Show content immediately, load data in background
- Example: Dashboard renders instantly, then RTK Query fetches data

### Performance First
```typescript
// ❌ BAD - Sequential dynamic imports block render
const Component = dynamic(() => import('./Heavy'), { loading: () => <Skeleton /> });

// ✅ GOOD - Immediate render, lazy load heavy libs only when needed
import Heavy from './Heavy'; // or load Firebase only on notification enable
```

## 📡 API Architecture (RTK Query)

### Domain-Based Structure
```typescript
// Import from central index (recommended)
import { useGetCurrentUserQuery, useSendConnectionRequestMutation } from '@/store/api';

// Or from specific domains
import { useGetCurrentUserQuery } from '@/store/api/profileApi';
import { useSendConnectionRequestMutation } from '@/store/api/connectionsApi';
```

### Base API Configuration (`store/api/baseApi.ts`)
- Aggressive caching: `keepUnusedDataFor: 600` (10 min)
- No auto-refetch on focus/reconnect/mount (use cached data)
- Auth via `localStorage.getItem('accessToken')` + HttpOnly cookies
- Base URL: `process.env.NEXT_PUBLIC_BACKEND_URL` (dev: `https://dev-backend.bizcivitas.com/api/v1`)

### API Patterns
```typescript
// ✅ Correct: Let RTK Query handle caching
const { data: user } = useGetCurrentUserQuery();

// ❌ Wrong: Manual refetch defeats caching
const [getUser] = useLazyGetCurrentUserQuery();
useEffect(() => { getUser(); }, []); // Unnecessary!
```

Tag invalidation from mutations auto-refetches affected queries. Tags: `User`, `Profile`, `Post`, `Event`, `Connections`, `Notification`, `Message`.

## 🎨 Component Patterns

### Image Handling
```typescript
// Use Next.js Image with fallbacks
<Image 
  src={user.avatar || '/favicon.ico'} 
  alt={user.name}
  width={32} height={32}
  onError={(e) => { e.currentTarget.src = '/favicon.ico'; }}
/>
```

### Firebase (Lazy Loaded)
```typescript
// Firebase SDK loads ONLY when user enables notifications
import { requestNotificationPermission } from '@/lib/firebase';
// This dynamically imports firebase/messaging (~250KB saved initially)
```

### Redux State
- Use RTK Query for server state (don't duplicate in Redux)
- Redux slices for UI state only (toasts, modals, form state)
- Memoize selectors: `store/selectors.ts` uses `createSelector`

## 🚀 Development Workflow

### Environment Setup
```powershell
# Generate Firebase config, then start dev server
npm run dev

# Backend connection (dev backend)
# .env.local must have: NEXT_PUBLIC_BACKEND_URL=https://dev-backend.bizcivitas.com/api/v1
```

### Key Scripts
- `npm run dev` - Auto-generates Firebase config + starts dev server
- `npm run build` - Production build with config generation
- `npm run firebase:config` - Generate Firebase config from env vars

### Debugging
- All pages are client-side (`"use client"`) - no SSR complexity
- Redux DevTools enabled in development
- Console logs wrapped in `if (process.env.NODE_ENV === 'development')`

## 🎯 Common Tasks

### Adding New API Endpoint
1. Create or update domain API file in `store/api/` (e.g., `eventsApi.ts`)
2. Use `baseApi.injectEndpoints({ endpoints: (builder) => ({...}) })`
3. Add tag types to `baseApi.ts` if needed
4. Export hooks from `store/api/index.ts`

### Adding New Page
1. Create `src/app/[route]/page.tsx` with `"use client"` directive
2. Use RTK Query hooks for data fetching
3. No `loading.tsx` - render immediately
4. Add to sidebar navigation if needed (`components/Dashboard/dashboard-sidebar.tsx`)

### Mimicking Mobile App Feature
1. Reference `bizcivitas-apk/src/screens/` for UI patterns
2. Check `bizcivitas-apk/src/services/` for API calls
3. Match mobile app's user flow and interactions
4. Use same API endpoints (backend is shared)

## 🔧 Performance Checklist

- [ ] No dynamic imports blocking render
- [ ] Firebase lazy-loaded (not in main bundle)
- [ ] Images use Next.js `<Image>` with `remotePatterns`
- [ ] RTK Query caching used (no manual refetch unless needed)
- [ ] Components memoized with `React.memo` if re-rendering often
- [ ] Heavy libraries dynamically imported when needed
- [ ] No polling intervals (use Firebase/Socket.io for real-time)

## 📚 Reference Files

- **API patterns:** `store/api/profileApi.ts`, `store/api/connectionsApi.ts`
- **Component examples:** `src/components/Dashboard/BizPulseCard.tsx`
- **Type definitions:** `types/user.types.ts`, `types/connection.types.ts`
- **Performance docs:** `PERFORMANCE_OPTIMIZATIONS.md`, `CLAUDE.md`
- **Mobile app reference:** `bizcivitas-apk/src/screens/` (for feature parity)
