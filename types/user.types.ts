// User and Profile Type Definitions
// Centralized type definitions for User-related data structures

/**
 * Community information associated with a user
 */
export interface Community {
  communityName: string;
  region: string;
  _id: string;
}

/**
 * Core Group information
 */
export interface CoreGroup {
  id: string;
  name: string;
}

/**
 * User skill item with endorsement
 */
export interface UserSkillItem {
  _id: string;
  name: string;
  score: number;
  endorsedByMe?: boolean;
}

/**
 * Professional Details
 */
export interface ProfessionalDetails {
  classification?: string;
  companyAddress?: string;
  companyName?: string;
  directNumber?: string;
  gstRegisteredState?: string;
  industry?: string;
  membershipStatus?: string;
  myBusiness?: string;
  renewalDueDate?: string;
  business?: string;
  businessSubcategory?: string;
  companyLogo?: string;
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessCountry?: string;
}

/**
 * Address structure
 */
export interface Address {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: number;
}

/**
 * Contact Details
 */
export interface ContactDetails {
  email?: string;
  mobileNumber?: string;
  isEmailVerified?: boolean;
  website?: string;
  socialNetworkLinks?: Array<any>;
}

/**
 * My Bio information
 */
export interface MyBio {
  mySkills?: string[];
  myAsk?: string[];
  myGives?: string[];
  tags?: string[];
  hobbiesAndInterests?: string;
  cityOfResidence?: string;
  myBurningDesireIsTo?: string;
  myKeyToSuccess?: string;
  previousTypesOfJobs?: string;
  somethingNoOneHereKnowsAboutMe?: string;
  yearsInBusiness?: number;
  yearsInThatCity?: number;
}

/**
 * Travel Diary
 */
export interface TravelDiary {
  businessBucketList?: string[];
  dealsOnWheels?: string[];
  dreamDestination?: string;
  myFootprints?: string[];
}

/**
 * Business Needs
 */
export interface BusinessNeeds {
  current?: string[];
  future?: string[];
}

/**
 * Weekly Presentation
 */
export interface WeeklyPresentation {
  title?: string;
  description?: string;
  presentationDate?: string;
}

/**
 * Visibility Settings
 */
export interface VisibilitySettings {
  professionalDetails?: boolean;
}

/**
 * User Profile (nested in User object)
 */
export interface UserProfile {
  professionalDetails?: ProfessionalDetails;
  addresses?: {
    address?: Address;
  };
}

/**
 * Main User Interface
 * Represents a user in the system
 */
export interface User {
  _id?: string;
  id?: string; // Some APIs return 'id' instead of '_id'
  fname: string;
  lname: string;
  email: string;
  avatar?: string;
  role?: string;
  mobile?: number;
  contactNo?: number; // From connections API
  username?: string;
  gender?: string;
  membershipType?: string;
  membershipStatus?: boolean;
  renewalDate?: string;
  paymentSummary?: any;
  website?: string;
  community?: Community | null;
  profile?: UserProfile;

  // Additional fields from actual API response (flattened)
  classification?: string | null;
  companyName?: string | null;
  myBusiness?: string | null;
  industry?: string | null;
  city?: string | null;
  country?: string | null;
  state?: string | null;
  business?: string | null;
  businessSubcategory?: string;
  region?: string;
  joiningDate?: string; // Date when user joined the platform

  // Connections data (basic - see connection.types.ts for detailed)
  connections?: Array<{
    _id: string;
    user?: {
      _id: string;
      name: string;
      avatar?: string;
    };
    sender?: string;
    receiver?: string;
    isAccepted: boolean;
    createdAt?: string;
    updatedAt?: string;
  }>;
}

/**
 * Full User Profile (detailed profile information)
 * Used for profile pages and detailed user information
 */
export interface FullProfile {
  _id: string;
  contactDetails?: ContactDetails;
  addresses?: {
    address?: Address;
    billing?: Address;
  };
  myBio?: MyBio;
  professionalDetails?: ProfessionalDetails;
  travelDiary?: TravelDiary;
  businessNeeds?: BusinessNeeds;
  community?: {
    id: string;
    name: string;
    image?: string;
  };
  coreGroup?: CoreGroup;
  visibility?: VisibilitySettings;
  billingAddress?: Address;
  businessAddress?: Address;
  mySkillItems?: UserSkillItem[];
  weeklyPresentation?: WeeklyPresentation;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

/**
 * User API Response types
 */
export type UserApiResponse = ApiResponse<User>;
export type FullProfileApiResponse = ApiResponse<FullProfile>;
export type UsersApiResponse = ApiResponse<User[]>;
