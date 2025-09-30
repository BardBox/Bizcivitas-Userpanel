import { configureStore } from "@reduxjs/toolkit";
import profileFormReducer from "./profileFormSlice";
import membersReducer from "./membersSlice";
import toastReducer from "./toastSlice";
import postsReducer from "./postsSlice";
import { baseApi } from "./api/baseApi";

export const store = configureStore({
  reducer: {
    profileForm: profileFormReducer,
    members: membersReducer,
    toast: toastReducer,
    posts: postsReducer,
    [baseApi.reducerPath]: baseApi.reducer, // RTK Query reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore RTK Query action types for non-serializable data
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          // Ignore RTK Query action types
          "api/executeQuery/pending",
          "api/executeQuery/fulfilled",
          "api/executeQuery/rejected",
        ],
      },
    }).concat(baseApi.middleware), // RTK Query middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
