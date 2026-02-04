# BizCivitas User Panel - Final Day Tasks (Hand-off to Client)

**Date**: November 26, 2025
**Status**: Production Ready - Final Fixes Before Client Hand-off

---

## ✅ COMPLETED TASKS

### 1. Avatar Fix - Connections & Requests Tab (Vercel 402 Error) ✓
- **Issue**: Avatars showing 402 Payment Required error on Vercel deployment
- **Root Cause**: Next.js Image Optimization exceeded Vercel's free tier limit
- **Solution**: Replaced Next.js `Image` component with standard `<img>` tags in Avatar.tsx
- **Files Modified**:
  - `src/components/ui/Avatar.tsx` - Removed Next.js Image, added inline image URL handler
  - Direct loading from backend without Vercel proxy
- **Status**: ✅ FIXED

---

## 🔴 CRITICAL FIXES - REMAINING (Must Complete Today)

### 2. Avatar Fix - BizHub Posts
- **Issue**: Avatars not showing in BizHub post listings (Vercel deployment)
- **Expected Fix**: Apply same Avatar.tsx fix to BizHub components
- **Files to Check**:
  - `src/app/feeds/biz-hub/page.tsx`
  - BizHub post card components
- **Priority**: HIGH
- **Status**: ⏳ PENDING

### 3. Avatar Fix - BizHub Post Comments
- **Issue**: Member avatars not showing in BizHub post comments
- **Expected Fix**: Ensure comment components use updated Avatar component
- **Files to Check**:
  - `src/components/CommentList.tsx`
  - BizHub comment components
- **Priority**: HIGH
- **Status**: ⏳ PENDING

### 4. Avatar Fix - BizPulse Post Comments
- **Issue**: Member avatars not showing in BizPulse post comments
- **Expected Fix**: Same as BizHub comments fix
- **Files to Check**:
  - `src/components/CommentList.tsx`
  - BizPulse comment components
- **Priority**: HIGH
- **Status**: ⏳ PENDING

### 5. Avatar Fix - BizHub Post Details Page
- **Issue**: Avatar not showing on post details page
- **Expected Fix**: Update Avatar usage in details page
- **Files to Check**:
  - `src/app/feeds/biz-hub/[id]/page.tsx`
- **Priority**: HIGH
- **Status**: ⏳ PENDING

### 6. Screen Flickering - BizHub Comment Posting
- **Issue**: Screen flickers when posting comment with loader icon
- **Root Cause**: Likely re-render issue or improper loading state handling
- **Expected Fix**: Optimize loading state, prevent unnecessary re-renders
- **Files to Check**:
  - BizHub comment form component
  - Loading state logic
- **Priority**: HIGH
- **Status**: ⏳ PENDING

---

## 🟡 UI/UX IMPROVEMENTS - REMAINING

### 7. Photo Gallery Full Size - BizHub Posts
- **Issue**: Photo gallery popup not showing full size
- **Expected Fix**: Update modal/lightbox to display images at full resolution
- **Files to Check**:
  - BizHub post details photo gallery component
- **Priority**: MEDIUM
- **Status**: ⏳ PENDING

### 8. Text Size Reduction - BizHub Post Details
- **Issue**: Text size too large in post details page
- **Expected Fix**: Reduce font sizes for better readability
- **Files to Check**:
  - `src/app/feeds/biz-hub/[id]/page.tsx`
  - Post details styling
- **Priority**: MEDIUM
- **Status**: ⏳ PENDING

### 9. Layout Fix - BizPulse Post Details
- **Issue**:
  - Excessive left/right padding
  - Comment button position needs adjustment
- **Expected Fix**:
  - Remove horizontal padding
  - Move comment button outside/below content area
- **Files to Check**:
  - `src/app/feeds/biz-pulse/[id]/page.tsx`
  - Comment form component
- **Priority**: MEDIUM
- **Status**: ⏳ PENDING

### 10. Hide Settings Icon - BizPulse
- **Issue**: Settings icon showing when it shouldn't
- **Expected Fix**: Conditional render or remove settings icon
- **Files to Check**:
  - BizPulse post components
  - Settings button logic
- **Priority**: LOW
- **Status**: ⏳ PENDING

### 11. Update Password Button Text - Account Settings
- **Issue**: "Update Password" text too long
- **Expected Fix**: Change to shorter text like "Update" or "Save"
- **Files to Check**:
  - `src/app/feeds/account-settings/page.tsx`
  - Password change form
- **Priority**: LOW
- **Status**: ⏳ PENDING

---

## 🟢 FEATURE ADDITIONS - REMAINING

### 12. Upcoming Meetings - Dashboard Page
- **Issue**: Missing upcoming meetings section on dashboard
- **Expected Implementation**:
  - Fetch upcoming meetings from backend
  - Display cards with meeting info (date, time, location, attendees)
  - Horizontal scroll layout (similar to mobile app)
- **Backend API**:
  - `GET /meetings/community/:communityId`
  - Filter for future meetings (date ≥ today)
- **Files to Check**:
  - `src/app/feeds/dash/page.tsx`
  - Create UpcomingMeetings component
- **Priority**: HIGH
- **Status**: ⏳ PENDING

### 13. BizWin Creation Logic Fix
- **Issue**: When user creates BizWin, it should appear in "Received" side, not "Given"
- **Current Behavior**: New BizWin goes to "Given"
- **Expected Behavior**: New BizWin goes to "Received"
- **Files to Check**:
  - `src/components/Dashboard/forms/CreateBizWinForm.tsx`
  - Backend record creation API
  - Data mapping in BizWinDetailModal
- **Priority**: HIGH
- **Status**: ⏳ PENDING

### 14. BizWin Edit/Delete - Received Side
- **Issue**: Can only edit/delete from "Received" tab, not "Given"
- **Current**: Edit/delete buttons only on received tab
- **Expected**: Should also work on given tab
- **Files to Check**:
  - `src/components/Dashboard/charts/BizWinDetailModal.tsx` (lines 652-693)
  - Conditional rendering of action buttons
- **Priority**: MEDIUM
- **Status**: ⏳ PENDING

### 15. Toast Messages - Dashboard Edit/Delete
- **Issue**: Missing toast notifications for edit/delete actions
- **Expected**: Show success/error toasts for all CRUD operations
- **Files to Check**:
  - All dashboard modal components
  - BizConnect, BizWin, Meetups, Visitor modals
- **Priority**: MEDIUM
- **Status**: ⏳ PENDING

### 16. Profile Card Fix - My Profile
- **Issue**: Profile card not displaying correctly
- **Expected Fix**: Debug and fix profile card rendering
- **Files to Check**:
  - `src/components/Dashboard/MyProfile/PersonalProfileCard.tsx`
  - My Profile page
- **Priority**: MEDIUM
- **Status**: ⏳ PENDING

---

## 🔧 TECHNICAL NOTES

### Avatar Fix Implementation (COMPLETED)
```typescript
// OLD (Causing 402 errors):
import Image from "next/image";
<Image src={imageUrl} alt={alt} fill />

// NEW (Direct loading):
<img src={imageUrl} alt={alt} className="w-full h-full object-cover" />
```

### Key Files Modified
1. ✅ `src/components/ui/Avatar.tsx` - Removed Next.js Image optimization
2. ⏳ Need to check all components using images/avatars

### Important Reminders
- **No Vercel Image Optimization**: All images must use `<img>` tag, not Next.js `Image`
- **Direct Backend URLs**: Images load from `https://backend.bizcivitas.com/api/v1/image/...`
- **Fallback Handling**: Always show initials or placeholder when image fails
- **Error Boundaries**: Wrap components in try-catch for production stability

---

## 📋 HAND-OFF CHECKLIST

Before client delivery, ensure:

- [ ] All avatars loading correctly on Vercel (connections, posts, comments)
- [ ] No 402 Payment Required errors
- [ ] All CRUD operations have toast notifications
- [ ] BizWin creation logic fixed (goes to received)
- [ ] Dashboard has upcoming meetings section
- [ ] All UI/UX issues resolved (text sizes, layouts, etc.)
- [ ] No screen flickering issues
- [ ] Photo galleries work properly
- [ ] Test on production Vercel deployment
- [ ] Final cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Mobile responsiveness check
- [ ] Performance audit (Lighthouse score)

---

## 🚀 DEPLOYMENT NOTES

**Production URL**: https://bizcivitas-userpanel.vercel.app
**Backend URL**: https://backend.bizcivitas.com/api/v1

**Environment Variables**:
```
NEXT_PUBLIC_BACKEND_URL=https://backend.bizcivitas.com/api/v1
```

---

**Last Updated**: November 26, 2025
**Next Steps**: Fix all pending issues systematically, starting with HIGH priority items

---

# Unified Password Reset - User Panel Implementation Plan

## Branch: `feature/unified-password-reset`

## Problem Statement

DCP, Master Franchise Partners, and Area Partners cannot reset their passwords through the user panel because:

1. The user panel calls `/api/forgot-password/send-otp` which proxies to `/api/v1/forgetpassword/send-otp`
2. This endpoint only searches the `User` model in the backend
3. Franchise partners are stored in the `FranchisePartner` model
4. When franchise partners try to reset password, they get "User not found with this email"

## Current Architecture

### Existing Files

| File | Purpose |
|------|---------|
| `src/hooks/useForgotPassword.ts` | API calls for password reset |
| `src/app/forgot-password/page.tsx` | Forgot password page |
| `src/components/Dashboard/ForgotPassword/ForgotPasswordWizard.tsx` | Main wizard component |
| `src/components/Dashboard/ForgotPassword/steps/EmailStep.tsx` | Email input step |
| `src/components/Dashboard/ForgotPassword/steps/OtpStep.tsx` | OTP verification step |
| `src/components/Dashboard/ForgotPassword/steps/PasswordStep.tsx` | New password step |
| `src/components/Dashboard/ForgotPassword/steps/SuccessStep.tsx` | Success confirmation |
| `src/app/api/proxy/[...path]/route.ts` | API proxy to backend |

### Current API Endpoints Called

```
/api/forgot-password/send-otp     → Backend: /api/v1/forgetpassword/send-otp
/api/forgot-password/verify-otp   → Backend: /api/v1/forgetpassword/verify-otp
/api/forgot-password/reset-password → Backend: /api/v1/forgetpassword/reset-password
```

## Implementation Plan

### Step 1: Update useForgotPassword Hook

Update `src/hooks/useForgotPassword.ts` to use the new unified backend endpoint:

```typescript
import { useState } from "react";
import { PasswordResetApiResponse } from "../../types/PasswordTypes";

interface UseForgotPasswordReturn {
  loading: boolean;
  error: string;
  accountType: string | null;
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string; accountType?: string }>;
  verifyOtp: (
    email: string,
    otp: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function useForgotPassword(): UseForgotPasswordReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [accountType, setAccountType] = useState<string | null>(null);

  const sendOtp = async (
    email: string
  ): Promise<{ success: boolean; error?: string; accountType?: string }> => {
    setLoading(true);
    setError("");

    try {
      // Use new unified endpoint
      const response = await fetch("/api/proxy/api/v1/password-reset/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data: PasswordResetApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send OTP");
      }

      // Store account type for display purposes
      const accType = data.data?.accountType || 'user';
      setAccountType(accType);

      return { success: true, accountType: accType };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError("");

    try {
      // Use new unified endpoint
      const response = await fetch("/api/proxy/api/v1/password-reset/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data: PasswordResetApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError("");

    try {
      // Use new unified endpoint
      const response = await fetch("/api/proxy/api/v1/password-reset/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data: PasswordResetApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password");
      }

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    accountType,
    sendOtp,
    verifyOtp,
    resetPassword,
  };
}
```

### Step 2: Update Types

Update `src/types/PasswordTypes.ts` if needed:

```typescript
export interface PasswordResetApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: {
    accountType?: 'user' | 'franchise_partner';
  };
}
```

### Step 3: Update ForgotPasswordWizard Component (Optional Enhancement)

Update `src/components/Dashboard/ForgotPassword/ForgotPasswordWizard.tsx` to show account type:

```typescript
// Add state to track account type
const [accountType, setAccountType] = useState<string | null>(null);

// In handleSendOtp
const handleSendOtp = async () => {
  const result = await sendOtp(email);
  if (result.success) {
    setAccountType(result.accountType || null);
    setStep(2);
  }
};

// Optionally show a message based on account type
{accountType === 'franchise_partner' && (
  <p className="text-sm text-blue-600">
    Resetting password for your franchise partner account
  </p>
)}
```

### Step 4: Update EmailStep Component (Optional Enhancement)

Add helper text in `src/components/Dashboard/ForgotPassword/steps/EmailStep.tsx`:

```tsx
<p className="text-sm text-gray-500 mt-2">
  Works for all account types: Members, DCP, Master Franchise Partners, and Area Partners
</p>
```

## API Endpoint Changes

### Before (Current)

```
Frontend: /api/forgot-password/send-otp
         → Proxy: /api/v1/forgetpassword/send-otp
         → Only searches User model
```

### After (New)

```
Frontend: /api/proxy/api/v1/password-reset/send-otp
         → Backend: /api/v1/password-reset/send-otp
         → Searches BOTH User and FranchisePartner models
```

## Files to Modify

| File | Action | Priority |
|------|--------|----------|
| `src/hooks/useForgotPassword.ts` | MODIFY - Update API endpoints | HIGH |
| `src/types/PasswordTypes.ts` | MODIFY - Add accountType | MEDIUM |
| `src/components/Dashboard/ForgotPassword/ForgotPasswordWizard.tsx` | MODIFY - Handle accountType | LOW |
| `src/components/Dashboard/ForgotPassword/steps/EmailStep.tsx` | MODIFY - Add helper text | LOW |

## Testing Checklist

- [ ] Test password reset for regular User via user panel
- [ ] Test password reset for DCP via user panel
- [ ] Test password reset for Master Franchise Partner via user panel
- [ ] Test password reset for Area Partner via user panel
- [ ] Test email validation
- [ ] Test OTP input and auto-submit
- [ ] Test OTP resend functionality
- [ ] Test password strength indicator
- [ ] Test password confirmation matching
- [ ] Test success redirect to login

## Dependencies

- **Backend**: Must deploy `feature/unified-password-reset` branch first
- **API Proxy**: No changes needed (already proxies all paths)

## Deployment Order

1. Deploy Backend `feature/unified-password-reset` first
2. Verify backend endpoints work via API testing
3. Deploy User Panel `feature/unified-password-reset`
4. Test end-to-end flow

## Rollback Plan

If issues arise:
1. Revert hook to use old endpoints
2. Old endpoints remain functional for regular users
3. Franchise partners will need admin password reset as temporary workaround
