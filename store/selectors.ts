import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Memoized selectors for better performance
export const selectMembersState = (state: RootState) => state.members;

export const selectMemberById = (memberId: string) =>
  createSelector(
    [selectMembersState],
    (membersState) => membersState.allMembers[memberId] || membersState.currentMember
  );

export const selectConnectionsArray = createSelector(
  [selectMembersState],
  (membersState) => membersState.connections
);

export const selectIsConnectedTo = (memberSlug: string) =>
  createSelector(
    [selectConnectionsArray],
    (connections) => connections.includes(memberSlug)
  );

export const selectMemberLoadingState = createSelector(
  [selectMembersState],
  (membersState) => membersState.loading
);

export const selectMemberErrorState = createSelector(
  [selectMembersState],
  (membersState) => membersState.error
);

export const selectCachedMembers = createSelector(
  [selectMembersState],
  (membersState) => Object.keys(membersState.cache.memberProfiles).map(slug => ({
    slug,
    member: membersState.cache.memberProfiles[slug].data,
    lastUpdated: membersState.cache.memberProfiles[slug].timestamp,
    isStale: Date.now() - membersState.cache.memberProfiles[slug].timestamp > membersState.cache.expiry
  }))
);

// Selector for dashboard - get all connected members
export const selectConnectedMembersForDashboard = createSelector(
  [selectMembersState],
  (membersState) => {
    return membersState.connections
      .map(connectionSlug => membersState.allMembers[connectionSlug])
      .filter(Boolean); // Remove undefined members
  }
);
