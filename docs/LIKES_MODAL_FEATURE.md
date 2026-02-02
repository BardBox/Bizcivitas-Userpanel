# Likes Modal Feature - Implementation Plan

> **Feature**: Instagram-style modal showing users who liked a post with "Connect" button
> **Date**: February 2, 2026
> **Status**: Planning Phase

---

## Overview

When users click on "X Likes" on a BizPulse post, a modal opens showing all users who liked the post - with their avatar, name, and a "Connect" / "Send Request" button.

---

## UI Preview

```
┌──────────────────────────────────────────┐
│  ❤️ Liked by                        [X]  │
├──────────────────────────────────────────┤
│  🔍 Search users...                      │
├──────────────────────────────────────────┤
│                                          │
│  [👤] John Doe              [Connect]    │
│   ↳   @johndoe · Business                │
│  ────────────────────────────────────────│
│  [👤] Jane Smith            [Connected]  │
│   ↳   @janesmith · Marketing             │
│  ────────────────────────────────────────│
│  [👤] Bob Wilson            [Pending]    │
│   ↳   @bobwilson · Finance               │
│  ────────────────────────────────────────│
│  [👤] You                   [—]          │
│   ↳   @currentuser                       │
│                                          │
└──────────────────────────────────────────┘

Click Actions:
• Avatar click → Go to user profile
• Name click → Go to user profile
• Connect button → Send connection request
```

---

## Features

### Core Features
- [x] Modal overlay with backdrop blur
- [x] Header with "Liked by" title and close button
- [x] Scrollable user list
- [x] Each user shows: Avatar, Full Name, Username/Business
- [x] Click on user → Navigate to their profile
- [x] "Connect" button for each user (except self)

### Connect Button States
| State | Button Text | Style | Action |
|-------|-------------|-------|--------|
| Not Connected | "Connect" | Primary Blue | Send connection request |
| Pending (sent) | "Pending" | Gray/Disabled | None |
| Pending (received) | "Accept" | Green | Accept connection |
| Connected | "Connected" | Gray outline | None (or show ✓) |
| Self | Hidden | — | Don't show button for current user |

### Optional Features
- [ ] Search/filter users in the list
- [ ] Loading skeleton while fetching
- [ ] Empty state if no likes
- [ ] Infinite scroll for many likes

---

## Technical Implementation

### Files to Create

#### 1. `src/components/modals/LikesModal.tsx`
Main modal component

```typescript
interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  likes: Like[];
  postId: string;
}
```

#### 2. `src/components/modals/LikesModal/UserListItem.tsx` (optional)
Individual user row component

```typescript
interface UserListItemProps {
  user: LikeUser;
  currentUserId: string;
  onConnect: (userId: string) => void;
  connectionStatus: 'none' | 'pending' | 'connected' | 'self';
}
```

### Files to Modify

#### 1. `src/types/bizpulse.types.ts`
Update Like interface to support populated user data

```typescript
// Current
export interface Like {
  userId: string;
}

// Updated
export interface LikeUser {
  _id: string;
  fname: string;
  lname: string;
  avatar?: string;
  username?: string;
  role?: string;
}

export interface Like {
  userId: string | LikeUser;  // Can be ID or populated user object
}
```

#### 2. `src/app/feeds/biz-pulse/[id]/page.tsx`
Add modal state and clickable likes count

```typescript
// Add state
const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);

// Make likes count clickable
<button onClick={() => setIsLikesModalOpen(true)}>
  {post.stats?.likes || 0} Likes
</button>

// Add modal
<LikesModal
  isOpen={isLikesModalOpen}
  onClose={() => setIsLikesModalOpen(false)}
  likes={post.likes}
  postId={postId}
/>
```

---

## Data Flow

### Backend Data (Already Available)

The backend already populates `likes.userId` with user details:

```javascript
// From getWallFeedById and likeWallFeed responses
likes: [
  {
    userId: {
      _id: "user123",
      fname: "John",
      lname: "Doe",
      avatar: "avatars/john.jpg",
      username: "johndoe"
    }
  },
  // ...more likes
]
```

### Frontend Flow

```
1. User clicks "5 Likes" button
   ↓
2. setIsLikesModalOpen(true)
   ↓
3. LikesModal renders with likes array from post data
   ↓
4. For each like:
   - Extract user info from like.userId
   - Check connection status (optional: via useGetConnectionsQuery)
   - Render UserListItem with appropriate button state
   ↓
5. User clicks "Connect" button
   ↓
6. useSendConnectionRequestMutation({ receiverId: userId })
   ↓
7. Update button state to "Pending"
   ↓
8. User clicks on avatar/name (CLICKABLE - navigates to profile)
   ↓
9. router.push(`/feeds/connections/${userId}?from=likes-modal`)
   OR for self: router.push('/feeds/myprofile')
```

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/wallfeed/:id` | GET | Get post with populated likes |
| `/connections/send-request` | POST | Send connection request |
| `/connections` | GET | Get current user's connections (for status) |
| `/connections/sent/connection-requests` | GET | Get pending sent requests |
| `/connections/received/connection-requests` | GET | Get pending received requests |
| `/connections/accept-request` | POST | Accept a connection request |
| `/connections/delete-connection` | DELETE | Withdraw/reject connection |

---

## Existing Code to Reuse (from `/feeds/connections` page)

### Hooks (from `@/store/api` or `store/api/connectionsApi.ts`)
```typescript
import {
  useGetConnectionsQuery,           // Get all connections
  useGetConnectionRequestsQuery,    // Get sent/received requests
  useSendConnectionRequestMutation, // Send new connection request
  useAcceptConnectionRequestMutation, // Accept request
  useDeleteConnectionMutation,      // Withdraw/reject request
} from "@/store/api";
```

### Usage Pattern (from connections page)
```typescript
// Get connections to check if already connected
const { data: connections } = useGetConnectionsQuery();

// Get sent requests to check if pending
const { data: sentRequests } = useGetConnectionRequestsQuery("sent");

// Send connection request
const [sendRequest, { isLoading }] = useSendConnectionRequestMutation();
await sendRequest({ receiverId: userId }).unwrap();

// Accept connection request
const [acceptConnection] = useAcceptConnectionRequestMutation();
await acceptConnection({ connectionId }).unwrap();
```

### Components
- `Avatar` - from `@/components/ui/Avatar.tsx`
- `ReportModal` pattern - from `src/components/modals/ReportModal.tsx`
- `ConnectionRequestCard` - from `src/components/Dashboard/Connections/SendAcceptRequest/ConnectionRequestCard.tsx`
- `UserCard` - from `src/components/Dashboard/UserCard.tsx`

### Types
- `ConnectionRequest` - `{ receiverId: string }` from `types/connection.types.ts`
- `ConnectionActionPayload` - `{ connectionId: string }` from `types/connection.types.ts`
- `User` - from `types/user.types.ts`

### Helper Functions (from connections page)
```typescript
// Get full avatar URL
const getAvatarUrl = (avatarPath?: string) => {
  if (!avatarPath) return undefined;
  if (avatarPath.startsWith("http")) return avatarPath;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  return `${baseUrl}/image/${avatarPath}`;
};
```

---

## Connection Status Logic

To determine the correct button state for each user in the likes list:

```typescript
// 1. Get current user ID from auth state
const currentUserId = useSelector((state: RootState) => state.auth.user?._id);

// 2. Get all connections (accepted)
const { data: connections } = useGetConnectionsQuery();
const connectedIds = new Set(connections?.map(c => c._id) || []);

// 3. Get sent requests (pending)
const { data: sentRequests } = useGetConnectionRequestsQuery("sent");
const pendingSentIds = new Set(
  sentRequests?.data?.connections?.map(r => r.receiver?.id) || []
);

// 4. Get received requests (pending)
const { data: receivedRequests } = useGetConnectionRequestsQuery("received");
const pendingReceivedIds = new Set(
  receivedRequests?.data?.connections?.map(r => r.sender?.id) || []
);

// 5. Determine status for each user
const getConnectionStatus = (userId: string): ConnectionStatus => {
  if (userId === currentUserId) return "self";
  if (connectedIds.has(userId)) return "connected";
  if (pendingSentIds.has(userId)) return "pending_sent";
  if (pendingReceivedIds.has(userId)) return "pending_received";
  return "none";
};
```

### Button States Based on Status:

| Status | Button | Action |
|--------|--------|--------|
| `self` | Hidden | — |
| `connected` | "Connected" ✓ | None (gray, disabled look) |
| `pending_sent` | "Pending" | None (gray, disabled look) |
| `pending_received` | "Accept" | Accept the request |
| `none` | "Connect" | Send connection request |

---

## Profile Navigation (Avatar/Name Click)

When user clicks on avatar or name, navigate to their profile:

```typescript
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

const router = useRouter();
const currentUserId = useSelector((state: RootState) => state.auth.user?._id);

const handleUserClick = (userId: string) => {
  // Close modal first
  onClose();

  // Navigate to profile
  if (userId === currentUserId) {
    router.push('/feeds/myprofile');
  } else {
    router.push(`/feeds/connections/${userId}?from=likes-modal`);
  }
};
```

### User List Item JSX:
```tsx
<div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50">
  {/* Clickable Avatar */}
  <button onClick={() => handleUserClick(user._id)} className="flex-shrink-0">
    <Avatar src={getAvatarUrl(user.avatar)} alt={userName} size="sm" />
  </button>

  {/* Clickable Name */}
  <button
    onClick={() => handleUserClick(user._id)}
    className="flex-1 text-left min-w-0"
  >
    <p className="font-semibold text-sm text-gray-900 truncate hover:text-blue-600">
      {user.fname} {user.lname}
    </p>
    <p className="text-xs text-gray-500 truncate">
      {user.classification || 'Business Professional'}
    </p>
  </button>

  {/* Connect Button (right side) */}
  {connectionStatus !== 'self' && (
    <ConnectButton status={connectionStatus} userId={user._id} />
  )}
</div>
```

---

## Implementation Steps

### Phase 1: Basic Modal (MVP)
1. [ ] Update `Like` interface in `bizpulse.types.ts`
2. [ ] Create `LikesModal.tsx` component
3. [ ] Add clickable likes count to detail page
4. [ ] Display user list with avatars and names
5. [ ] Add profile navigation on user click

### Phase 2: Connect Functionality
6. [ ] Add "Connect" button to each user
7. [ ] Integrate `useSendConnectionRequestMutation`
8. [ ] Handle loading state during request
9. [ ] Show success/error toast

### Phase 3: Connection Status
10. [ ] Fetch user's existing connections
11. [ ] Fetch pending connection requests
12. [ ] Show appropriate button state for each user
13. [ ] Hide button for self (current user)

### Phase 4: Polish
14. [ ] Add search/filter functionality
15. [ ] Add loading skeleton
16. [ ] Add empty state
17. [ ] Add smooth animations
18. [ ] Mobile responsive design

---

## Design Specifications

### Colors
```css
--primary-blue: #3359FF;      /* Connect button */
--success-green: #1DB212;     /* Connected/Accept */
--gray-pending: #6B7280;      /* Pending button */
--text-primary: #111827;      /* User name */
--text-secondary: #6B7280;    /* Username/business */
--border: #E5E7EB;            /* Dividers */
--backdrop: rgba(0,0,0,0.5);  /* Modal overlay */
```

### Spacing
- Modal width: `max-w-md` (28rem)
- User item padding: `py-3 px-4`
- Avatar size: 40x40px
- Gap between avatar and text: 12px

### Typography
- User name: `font-semibold text-sm`
- Username/business: `text-xs text-gray-500`
- Button text: `text-sm font-medium`

---

## Testing Checklist

- [ ] Modal opens when clicking likes count
- [ ] Modal closes on X button click
- [ ] Modal closes on backdrop click
- [ ] Modal closes on Escape key
- [ ] User list displays correctly
- [ ] Avatars load properly (with fallback)
- [ ] Profile navigation works
- [ ] Connect button sends request
- [ ] Success toast shows after connecting
- [ ] Button state updates after connecting
- [ ] Connected users show "Connected" state
- [ ] Current user doesn't see Connect button for self
- [ ] Empty state shows when no likes
- [ ] Works on mobile devices
- [ ] Scrolling works for many likes

---

## Estimated Time

| Phase | Estimated Time |
|-------|---------------|
| Phase 1: Basic Modal | 2-3 hours |
| Phase 2: Connect Functionality | 1-2 hours |
| Phase 3: Connection Status | 2-3 hours |
| Phase 4: Polish | 1-2 hours |
| **Total** | **6-10 hours** |

---

## Notes

- Backend already returns populated user data in likes array
- Existing `ReportModal` can be used as a pattern reference
- Connection APIs are already implemented and working
- Consider caching connection status to avoid repeated API calls

---

## Questions to Clarify

1. Should we show connection status for ALL users or just show Connect for non-connected?
2. Should clicking a connected user's "Connected" button do anything (e.g., view profile)?
3. Should we limit the number of likes shown initially (e.g., first 50 with "Load More")?
4. Should the search feature search by name only or also by business/username?
5. Should we also add this to BizHub posts or just BizPulse?

---

**Document Version**: 1.0
**Last Updated**: February 2, 2026
