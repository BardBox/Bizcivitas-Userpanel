# API Restructuring Migration Guide

## 📋 Overview

The `userApi.ts` has been split into domain-specific API files for better organization, maintainability, and scalability.

## 🗂️ New Structure

```
store/api/
├── baseApi.ts              # Base RTK Query API (unchanged)
├── profileApi.ts           # ✨ NEW - User & Profile operations
├── connectionsApi.ts       # ✨ NEW - Connection management
├── index.ts                # ✨ NEW - Central export point
└── userApi.ts              # ⚠️ DEPRECATED - Will be removed
```

## ✅ What Changed?

### Before (Old Way)

```typescript
import {
  useGetCurrentUserQuery,
  useGetFullProfileQuery,
  useUpdateProfileMutation,
  useGetConnectionsQuery,
  useGetConnectionProfileQuery,
  useSendConnectionRequestMutation,
  useAcceptConnectionRequestMutation,
  useDeleteConnectionMutation,
} from "@/store/api/userApi";
```

### After (New Way - Recommended)

```typescript
// Import from central index - cleanest approach
import {
  useGetCurrentUserQuery,
  useGetFullProfileQuery,
  useUpdateProfileMutation,
  useGetConnectionsQuery,
  useGetConnectionProfileQuery,
  useSendConnectionRequestMutation,
  useAcceptConnectionRequestMutation,
  useDeleteConnectionMutation,
} from "@/store/api";
```

### Alternative (Import from specific domain)

```typescript
// Profile-specific imports
import {
  useGetCurrentUserQuery,
  useGetFullProfileQuery,
  useUpdateProfileMutation,
} from "@/store/api/profileApi";

// Connection-specific imports
import {
  useGetConnectionsQuery,
  useGetConnectionProfileQuery,
  useSendConnectionRequestMutation,
} from "@/store/api/connectionsApi";
```

## 📦 API Distribution

### Profile API (`profileApi.ts`)

**User & Profile Queries:**

- `useGetCurrentUserQuery` - Get current logged-in user
- `useGetFullProfileQuery` - Get full user profile

**Profile Update Mutations:**

- `useUpdateProfileMutation` - Update user profile
- `useUpdateProfessionDetailsMutation` - Update professional details
- `useUpdatePersonalDetailsMutation` - Update personal details

**Bio & Skills Mutations:**

- `useUpdateMyBioMutation` - Update user biography
- `useUpdateMySkillsMutation` - Update user skills
- `useEndorseSkillMutation` - Endorse another user's skill

**Additional Details Mutations:**

- `useUpdateTravelDiaryMutation` - Update travel diary
- `useUpdateContactDetailsMutation` - Update contact details
- `useUpdateAddressDetailsMutation` - Update address details

**Auth:**

- `useLogoutMutation` - Logout user

**Utilities:**

- `getUserFullName(user)` - Helper to get full name

---

### Connections API (`connectionsApi.ts`)

**Connection Queries:**

- `useGetConnectionsQuery` - Get user's connections list
- `useGetConnectionProfileQuery` - Get specific user's profile
- `useGetConnectionRequestsQuery` - Get pending connection requests
- `useGetSuggestionsAllQuery` - Get connection suggestions

**Connection Mutations:**

- `useSendConnectionRequestMutation` - Send connection request
- `useAcceptConnectionRequestMutation` - Accept connection request
- `useDeleteConnectionMutation` - Delete/withdraw connection

---

## 🔄 Migration Steps

### Step 1: Update Imports

**Find and Replace:**

1. Find: `from '@/store/api/userApi'`
   Replace: `from '@/store/api'`

2. Find: `from '../../store/api/userApi'`
   Replace: `from '@/store/api'`

3. Find: `from '../../../store/api/userApi'`
   Replace: `from '@/store/api'`

### Step 2: Update Type Imports

**Before:**

```typescript
import { User, FullProfile } from "@/store/api/userApi";
```

**After:**

```typescript
import { User, FullProfile } from "@/store/api";
// OR
import { User, FullProfile } from "@/types";
```

### Step 3: Test Your Application

Run the development server and verify all API calls work:

```powershell
npm run dev
```

---

## 🎯 Benefits of New Structure

| Benefit                      | Description                                       |
| ---------------------------- | ------------------------------------------------- |
| **Better Organization**      | Each domain has its own file                      |
| **Easier Navigation**        | Find endpoints faster                             |
| **Smaller Bundles**          | Import only what you need (tree-shaking)          |
| **Parallel Development**     | Multiple devs work on different files             |
| **Scalability**              | Easy to add new domains (feeds, messages, events) |
| **Clearer Cache Management** | Cache tags organized by domain                    |
| **Better Testing**           | Test each domain independently                    |

---

## 📊 Migration Status

### ✅ Completed (27 files updated)

All imports have been automatically updated to use the new structure:

**Component Files:**

- `src/app/feeds/connections/[slug]/connections/client.tsx`
- `src/app/feeds/connections/[slug]/client.tsx`
- `src/app/feeds/connections/page.tsx`
- `src/app/feeds/connections/requests/page.tsx`
- `src/app/feeds/connections/[slug]/connections/requests/page.tsx`
- `src/app/feeds/myprofile/client.tsx`
- `src/app/feeds/debug/page.tsx`
- `src/components/Dashboard/Connections/AllMembers.tsx`
- `src/components/Dashboard/Connections/ConnectionCard.tsx`
- `src/components/Dashboard/DashboardHeader.tsx`
- `src/components/Dashboard/ProfileSection.tsx`
- `src/components/Dashboard/MyProfile/PersonalDetails/PersonalDetails.tsx`
- `src/components/Dashboard/MyProfile/BusinessDetails.tsx`
- `src/components/Dashboard/MyProfile/WeeklyPresentation.tsx`
- `src/components/Dashboard/MyProfile/TravelDiary.tsx`
- `src/components/Dashboard/MyProfile/MyBioSection.tsx`
- `src/components/Dashboard/MyProfile/BizNeeds/BizNeeds.tsx`
- `src/components/Dashboard/MyProfile/Bizleads/Bizleads.tsx`
- `src/components/Dashboard/MyProfile/ProfilePhoto/ProfilePreview.tsx`
- `src/components/Dashboard/MyProfile/ProfilePhoto/ProfilePhotoUpload.tsx`
- `src/components/Dashboard/MyProfile/ConnectionsAndShare.tsx`
- `src/components/Dashboard/MyProfile/ProfileProgress/ProfileProgress.tsx`
- `src/components/Dashboard/MyProfile/ProfileCompletionCard.tsx`
- `src/components/Dashboard/MyProfile/CompanyLogo/CompanyLogoUpload.tsx`
- `src/components/Dashboard/MyProfile/ExampleUsage.tsx`
- `src/components/ui/ProfileImageUpload.tsx`
- `src/hooks/useProfileCompletion.ts`

**Documentation:**

- `types/README.md`

### ⚠️ Deprecated

- `store/api/userApi.ts` - Marked as deprecated, will be removed in future version

---

## 🚀 Future Enhancements

With this new structure, you can easily add:

```
store/api/
├── baseApi.ts
├── profileApi.ts          ✅ Done
├── connectionsApi.ts      ✅ Done
├── feedsApi.ts           🔮 Future - Posts, comments, likes
├── messagesApi.ts        🔮 Future - Direct messaging
├── eventsApi.ts          🔮 Future - Event management
├── notificationsApi.ts   🔮 Future - Push notifications
└── index.ts              ✅ Done
```

---

## 🆘 Need Help?

If you encounter any issues during migration:

1. **Check TypeScript Errors**: Run `npm run type-check`
2. **Clear Next.js Cache**: `rm -rf .next` (PowerShell: `Remove-Item -Recurse -Force .next`)
3. **Restart Dev Server**: `npm run dev`
4. **Check Import Paths**: Ensure you're using `@/store/api` (not `@/store/api/userApi`)

---

## 📝 Example Migration

### Component Using Profile API

**Before:**

```typescript
import {
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
} from "@/store/api/userApi";

export default function ProfileComponent() {
  const { data: user } = useGetCurrentUserQuery();
  const [updateProfile] = useUpdateProfileMutation();

  return <div>{user?.fname}</div>;
}
```

**After:**

```typescript
import { useGetCurrentUserQuery, useUpdateProfileMutation } from "@/store/api";

export default function ProfileComponent() {
  const { data: user } = useGetCurrentUserQuery();
  const [updateProfile] = useUpdateProfileMutation();

  return <div>{user?.fname}</div>;
}
```

### Component Using Connections API

**Before:**

```typescript
import {
  useGetConnectionsQuery,
  useSendConnectionRequestMutation,
} from "@/store/api/userApi";

export default function ConnectionsComponent() {
  const { data: connections } = useGetConnectionsQuery();
  const [sendRequest] = useSendConnectionRequestMutation();

  return <div>Connections: {connections?.length}</div>;
}
```

**After:**

```typescript
import {
  useGetConnectionsQuery,
  useSendConnectionRequestMutation,
} from "@/store/api";

export default function ConnectionsComponent() {
  const { data: connections } = useGetConnectionsQuery();
  const [sendRequest] = useSendConnectionRequestMutation();

  return <div>Connections: {connections?.length}</div>;
}
```

---

## ✨ Summary

- ✅ All imports updated automatically
- ✅ Backward compatible during transition
- ✅ Better code organization
- ✅ Ready for future scaling
- ✅ No breaking changes to functionality

**You're all set! The migration is complete.** 🎉
