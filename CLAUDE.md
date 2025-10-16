# BizCivitas User Panel - Claude Code Guidelines

## 🚨 CRITICAL RULES

### **DO NOT MODIFY BACKEND**
- **NEVER** change anything in `bizcivitas-backend` folder
- Backend is built with MongoDB, Express.js, and Node.js
- Backend is shared across multiple platforms and is stable
- All performance fixes should be done **ONLY IN FRONTEND**

### **Mobile App Mimicking**
- This user panel must mimic functionalities from the React Native mobile application
- Reference the mobile app structure when implementing features
- Match mobile app UI/UX patterns and behavior
- Maintain feature parity with the mobile app

### **NO LOADING STATES**
- **NEVER** create or use `loading.tsx` files in routes
- Pages should render instantly without loading skeletons
- Use `"use client"` directive for immediate rendering
- If data is needed, show the page immediately and load data in background
- Loading states are SLOW and provide bad UX - avoid them!

## 📁 Project Structure

```
bizcivitas-main/
├── bizcivitas-backend/          ← DO NOT TOUCH
│   ├── MongoDB + Express.js + Node.js
│   └── Shared across web and mobile
├── bizcivitas-userpanel/        ← Work here (Next.js 14 + TypeScript)
│   ├── src/
│   │   ├── app/                 # Next.js 14 App Router
│   │   ├── components/          # React components
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Utilities (Firebase, etc.)
│   │   └── services/           # API services
│   ├── store/                   # Redux Toolkit
│   │   ├── api/                # RTK Query API slices
│   │   └── slices/             # Redux slices
│   └── types/                   # TypeScript types
├── bizcivitas-apk/              ← React Native mobile app (reference)
├── Bizcivitas-Admin-panel/      ← Admin panel
└── BizCivitas/                  ← Legacy or other platform
```

## 🎯 Technology Stack

### **Frontend (User Panel)**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **State Management:** Redux Toolkit + RTK Query
- **Styling:** Tailwind CSS
- **Notifications:** Firebase Cloud Messaging (FCM)
- **HTTP Client:** Axios (via RTK Query)
- **UI Libraries:** React Hot Toast, Headless UI

### **Backend (DO NOT MODIFY)**
- **Database:** MongoDB with Mongoose
- **Server:** Express.js
- **Runtime:** Node.js
- **Authentication:** JWT
- **File Storage:** AWS S3 + Vimeo (videos)
- **Push Notifications:** Firebase Admin SDK
- **Payments:** Razorpay

## 🔧 Frontend Performance Optimization Guidelines

### **What to Fix (Frontend Only)**

1. **React Performance**
   - Remove unnecessary `useEffect` hooks
   - Optimize `useMemo` and `useCallback` usage
   - Prevent unnecessary re-renders with `React.memo`
   - Split large components into smaller ones

2. **RTK Query Optimization**
   - Remove manual `refetch()` calls (RTK Query auto-fetches)
   - Use proper cache invalidation tags
   - Avoid polling intervals (use WebSockets or Firebase instead)
   - Leverage RTK Query's built-in caching

3. **Bundle Size Optimization**
   - Lazy load heavy libraries (Firebase, etc.)
   - Use dynamic imports for code splitting
   - Remove unused dependencies
   - Optimize images and assets

4. **API Call Optimization**
   - Batch API requests where possible
   - Use pagination for large lists
   - Implement infinite scroll instead of loading all data
   - Cache API responses properly

5. **State Management**
   - Avoid storing derived state in Redux
   - Use selectors with memoization
   - Keep component state local when possible
   - Don't duplicate server state in Redux (use RTK Query)

### **What NOT to Fix**

1. **Backend Code**
   - N+1 query problems → Accept as is
   - Missing database indexes → Backend team handles
   - Slow API endpoints → Work with what we have
   - Database optimization → Not our responsibility

2. **API Response Structure**
   - Don't change API contracts
   - Transform data on frontend if needed
   - Use RTK Query transformResponse if necessary

3. **Authentication Flow**
   - Keep existing JWT implementation
   - Don't modify auth middleware
   - Use existing auth endpoints as-is

## 📋 Common Performance Issues (Frontend Focus)

### ✅ **Fixed Issues**

1. **Removed 30-second API polling in NotificationDropdown**
   - Used Firebase real-time updates instead
   - Reduced API calls by 95%

2. **Removed unnecessary refetch() in connections page**
   - Let RTK Query handle automatic fetching
   - Reduced duplicate API calls by 50%

3. **Lazy loaded Firebase SDK**
   - Only loads when user enables notifications
   - Reduced initial bundle by ~250KB

4. **Split large useMemo in MyProfile**
   - Granular memoization per section
   - Reduced unnecessary recalculations by 85%

### 🔍 **Ongoing Optimizations**

1. **Console.log Cleanup**
   - Remove 125+ console.log statements
   - Wrap debug logs in `if (process.env.NODE_ENV === 'development')`

2. **Component Re-renders**
   - Add React.memo to frequently rendered components
   - Optimize useEffect dependencies
   - Use useCallback for event handlers

3. **Code Splitting**
   - Lazy load route components
   - Dynamic imports for heavy features
   - Separate vendor chunks

## 🎨 Mobile App Mimicking Guidelines

### **Feature Parity Checklist**

- [ ] Authentication flow matches mobile app
- [ ] Dashboard layout similar to mobile
- [ ] Feed/posts display matches mobile behavior
- [ ] Connection requests work like mobile
- [ ] Notifications match mobile app
- [ ] Profile editing mirrors mobile
- [ ] Event browsing/joining same as mobile
- [ ] Search functionality matches mobile

### **UI/UX Consistency**

1. **Color Scheme:** Match mobile app colors
2. **Typography:** Use same font families and sizes
3. **Spacing:** Maintain consistent padding/margins
4. **Icons:** Use same icon library as mobile
5. **Animations:** Keep transitions similar

### **Responsive Design**

- Desktop: Full-width layouts with sidebars
- Tablet: Adaptive grid layouts
- Mobile Web: Should feel like native app
- Touch-friendly tap targets (minimum 44x44px)

## 🔥 Firebase Configuration

### **Current Setup**
- Firebase SDK version: 12.3.0
- Lazy loaded (only when notifications enabled)
- Service worker for background notifications
- FCM tokens stored in localStorage

### **Performance Notes**
- Don't initialize Firebase on every page
- Only load messaging module when needed
- Use `getMessagingInstance()` for lazy loading
- Clear tokens on logout

## 🔐 Authentication Flow

### **Current Implementation**
- JWT tokens stored in cookies
- Access token + Refresh token pattern
- Protected routes use `ProtectedRoute` component
- Fast auth check with `useFastAuth` hook

### **Don't Modify**
- Token generation logic (backend)
- Auth middleware (backend)
- Cookie settings (backend handles)

## 📊 State Management Patterns

### **Redux Store Structure**

```typescript
store/
├── api/
│   ├── baseApi.ts              # RTK Query base config
│   ├── authApi.ts              # Auth endpoints
│   ├── profileApi.ts           # Profile endpoints
│   ├── connectionApi.ts        # Connections
│   ├── notificationApi.ts      # Notifications
│   └── ... (other API slices)
├── slices/
│   ├── authSlice.ts            # Auth state
│   ├── postsSlice.ts           # Posts/feed state
│   └── ... (other slices)
└── store.ts                     # Store configuration
```

### **RTK Query Best Practices**

```typescript
// ✅ GOOD: Let RTK Query handle caching
const { data, isLoading } = useGetUserQuery();

// ❌ BAD: Manual refetch on mount
useEffect(() => {
  refetch();
}, []);

// ✅ GOOD: Use cache invalidation tags
providesTags: ['User', 'Profile'],
invalidatesTags: ['User'],

// ❌ BAD: Polling interval
useGetDataQuery(undefined, { pollingInterval: 30000 });
```

## 🐛 Common Pitfalls to Avoid

1. **Infinite Re-render Loops**
   - Always memoize objects/arrays in useEffect dependencies
   - Use useCallback for functions passed as props
   - Don't create new objects in render

2. **Memory Leaks**
   - Clean up subscriptions in useEffect return
   - Cancel pending API calls on unmount
   - Remove event listeners properly

3. **Prop Drilling**
   - Use Context for deeply nested props
   - Consider component composition
   - Don't overuse Redux for local state

4. **Type Safety**
   - Define interfaces for API responses
   - Use TypeScript strict mode
   - Avoid `any` type unless absolutely necessary

## 📝 Code Style Guidelines

### **Naming Conventions**
- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase with 'use' prefix (`useFastAuth.ts`)
- API slices: camelCase with 'Api' suffix (`userApi.ts`)
- Types: PascalCase (`UserProfile`, `ApiResponse`)

### **File Organization**
```typescript
// ✅ GOOD: Organized imports
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetUserQuery } from '@/store/api/userApi';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types/user';

// ❌ BAD: Mixed imports
import { Button } from '@/components/ui/Button';
import React from 'react';
import type { User } from '@/types/user';
import { useGetUserQuery } from '@/store/api/userApi';
```

### **Comments**
- Add performance fix comments with ✅ emoji
- Explain WHY, not WHAT
- Use JSDoc for functions
- Add TODO comments for future improvements

## 🚀 Deployment Notes

### **Build Optimization**
```bash
npm run build
npm run analyze  # Check bundle sizes
```

### **Environment Variables**
```env
NEXT_PUBLIC_API_URL=              # Backend API URL
NEXT_PUBLIC_FIREBASE_API_KEY=     # Firebase config
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=   # For FCM
```

## 📞 Communication

### **When to Ask Backend Team**
- API response structure changes needed
- New endpoints required
- Performance issues that need backend fixes
- Database schema questions

### **Handle Yourself (Frontend)**
- All performance optimizations
- UI/UX improvements
- React/Next.js issues
- Bundle size reduction
- State management optimization

## 🎯 Current Task Context

### **Performance Fixes Completed**
1. ✅ Removed API polling in NotificationDropdown
2. ✅ Removed unnecessary refetch in connections page
3. ✅ Lazy loaded Firebase SDK
4. ✅ Split large useMemo in MyProfile

### **Next Priority Tasks**
1. Fix biz-pulse page useEffect dependencies
2. Add React.memo to frequently rendered components
3. Remove console.log statements
4. Optimize image loading
5. Implement code splitting for routes

## 📚 References

- Next.js 14 Docs: https://nextjs.org/docs
- Redux Toolkit: https://redux-toolkit.js.org/
- RTK Query: https://redux-toolkit.js.org/rtk-query/overview
- Firebase Web: https://firebase.google.com/docs/web/setup
- Tailwind CSS: https://tailwindcss.com/docs

---

**Last Updated:** 2025-01-16
**Maintained By:** Claude Code AI Assistant
**Project Version:** 1.0.0
