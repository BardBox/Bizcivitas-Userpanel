# Type Definitions Guide

This folder contains centralized TypeScript interfaces and types for the application.

## File Structure

```
types/
├── index.ts                    # Central export - import from here
├── user.types.ts              # User and Profile related types
├── connection.types.ts        # Connection related types
├── mongoEvent.types.ts        # Event related types
├── PasswordTypes.ts           # Password related types
└── README.md                  # This file
```

## Usage

### Option 1: Import from central index (Recommended)

```typescript
import { User, FullProfile, ConnectionStatus, Connection } from "@/types";
```

### Option 2: Import from specific type file

```typescript
import { User, FullProfile } from "@/types/user.types";
import { Connection, ConnectionStatus } from "@/types/connection.types";
```

## Available Types

### User Types (`user.types.ts`)

#### Main Interfaces:

- `User` - Main user object with basic info
- `FullProfile` - Detailed user profile
- `ProfessionalDetails` - Business/professional information
- `MyBio` - User biography and personal info
- `TravelDiary` - Travel preferences and history
- `ContactDetails` - Contact information
- `Address` - Address structure
- `Community` - Community information
- `UserSkillItem` - User skills with endorsements

#### Response Types:

- `ApiResponse<T>` - Generic API response wrapper
- `UserApiResponse` - User API response
- `FullProfileApiResponse` - Full profile API response
- `UsersApiResponse` - Multiple users API response

### Connection Types (`connection.types.ts`)

#### Main Interfaces:

- `Connection` - Basic connection between users
- `PopulatedConnection` - Connection with populated user details
- `ConnectionWithUser` - Connection with minimal user info
- `ConnectionStatusInfo` - Connection status information

#### Enums/Types:

- `ConnectionStatus` - `"none" | "pending_sent" | "pending_received" | "connected"`
- `ConnectionRequestState` - `"idle" | "sending" | "sent"`
- `ConnectionCardStatus` - `"self" | "connected" | "not_connected"`

#### Request/Response Types:

- `ConnectionRequest` - Send connection request payload
- `ConnectionActionPayload` - Accept/Delete connection payload
- `ConnectionApiResponse` - Single connection response
- `ConnectionsApiResponse` - Multiple connections response
- `ConnectionRequestsApiResponse` - Connection requests response
- `SuggestionsApiResponse` - User suggestions response

## Examples

### Using User Types

```typescript
import { User, FullProfile } from "@/types";

const MyComponent = () => {
  const [user, setUser] = useState<User | null>(null);

  // API call
  const { data: profile } = useQuery<FullProfile>(...);

  return <div>{user?.fname} {user?.lname}</div>;
};
```

### Using Connection Types

```typescript
import { Connection, ConnectionStatus, ConnectionStatusInfo } from "@/types";

const ConnectionCard = ({ userId }: { userId: string }) => {
  const [status, setStatus] = useState<ConnectionStatus>("none");

  const connectionInfo: ConnectionStatusInfo = {
    status: "connected",
    connectionId: "123",
  };

  return <div>Status: {status}</div>;
};
```

### Using with API Hooks

```typescript
import { User, ConnectionRequest } from "@/types";
import {
  useGetCurrentUserQuery,
  useSendConnectionRequestMutation,
} from "@/store/api";

const MyComponent = () => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [sendRequest] = useSendConnectionRequestMutation();

  const handleConnect = async (receiverId: string) => {
    const payload: ConnectionRequest = { receiverId };
    await sendRequest(payload);
  };

  return (
    <div>
      <p>{currentUser?.fname}</p>
      <button onClick={() => handleConnect("userId123")}>Connect</button>
    </div>
  );
};
```

## Benefits

1. **Centralized Types** - All type definitions in one place
2. **Reusability** - Import types across components easily
3. **Type Safety** - Full TypeScript support
4. **Auto-complete** - IDE suggestions for all properties
5. **Consistency** - Same types used across the application
6. **Easy Updates** - Change once, update everywhere

## Migration Guide

### Old Way (Before):

```typescript
// Types defined inline
interface MyUser {
  _id: string;
  fname: string;
  lname: string;
  // ... rest of properties
}
```

### New Way (After):

```typescript
// Import from centralized types
import { User } from "@/types";

// Use the imported type
const user: User = { ... };
```

## Adding New Types

1. Create/Update the appropriate type file
2. Export the type from that file
3. Add export to `index.ts` if needed
4. Update this README with the new type

Example:

```typescript
// In user.types.ts
export interface NewUserType {
  // ... properties
}

// In index.ts
export * from "./user.types"; // Already there, no change needed
```
