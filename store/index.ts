import { configureStore } from "@reduxjs/toolkit";
import profileFormReducer from "./profileFormSlice";
import membersReducer from "./membersSlice";
import toastReducer from "./toastSlice";
import postsReducer from "./postsSlice";
import likesReducer from "./slices/likeSlice";
import { baseApi } from "./api/baseApi";

export const store = configureStore({
  reducer: {
    profileForm: profileFormReducer,
    members: membersReducer,
    toast: toastReducer,
    posts: postsReducer,
    likes: likesReducer,
    [baseApi.reducerPath]: baseApi.reducer, // RTK Query reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable immutability check for better performance
      immutableCheck: false,
      // Disable serializability check for better performance
      serializableCheck: false,
    }).concat(baseApi.middleware), // RTK Query middleware
  // Enable devtools only in development
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
