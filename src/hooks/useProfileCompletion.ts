import { useMemo } from 'react';
import type { User, FullProfile } from '@/store/api/userApi';

interface ProfileCompletionCategory {
  completed: number;
  total: number;
}

interface ProfileCompletion {
  percentage: number;
  completed: number;
  total: number;
  completedByCategory: Record<string, ProfileCompletionCategory>;
}

export function useProfileCompletion(
  user: User | undefined,
  profile: FullProfile | undefined
): ProfileCompletion {
  return useMemo(() => {
    const categories: Record<string, ProfileCompletionCategory> = {
      'Personal': { completed: 0, total: 4 },
      'Professional': { completed: 0, total: 3 },
      'Bio': { completed: 0, total: 4 },
      'Travel': { completed: 0, total: 3 },
    };

    // Personal
    if (user?.fname) categories['Personal'].completed++;
    if (user?.lname) categories['Personal'].completed++;
    if (user?.email) categories['Personal'].completed++;
    if (user?.mobile || user?.contactNo) categories['Personal'].completed++;

    // Professional
    if (profile?.professionalDetails?.companyName) categories['Professional'].completed++;
    if (profile?.professionalDetails?.industry) categories['Professional'].completed++;
    if (profile?.myBio?.yearsInBusiness) categories['Professional'].completed++;

    // Bio
    if (profile?.myBio?.hobbiesAndInterests) categories['Bio'].completed++;
    if (profile?.myBio?.myBurningDesireIsTo) categories['Bio'].completed++;
    if (profile?.myBio?.mySkills && profile.myBio.mySkills.length > 0) categories['Bio'].completed++;
    if (profile?.myBio?.myAsk && profile.myBio.myAsk.length > 0) categories['Bio'].completed++;

    // Travel
    if (profile?.travelDiary?.myFootprints && profile.travelDiary.myFootprints.length > 0) categories['Travel'].completed++;
    if (profile?.travelDiary?.businessBucketList && profile.travelDiary.businessBucketList.length > 0) categories['Travel'].completed++;
    if (profile?.travelDiary?.dealsOnWheels && profile.travelDiary.dealsOnWheels.length > 0) categories['Travel'].completed++;

    const totalCompleted = Object.values(categories).reduce((sum, cat) => sum + cat.completed, 0);
    const totalFields = Object.values(categories).reduce((sum, cat) => sum + cat.total, 0);

    return {
      percentage: Math.round((totalCompleted / totalFields) * 100),
      completed: totalCompleted,
      total: totalFields,
      completedByCategory: categories,
    };
  }, [user, profile]);
}