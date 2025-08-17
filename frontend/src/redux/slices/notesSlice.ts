import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface Note {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  color: string;
  tags: string[];
  isPinned: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  sourceRef?: {
    page?: number;
    chapter?: string;
    section?: string;
  } | null;
  type: "manual" | "highlight" | "summary" | "question" | "todo";
  priority: "low" | "medium" | "high";
}

interface NotesState {
  notes: Note[];
  totalNotes: number;
  categories: string[];
  autoSummary: string;
  loading: boolean;
  error: string | null;
  generatedForNamespace: string | null;
}

const initialState: NotesState = {
  notes: [],
  totalNotes: 0,
  categories: [],
  autoSummary: "",
  loading: false,
  error: null,
  generatedForNamespace: null,
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setNotesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setNotesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) state.loading = false;
    },
    setNotesData: (
      state,
      action: PayloadAction<{
        notes: Note[];
        totalNotes: number;
        categories: string[];
        autoSummary: string;
      }>
    ) => {
      state.notes = action.payload.notes;
      state.totalNotes = action.payload.totalNotes;
      state.categories = action.payload.categories;
      state.autoSummary = action.payload.autoSummary;
      state.loading = false;
      state.error = null;
    },
    setNotesNamespace: (state, action: PayloadAction<string>) => {
      state.generatedForNamespace = action.payload;
    },
    clearNotes: (state) => {
      state.notes = [];
      state.totalNotes = 0;
      state.categories = [];
      state.autoSummary = "";
      state.generatedForNamespace = null;
      state.loading = false;
      state.error = null;
    },
    addNote: (state, action: PayloadAction<Note>) => {
      state.notes.unshift(action.payload);
      state.totalNotes += 1;
    },
    updateNote: (state, action: PayloadAction<Note>) => {
      const idx = state.notes.findIndex((n) => n.id === action.payload.id);
      if (idx !== -1) state.notes[idx] = action.payload;
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter((n) => n.id !== action.payload);
      state.totalNotes = state.notes.length;
    },
  },
});

export const {
  setNotesLoading,
  setNotesError,
  setNotesData,
  setNotesNamespace,
  clearNotes,
  addNote,
  updateNote,
  deleteNote,
} = notesSlice.actions;

export const selectNotes = (state: RootState) => state.notes.notes;
export const selectNotesLoading = (state: RootState) => state.notes.loading;
export const selectNotesError = (state: RootState) => state.notes.error;
export const selectNotesNamespace = (state: RootState) =>
  state.notes.generatedForNamespace;
export const selectNotesMeta = (state: RootState) => ({
  totalNotes: state.notes.totalNotes,
  categories: state.notes.categories,
  autoSummary: state.notes.autoSummary,
});

export default notesSlice.reducer;
