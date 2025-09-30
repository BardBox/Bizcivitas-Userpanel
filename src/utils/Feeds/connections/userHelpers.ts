/**
 * User-related utility functions for connections
 * Consolidates duplicated logic across components
 */

/**
 * Safe fallback avatar URL
 */
export const FALLBACK_AVATAR_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOUI5Qjk5Ii8+CjxwYXRoIGQ9Ik0xMiAxNEM3LjU4MTcyIDE0IDQgMTcuNTgxNyA0IDIySDIwQzIwIDE3LjU4MTcgMTYuNDE4MyAxNCAxMiAxNFoiIGZpbGw9IiM5QjlCOTkiLz4KPC9zdmc+';

/**
 * Generates proper avatar URL from relative or absolute path
 * @param avatarPath - Avatar file path or URL
 * @returns Full avatar URL or fallback
 */
export const getAvatarUrl = (avatarPath?: string): string => {
  if (!avatarPath) return FALLBACK_AVATAR_URL;
  if (avatarPath.startsWith('http')) return avatarPath;

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  return `${baseUrl}/image/${avatarPath}`;
};

/**
 * Determines user membership type flags
 * @param membershipType - User's membership type string
 * @returns Object with membership type booleans
 */
export const getMembershipType = (membershipType?: string) => {
  const type = membershipType?.toLowerCase() || '';
  return {
    isCore: type.includes('core'),
    isFlagship: type.includes('flagship'),
    isPremium: type.includes('premium'),
    isBasic: !type.includes('core') && !type.includes('flagship') && !type.includes('premium'),
  };
};

/**
 * Formats user's full name with fallback
 * @param fname - First name
 * @param lname - Last name
 * @param fallback - Fallback text if no name provided
 * @returns Formatted full name
 */
export const formatUserName = (fname?: string, lname?: string, fallback = 'Unknown User'): string => {
  const fullName = `${fname || ''} ${lname || ''}`.trim();
  return fullName || fallback;
};

/**
 * Gets membership styling classes based on type
 * @param membershipType - User's membership type
 * @returns CSS classes for membership styling
 */
export const getMembershipStyling = (membershipType?: string) => {
  const { isCore, isFlagship } = getMembershipType(membershipType);

  return {
    borderGradient: isCore
      ? "bg-gradient-to-tr from-orange-500 via-red-500 to-pink-500"
      : isFlagship
      ? "bg-gradient-to-tr from-purple-500 via-blue-500 to-indigo-500"
      : "bg-gradient-to-tr from-blue-500 to-purple-500",

    badgeClasses: isCore
      ? 'bg-orange-100 text-orange-700'
      : isFlagship
      ? 'bg-purple-100 text-purple-700'
      : 'bg-blue-100 text-blue-700',

    displayName: membershipType || 'Member'
  };
};

/**
 * Formats date for connection display
 * @param dateString - ISO date string
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export const formatConnectionDate = (dateString: string, locale = 'en-US'): string => {
  try {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Determines if user should show crown indicator
 * @param membershipType - User's membership type
 * @returns Boolean indicating if crown should be shown
 */
export const shouldShowCrown = (membershipType?: string): boolean => {
  return getMembershipType(membershipType).isCore;
};