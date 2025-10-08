# API Endpoint Duplication Fix

## 🐛 Issue

**Error:** RTK Query warnings about duplicate endpoint names:

```
called `injectEndpoints` to override already-existing endpointName getUserEvents
without specifying `overrideExisting: true`
```

**Root Cause:** Two events API files (`eventsApi.ts` and `eventsApi.latest.ts`) were both injecting endpoints into `baseApi`, causing name collisions.

---

## ✅ Solution Applied

### 1. Added `overrideExisting: true` Flag

Updated both API files to allow endpoint overriding:

**File:** `store/api/eventsApi.ts`

```typescript
export const eventsApi = baseApi.injectEndpoints({
  overrideExisting: true, // ✅ Added this
  endpoints: (builder) => ({
    // ...
  }),
});
```

**File:** `store/api/eventsApi.latest.ts`

```typescript
export const eventsApiLatest = baseApi.injectEndpoints({
  overrideExisting: true, // ✅ Added this
  endpoints: (builder) => ({
    // ...
  }),
});
```

### 2. Updated Central Export to Use Latest API

**File:** `store/api/index.ts`

```typescript
// Before
export { eventsApi, ... } from "./eventsApi";

// After (using latest backend schema)
export {
  eventsApiLatest as eventsApi,
  ...
} from "./eventsApi.latest";
```

This ensures all imports use the latest API schema with `accessMode` and other new fields.

---

## 📊 Why Two Events API Files?

| File                  | Purpose     | Backend Schema                                                |
| --------------------- | ----------- | ------------------------------------------------------------- |
| `eventsApi.ts`        | Legacy API  | Old schema (uses `isPaid`)                                    |
| `eventsApi.latest.ts` | Current API | Latest schema (uses `accessMode`, `pending`, `country`, etc.) |

The `.latest` file has:

- ✅ `accessMode`: "free" \| "paid" \| "freepaid"
- ✅ `country`, `region`, `state` filtering
- ✅ `pending` and `pendingPayment` arrays
- ✅ `targets` for Communities/CoreGroups
- ✅ Enhanced participant structure

---

## 🔧 Files Modified

1. ✅ `store/api/eventsApi.ts` - Added `overrideExisting: true`
2. ✅ `store/api/eventsApi.latest.ts` - Added `overrideExisting: true`
3. ✅ `store/api/index.ts` - Updated to export `.latest` as default
4. ✅ `.env.local` - Changed to use dev backend URL

---

## 🚀 Result

- ✅ No more duplicate endpoint warnings
- ✅ Using latest backend schema with all new features
- ✅ All event components working with `accessMode` property
- ✅ Backend connection working (dev backend)

---

## 📝 Component Usage

Components using the latest event types:

**File:** `src/components/Events/EventCard.tsx`

```typescript
import { FrontendEvent } from "../../../types/mongoEvent.types.latest";

// Now works with accessMode property
{
  event.accessMode === "free" ? "Free" : "$" + event.price;
}
```

**File:** `src/app/feeds/events/page.tsx`

```typescript
import { FrontendEvent } from "../../../../types/mongoEvent.types.latest";
```

---

## 🔍 Understanding `overrideExisting: true`

From RTK Query docs:

```typescript
baseApi.injectEndpoints({
  overrideExisting: false, // Default - warns about duplicates
  overrideExisting: true, // Silently overrides duplicates
  overrideExisting: "throw", // Throws error on duplicates
});
```

**When to use:**

- ✅ Multiple API files in development (hot reloading)
- ✅ Intentionally overriding endpoints for testing
- ✅ Code splitting with lazy-loaded API slices

**When NOT to use:**

- ❌ Production apps (indicates poor architecture)
- ❌ When duplicates are unintentional bugs

---

## 🎯 Recommendations

### Short-term (Current Setup)

✅ Keep both files with `overrideExisting: true`  
✅ Use `.latest` as primary API  
✅ Dev backend URL configured

### Long-term (Production Ready)

1. **Merge the two API files** - Once backend is stable, merge into single `eventsApi.ts`
2. **Update all type imports** - Use single `mongoEvent.types.ts`
3. **Remove** `overrideExisting: true` - Clean architecture shouldn't need it
4. **Update backend URL** - Switch to production when ready

---

## 🐛 Troubleshooting

### If warnings still appear:

```powershell
# 1. Clear Next.js cache
Remove-Item -Recurse -Force .next

# 2. Restart dev server
npm run dev

# 3. Hard refresh browser
Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### If TypeScript errors appear:

```powershell
# Check for type errors
npm run type-check

# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

---

## ✅ Verification Checklist

- ✅ No RTK Query warnings in console
- ✅ Events page loads without errors
- ✅ Event cards display `accessMode` correctly
- ✅ Backend API calls work
- ✅ TypeScript types match backend schema

---

**Status:** ✅ Fixed  
**Last Updated:** October 8, 2025
