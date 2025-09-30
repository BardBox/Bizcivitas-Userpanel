import { MemberProfileAPI } from "@/utils/Feeds/connections/memberProfileUtils";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export interface MemberState {
  currentMember: MemberProfileAPI | null;
  allMembers: Record<string, MemberProfileAPI>;
  connections: string[]; // Array of member IDs that user is connected to
  loading: {
    fetchMember: boolean;
    updateMember: boolean;
    createMember: boolean;
    fetchConnections: boolean;
  };
  error: {
    fetchMember: string | null;
    updateMember: string | null;
    createMember: string | null;
    fetchConnections: string | null;
  };
  lastUpdated: number | null;
  cache: {
    expiry: number; // Cache expiry time in ms
    memberProfiles: Record<
      string,
      { data: MemberProfileAPI; timestamp: number }
    >;
  };
}

const initialState: MemberState = {
  currentMember: null,
  allMembers: {},
  connections: [],
  loading: {
    fetchMember: false,
    updateMember: false,
    createMember: false,
    fetchConnections: false,
  },
  error: {
    fetchMember: null,
    updateMember: null,
    createMember: null,
    fetchConnections: null,
  },
  lastUpdated: null,
  cache: {
    expiry: 5 * 60 * 1000, // 5 minutes cache
    memberProfiles: {},
  },
};

// Async thunks for API calls
export const fetchMemberProfile = createAsyncThunk(
  "members/fetchProfile",
  async (slug: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { members: MemberState };
      const cached = state.members.cache.memberProfiles[slug];

      // Check if cached data is still valid
      if (
        cached &&
        Date.now() - cached.timestamp < state.members.cache.expiry
      ) {
        return { member: cached.data, fromCache: true };
      }

      // Make API call to fetch member profile
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL not configured");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/members/${slug}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch member: ${response.statusText}`);
      }

      const member: MemberProfileAPI = await response.json();
      return { member, fromCache: false };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch member"
      );
    }
  }
);

export const updateMemberProfile = createAsyncThunk(
  "members/updateProfile",
  async (
    memberData: Partial<MemberProfileAPI> & { id: string },
    { rejectWithValue }
  ) => {
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL not configured");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/members/${memberData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update member: ${response.statusText}`);
      }

      const updatedMember: MemberProfileAPI = await response.json();
      return updatedMember;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update member"
      );
    }
  }
);

export const createMemberProfile = createAsyncThunk(
  "members/createProfile",
  async (memberData: Omit<MemberProfileAPI, "id">, { rejectWithValue }) => {
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL not configured");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/members`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create member: ${response.statusText}`);
      }

      const newMember: MemberProfileAPI = await response.json();
      return newMember;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create member"
      );
    }
  }
);

export const fetchConnections = createAsyncThunk(
  "members/fetchConnections",
  async (userId: string, { rejectWithValue }) => {
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL not configured");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/connections`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch connections: ${response.statusText}`);
      }

      const connections: string[] = await response.json();
      return connections;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch connections"
      );
    }
  }
);

export const connectToMember = createAsyncThunk(
  "members/connect",
  async (
    { userId, memberSlug }: { userId: string; memberSlug: string },
    { rejectWithValue }
  ) => {
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL not configured");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/connect`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberSlug }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to connect: ${response.statusText}`);
      }

      return { memberSlug };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to connect"
      );
    }
  }
);

export const disconnectFromMember = createAsyncThunk(
  "members/disconnect",
  async (
    { userId, memberSlug }: { userId: string; memberSlug: string },
    { rejectWithValue }
  ) => {
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL not configured");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/disconnect`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberSlug }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to disconnect: ${response.statusText}`);
      }

      return { memberSlug };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to disconnect"
      );
    }
  }
);

// Slice
const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    clearCurrentMember: (state) => {
      state.currentMember = null;
    },
    clearErrors: (state) => {
      state.error = {
        fetchMember: null,
        updateMember: null,
        createMember: null,
        fetchConnections: null,
      };
    },
    setCacheExpiry: (state, action: PayloadAction<number>) => {
      state.cache.expiry = action.payload;
    },
    clearCache: (state) => {
      state.cache.memberProfiles = {};
    },
    // Optimistic updates for better UX
    optimisticUpdateMember: (
      state,
      action: PayloadAction<Partial<MemberProfileAPI> & { id: string }>
    ) => {
      const { id, ...updates } = action.payload;
      if (state.currentMember && state.currentMember.id === id) {
        state.currentMember = { ...state.currentMember, ...updates };
      }
      if (state.allMembers[id]) {
        state.allMembers[id] = { ...state.allMembers[id], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Member Profile
      .addCase(fetchMemberProfile.pending, (state) => {
        state.loading.fetchMember = true;
        state.error.fetchMember = null;
      })
      .addCase(fetchMemberProfile.fulfilled, (state, action) => {
        state.loading.fetchMember = false;
        state.currentMember = action.payload.member;
        state.allMembers[action.payload.member.id] = action.payload.member;
        state.lastUpdated = Date.now();

        // Cache the result if not from cache
        if (!action.payload.fromCache) {
          state.cache.memberProfiles[action.payload.member.id] = {
            data: action.payload.member,
            timestamp: Date.now(),
          };
        }
      })
      .addCase(fetchMemberProfile.rejected, (state, action) => {
        state.loading.fetchMember = false;
        state.error.fetchMember = action.payload as string;
      })

      // Update Member Profile
      .addCase(updateMemberProfile.pending, (state) => {
        state.loading.updateMember = true;
        state.error.updateMember = null;
      })
      .addCase(updateMemberProfile.fulfilled, (state, action) => {
        state.loading.updateMember = false;
        state.currentMember = action.payload;
        state.allMembers[action.payload.id] = action.payload;
        state.lastUpdated = Date.now();

        // Update cache
        state.cache.memberProfiles[action.payload.id] = {
          data: action.payload,
          timestamp: Date.now(),
        };
      })
      .addCase(updateMemberProfile.rejected, (state, action) => {
        state.loading.updateMember = false;
        state.error.updateMember = action.payload as string;
      })

      // Create Member Profile
      .addCase(createMemberProfile.pending, (state) => {
        state.loading.createMember = true;
        state.error.createMember = null;
      })
      .addCase(createMemberProfile.fulfilled, (state, action) => {
        state.loading.createMember = false;
        state.currentMember = action.payload;
        state.allMembers[action.payload.id] = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(createMemberProfile.rejected, (state, action) => {
        state.loading.createMember = false;
        state.error.createMember = action.payload as string;
      })

      // Fetch Connections
      .addCase(fetchConnections.pending, (state) => {
        state.loading.fetchConnections = true;
        state.error.fetchConnections = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.loading.fetchConnections = false;
        state.connections = action.payload;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.loading.fetchConnections = false;
        state.error.fetchConnections = action.payload as string;
      })

      // Connect to Member
      .addCase(connectToMember.fulfilled, (state, action) => {
        if (!state.connections.includes(action.payload.memberSlug)) {
          state.connections.push(action.payload.memberSlug);
        }
      })

      // Disconnect from Member
      .addCase(disconnectFromMember.fulfilled, (state, action) => {
        state.connections = state.connections.filter(
          (id) => id !== action.payload.memberSlug
        );
      });
  },
});

export const {
  clearCurrentMember,
  clearErrors,
  setCacheExpiry,
  clearCache,
  optimisticUpdateMember,
} = membersSlice.actions;

export default membersSlice.reducer;
