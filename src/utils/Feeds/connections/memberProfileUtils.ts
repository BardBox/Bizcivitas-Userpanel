// Member Profile API interface and utilities for connections

export interface MemberProfileAPI {
  id: string;
  name: string;
  email?: string;
  membershipType?: string;
  business?: {
    name: string;
    description?: string;
  };
  contact?: {
    professional?: string;
    personal?: string;
    email: string;
    website?: string;
  };
}

// Utility functions for member profile operations
export const memberProfileUtils = {
  // Format member name with fallback
  formatMemberName: (profile: MemberProfileAPI): string => {
    return profile.name || 'Unknown Member';
  },

  // Get business name with fallback
  getBusinessName: (profile: MemberProfileAPI): string => {
    return profile.business?.name || 'No Business Listed';
  },

  // Get contact email with fallback
  getContactEmail: (profile: MemberProfileAPI): string => {
    return profile.contact?.email || profile.email || 'No Email Available';
  },

  // Check if profile has complete business information
  hasCompleteBusinessInfo: (profile: MemberProfileAPI): boolean => {
    return !!(profile.business?.name && profile.business?.description);
  },

  // Check if profile has contact information
  hasContactInfo: (profile: MemberProfileAPI): boolean => {
    return !!(profile.contact?.professional || profile.contact?.personal || profile.contact?.email);
  },

  // Get membership type with formatting
  getMembershipType: (profile: MemberProfileAPI): string => {
    return profile.membershipType || 'Standard Member';
  }
};

export default memberProfileUtils;