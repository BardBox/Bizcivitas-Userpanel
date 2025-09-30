import { configureStore, createSlice } from "@reduxjs/toolkit";
import membersReducer from "./membersSlice";
import toastReducer from "./toastSlice";
import postsReducer from "./postsSlice";
import { baseApi } from "./api/baseApi";
// Import latest events API
import "./api/eventsApi.latest";

// Placeholder slice to prevent empty reducer error
const placeholderSlice = createSlice({
  name: "placeholder",
  initialState: { value: 0 },
  reducers: {},
});

// Basic store configuration
export const store = configureStore({
  reducer: {
    placeholder: placeholderSlice.reducer,
    members: membersReducer,
    toast: toastReducer,
    posts: postsReducer,
    // Add API reducer
    [baseApi.reducerPath]: baseApi.reducer,
  },
  // Add API middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
