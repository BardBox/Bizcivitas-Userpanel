"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface MentionLinkProps {
  username: string;
  userId?: string;
  children: React.ReactNode;
}

/**
 * Smart link component that resolves username to user profile
 * If userId is provided, links directly. Otherwise, fetches user by username first.
 */
export default function MentionLink({ username, userId, children }: MentionLinkProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Check if this mention is the logged-in user (by ID or name)
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const me = JSON.parse(storedUser);
        const myId = (me._id || me.id || "").toString();
        const myName = `${me.fname || ""} ${me.lname || ""}`.trim().toLowerCase();

        const isMe =
          (userId && myId && userId.toString() === myId) ||
          (myName && username.toLowerCase() === myName);

        if (isMe) {
          router.push("/feeds/myprofile");
          return;
        }
      }
    } catch {}

    // If we already have the user ID, navigate directly
    if (userId) {
      router.push(`/feeds/connections/${userId}?from=mention`);
      return;
    }

    // Otherwise, look up user by username first
    console.log(`🔍 No userId, looking up username: ${username}`);
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("❌ No auth token found");
        alert("Please log in to view user profiles");
        return;
      }

      // For multi-word names like "Deven Oza", search for first name only
      // Backend search works better with single words
      const searchTerm = username.includes(' ') ? username.split(' ')[0] : username;
      console.log(`🔍 Using search term: "${searchTerm}" (from "${username}")`);

      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      console.log(`📡 Fetching from: ${BACKEND_URL}/users/search?keyword=${searchTerm}`);

      const response = await axios.get(`${BACKEND_URL}/users/search`, {
        params: { keyword: searchTerm },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📦 API Response:", response.data);
      const users = (response.data as any)?.data || [];
      console.log(`👥 Found ${users.length} users:`, users.map((u: any) => ({ username: u.username, fname: u.fname, lname: u.lname })));

      if (users.length === 0) {
        console.error(`❌ No users found for: ${username}`);
        alert(`User @${username} not found`);
        return;
      }

      // Try multiple matching strategies:
      console.log(`🔍 Trying to match "${username}" against ${users.length} users`);

      // 1. Exact full name match (BEST - for @FirstName LastName)
      let user = users.find((u: any) => {
        const fullName = `${u.fname || ''} ${u.lname || ''}`.trim().toLowerCase();
        return fullName === username.toLowerCase();
      });
      if (user) console.log(`✅ Strategy 1 (exact full name): Found ${user.fname} ${user.lname}`);

      // 2. Exact username match
      if (!user) {
        user = users.find((u: any) => u.username?.toLowerCase() === username.toLowerCase());
        if (user) console.log(`✅ Strategy 2 (exact username): Found ${user.fname} ${user.lname}`);
      }

      // 3. Username starts with the typed name
      if (!user) {
        user = users.find((u: any) => u.username?.toLowerCase().startsWith(username.toLowerCase()));
        if (user) console.log(`✅ Strategy 3 (username starts with): Found ${user.fname} ${user.lname}`);
      }

      // 4. First name matches
      if (!user) {
        user = users.find((u: any) => u.fname?.toLowerCase() === username.toLowerCase());
        if (user) console.log(`✅ Strategy 4 (fname match): Found ${user.fname} ${user.lname}`);
      }

      // 5. Last name matches
      if (!user) {
        user = users.find((u: any) => u.lname?.toLowerCase() === username.toLowerCase());
        if (user) console.log(`✅ Strategy 5 (lname match): Found ${user.fname} ${user.lname}`);
      }

      // 6. Full name contains the typed name
      if (!user) {
        user = users.find((u: any) => {
          const fullName = `${u.fname || ''} ${u.lname || ''}`.toLowerCase();
          return fullName.includes(username.toLowerCase());
        });
        if (user) console.log(`✅ Strategy 6 (full name contains): Found ${user.fname} ${user.lname}`);
      }

      // 7. Just take the first result (search already filtered relevant users)
      if (!user) {
        console.log(`⚠️ No perfect match, using first result:`, users[0]);
        user = users[0];
        if (user) console.log(`✅ Strategy 7 (first result): Using ${user.fname} ${user.lname}`);
      }

      console.log(`🎯 Final selected user:`, user);

      const resolvedId = user?._id || user?.id;

      if (user && resolvedId) {
        router.push(`/feeds/connections/${resolvedId}?from=mention`);
      } else {
        console.error(`❌ Could not resolve user`, user);
        alert(`Could not find user @${username}`);
      }
    } catch (error) {
      console.error("❌ Failed to fetch user:", error);
      alert(`Error looking up user @${username}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className="text-blue-600 font-semibold hover:underline cursor-pointer"
      style={isLoading ? { opacity: 0.6, cursor: "wait" } : {}}
    >
      {children}
    </a>
  );
}
