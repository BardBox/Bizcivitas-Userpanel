/**
 * Utility function to convert relative image paths to absolute URLs
 * for Next.js Image component compatibility
 * Based on mobile app logic: if not https, prepend baseURL + /image/
 */
export const getAbsoluteImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return "/images/favicon.svg";

  // If it's a local public path, return as is
  if (imagePath.startsWith("/")) {
    return imagePath;
  }

  // If it's already an absolute URL starting with http/https, return as is
  if (imagePath.startsWith("https://") || imagePath.startsWith("http://")) {
    // If it's from icon-library.com, return our default avatar instead
    if (imagePath.includes("icon-library.com")) {
      return "/images/favicon.svg";
    }
    return imagePath;
  }

  // For relative paths, use the backend URL from environment
  let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

  // Auto-upgrade to HTTPS if on client-side and page is HTTPS to avoid Mixed Content
  if (typeof window !== "undefined" && window.location.protocol === "https:" && backendUrl.startsWith("http://")) {
    backendUrl = backendUrl.replace("http://", "https://");
  }

  return `${backendUrl}/image/${imagePath}`;
};
