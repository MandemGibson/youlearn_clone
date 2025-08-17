import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface SummaryData {
  executiveSummary: string;
  keyPoints: string[];
  mainTopics: string[];
  conclusions: string[];
  actionItems?: string[];
  wordCount: number;
  readingTime: number;
}

interface SummaryState {
  data: SummaryData | null;
  loading: boolean;
  error: string | null;
  type: "brief" | "detailed" | "executive";
  generatedForNamespace: string | null;
}

const initialState: SummaryState = {
  data: null,
  loading: false,
  error: null,
  type: "brief",
  generatedForNamespace: null,
};

const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {
    setSummaryLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSummaryError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) state.loading = false;
    },
    setSummaryType: (state, action: PayloadAction<SummaryState["type"]>) => {
      state.type = action.payload;
    },
    setSummaryData: (state, action: PayloadAction<SummaryData | null>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSummaryNamespace: (state, action: PayloadAction<string>) => {
      state.generatedForNamespace = action.payload;
    },
    clearSummary: (state) => {
      state.data = null;
      state.generatedForNamespace = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setSummaryLoading,
  setSummaryError,
  setSummaryType,
  setSummaryData,
  setSummaryNamespace,
  clearSummary,
} = summarySlice.actions;

export const selectSummary = (state: RootState) => state.summary.data;
export const selectSummaryLoading = (state: RootState) => state.summary.loading;
export const selectSummaryError = (state: RootState) => state.summary.error;
export const selectSummaryType = (state: RootState) => state.summary.type;
export const selectSummaryNamespace = (state: RootState) =>
  state.summary.generatedForNamespace;

export default summarySlice.reducer;
