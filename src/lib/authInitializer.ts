import { store } from "../../store/store";
import { setUser } from "../../store/authSlice";

export function initializeAuth() {
  if (typeof window === "undefined") return;

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      let user = userData;

      // Handle nested user objects
      if (!user._id && !user.id) {
        user = userData.auth?.user || userData.data?.user || userData;
      }

      // Only dispatch if we have a valid user ID
      if (user._id || user.id) {
        store.dispatch(setUser(user));
      } else {
        console.warn("No valid user ID found in stored data");
      }
    } else {
    }
  } catch (error) {
    console.error("Error initializing auth:", error);
  }
}
