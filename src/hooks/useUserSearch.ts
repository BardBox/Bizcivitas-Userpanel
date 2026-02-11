import { useState, useEffect } from "react";
import axios from "axios";

interface UserSearchResult {
  id: string;
  fname: string;
  lname: string;
  avatar: string | null;
  username: string | null;
}

interface UseUserSearchReturn {
  users: UserSearchResult[];
  loading: boolean;
  error: string | null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEBOUNCE_DELAY = 300; // ms

export function useUserSearch(query: string): UseUserSearchReturn {
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🔎 useUserSearch hook called with query:", query);

    // Don't search if query is empty or too short
    if (!query || query.length < 2) {
      console.log("⏭️ Query too short, skipping search");
      setUsers([]);
      setLoading(false);
      return;
    }

    // Debounce the search
    const timeoutId = setTimeout(async () => {
      console.log("⏱️ Debounce complete, starting search for:", query);
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.warn("❌ No authentication token found");
          setUsers([]);
          setLoading(false);
          return;
        }

        const url = `${BACKEND_URL}/users/search`;
        console.log("🌐 Making API call to:", url);

        const response = await axios.get(url, {
          params: {
            keyword: query, // Only send keyword - it searches across ALL fields
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("✅ API Response:", response.data);

        const data = response.data?.data || [];

        // Transform to match our interface
        const transformedUsers = data.map((user: any) => ({
          id: user.id || user._id,
          fname: user.fname || "",
          lname: user.lname || "",
          avatar: user.avatar,
          username: user.username,
        }));

        console.log("👥 Transformed users:", transformedUsers);
        setUsers(transformedUsers);
      } catch (err: any) {
        console.error("❌ User search error:", err);
        setError(err.response?.data?.message || err.message || "Failed to search users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_DELAY);

    // Cleanup
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { users, loading, error };
}
