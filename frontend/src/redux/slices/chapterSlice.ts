import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface Chapter {
  id: number;
  title: string;
  summary: string;
  content: string;
  keyPoints: string[];
  wordCount: number;
  readingTime: number;
  subsections?: { title: string; summary: string }[];
}

interface ChapterState {
  chapters: Chapter[];
  totalChapters: number;
  documentStructure: string;
  navigationTips: string[];
  loading: boolean;
  error: string | null;
  generatedForNamespace: string | null;
}

const initialState: ChapterState = {
  chapters: [],
  totalChapters: 0,
  documentStructure: "",
  navigationTips: [],
  loading: false,
  error: null,
  generatedForNamespace: null,
};

const chapterSlice = createSlice({
  name: "chapters",
  initialState,
  reducers: {
    setChapterLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setChapterError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) state.loading = false;
    },
    setChapterData: (
      state,
      action: PayloadAction<{
        chapters: Chapter[];
        totalChapters: number;
        documentStructure: string;
        navigationTips: string[];
      }>
    ) => {
      state.chapters = action.payload.chapters;
      state.totalChapters = action.payload.totalChapters;
      state.documentStructure = action.payload.documentStructure;
      state.navigationTips = action.payload.navigationTips;
      state.loading = false;
      state.error = null;
    },
    setChaptersNamespace: (state, action: PayloadAction<string>) => {
      state.generatedForNamespace = action.payload;
    },
    clearChapters: (state) => {
      state.chapters = [];
      state.totalChapters = 0;
      state.documentStructure = "";
      state.navigationTips = [];
      state.generatedForNamespace = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setChapterLoading,
  setChapterError,
  setChapterData,
  setChaptersNamespace,
  clearChapters,
} = chapterSlice.actions;

export const selectChapters = (state: RootState) => state.chapters.chapters;
export const selectChapterLoading = (state: RootState) =>
  state.chapters.loading;
export const selectChapterError = (state: RootState) => state.chapters.error;
export const selectChapterNamespace = (state: RootState) =>
  state.chapters.generatedForNamespace;
export const selectChapterMeta = (state: RootState) => ({
  totalChapters: state.chapters.totalChapters,
  documentStructure: state.chapters.documentStructure,
  navigationTips: state.chapters.navigationTips,
});

export default chapterSlice.reducer;
