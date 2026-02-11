/**
 * Formats a date/timestamp into relative time (e.g., "2 minutes ago", "1 hour ago")
 * For times >= 24 hours, shows the actual date
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted relative time string or actual date
 */
export function getTimeAgo(date: string | Date | number): string {
  const now = new Date();
  const past = new Date(date);

  // Check if date is valid
  if (isNaN(past.getTime())) {
    return "Just now";
  }

  const diffInMs = now.getTime() - past.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);

  // For times less than 24 hours, show relative time
  if (diffInSeconds < 10) {
    return "Just now";
  } else if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}min ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}hr ago`;
  } else {
    // For 24 hours or more, show the actual date
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[past.getMonth()];
    const day = past.getDate();
    const year = past.getFullYear();
    const currentYear = now.getFullYear();

    // If same year, don't show year
    if (year === currentYear) {
      return `${month} ${day}`;
    } else {
      return `${month} ${day}, ${year}`;
    }
  }
}

/**
 * React hook to get dynamically updating relative time
 * Updates every minute for times < 1 hour, every hour otherwise
 * @param date - Date string, Date object, or timestamp
 * @returns Current relative time string
 */
export function useTimeAgo(date: string | Date | number | undefined): string {
  const [timeAgo, setTimeAgo] = React.useState(() =>
    date ? getTimeAgo(date) : "Just now"
  );

  React.useEffect(() => {
    if (!date) {
      setTimeAgo("Just now");
      return;
    }

    // Initial update
    setTimeAgo(getTimeAgo(date));

    // Determine update interval based on age
    const past = new Date(date);
    const diffInMs = new Date().getTime() - past.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    // Update every 10 seconds for recent times (< 1 minute)
    // Update every minute for times < 1 hour
    // Update every hour for older times
    let interval: number;
    if (diffInMs < 60 * 1000) {
      interval = 10 * 1000; // 10 seconds
    } else if (diffInHours < 1) {
      interval = 60 * 1000; // 1 minute
    } else {
      interval = 60 * 60 * 1000; // 1 hour
    }

    const timer = setInterval(() => {
      setTimeAgo(getTimeAgo(date));
    }, interval);

    return () => clearInterval(timer);
  }, [date]);

  return timeAgo;
}

// Add React import at top
import React from "react";
