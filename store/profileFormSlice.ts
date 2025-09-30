import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearState } from './localStorage';

interface ProfileFormState {
  basic: Record<string, any>;
  location: Record<string, any>;
  business: Record<string, any>;
  terms: Record<string, any>;
}

const initialState: ProfileFormState = {
  basic: {},
  location: {},
  business: {},
  terms: {},
};

const profileFormSlice = createSlice({
  name: 'profileForm',
  initialState,
  reducers: {
    setBasic(state, action: PayloadAction<Record<string, any>>) {
      state.basic = { ...state.basic, ...action.payload };
    },
    setLocation(state, action: PayloadAction<Record<string, any>>) {
      state.location = { ...state.location, ...action.payload };
    },
    setBusiness(state, action: PayloadAction<Record<string, any>>) {
      state.business = { ...state.business, ...action.payload };
    },
    setTerms(state, action: PayloadAction<Record<string, any>>) {
      state.terms = { ...state.terms, ...action.payload };
    },
    resetForm(state) {
      state.basic = {};
      state.location = {};
      state.business = {};
      state.terms = {};
    },
    clearPersistedData() {
      clearState();
      return {
        basic: {},
        location: {},
        business: {},
        terms: {},
      };
    },
  },
});

export const { setBasic, setLocation, setBusiness, setTerms, resetForm, clearPersistedData } = profileFormSlice.actions;
export default profileFormSlice.reducer;
