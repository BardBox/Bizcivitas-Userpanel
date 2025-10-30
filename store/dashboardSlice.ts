import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type DateRange = "15days" | "3months" | "6months" | "tilldate";
export type ChartType = "bizconnect" | "bizwin" | "meetups" | "visitor";

interface DashboardState {
  // Selected date range for each chart
  bizconnectRange: DateRange;
  bizwinRange: DateRange;
  meetupsRange: DateRange;
  visitorRange: DateRange;

  // Active chart in carousel (0-3)
  activeChartIndex: number;

  // User's community ID for fetching meetings
  userCommunityId: string | null;

  // Expanded sections
  suggestedMatchesExpanded: boolean;
}

const initialState: DashboardState = {
  bizconnectRange: "15days",
  bizwinRange: "15days",
  meetupsRange: "15days",
  visitorRange: "15days",
  activeChartIndex: 0,
  userCommunityId: null,
  suggestedMatchesExpanded: false,
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setBizconnectRange: (state, action: PayloadAction<DateRange>) => {
      state.bizconnectRange = action.payload;
    },
    setBizwinRange: (state, action: PayloadAction<DateRange>) => {
      state.bizwinRange = action.payload;
    },
    setMeetupsRange: (state, action: PayloadAction<DateRange>) => {
      state.meetupsRange = action.payload;
    },
    setVisitorRange: (state, action: PayloadAction<DateRange>) => {
      state.visitorRange = action.payload;
    },
    setActiveChartIndex: (state, action: PayloadAction<number>) => {
      state.activeChartIndex = action.payload;
    },
    setUserCommunityId: (state, action: PayloadAction<string>) => {
      state.userCommunityId = action.payload;
    },
    toggleSuggestedMatches: (state) => {
      state.suggestedMatchesExpanded = !state.suggestedMatchesExpanded;
    },
    setChartRange: (
      state,
      action: PayloadAction<{ chartType: ChartType; range: DateRange }>
    ) => {
      const { chartType, range } = action.payload;
      switch (chartType) {
        case "bizconnect":
          state.bizconnectRange = range;
          break;
        case "bizwin":
          state.bizwinRange = range;
          break;
        case "meetups":
          state.meetupsRange = range;
          break;
        case "visitor":
          state.visitorRange = range;
          break;
      }
    },
  },
});

export const {
  setBizconnectRange,
  setBizwinRange,
  setMeetupsRange,
  setVisitorRange,
  setActiveChartIndex,
  setUserCommunityId,
  toggleSuggestedMatches,
  setChartRange,
} = dashboardSlice.actions;

// Selectors
export const selectBizconnectRange = (state: RootState) =>
  state.dashboard.bizconnectRange;
export const selectBizwinRange = (state: RootState) =>
  state.dashboard.bizwinRange;
export const selectMeetupsRange = (state: RootState) =>
  state.dashboard.meetupsRange;
export const selectVisitorRange = (state: RootState) =>
  state.dashboard.visitorRange;
export const selectActiveChartIndex = (state: RootState) =>
  state.dashboard.activeChartIndex;
export const selectUserCommunityId = (state: RootState) =>
  state.dashboard.userCommunityId;
export const selectSuggestedMatchesExpanded = (state: RootState) =>
  state.dashboard.suggestedMatchesExpanded;

export default dashboardSlice.reducer;
