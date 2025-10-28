import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  _id?: string;
  id?: string;
  fname?: string;
  lname?: string;
  email?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Initialize state from localStorage if available
const getUserFromStorage = (): User | null => {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    const userData = JSON.parse(storedUser);
    // Handle different user data structures
    if (userData._id || userData.id) {
      return userData;
    }

    // Try to get from nested objects
    const userFromNested =
      userData.auth?.user || userData.data?.user || userData;
    return userFromNested._id || userFromNested.id ? userFromNested : null;
  } catch (e) {
    console.error("Failed to parse user data from storage:", e);
    return null;
  }
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  isAuthenticated: !!getUserFromStorage(),
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      // Update localStorage
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("user");
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.clear(); // Clear all localStorage items
      }
    },
  },
});

export const { setUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
