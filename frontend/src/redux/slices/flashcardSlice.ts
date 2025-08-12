import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

interface FlashcardState {
  flashcards: Flashcard[];
  loading: boolean;
  error: string | null;
  generatedForNamespace: string | null;
}

const flashcardSlice = createSlice({
  name: "flashcard",
  initialState: {
    flashcards: [],
    loading: false,
    error: null,
    generatedForNamespace: null,
  } as FlashcardState,
  reducers: {
    setFlashCards: (state, action: PayloadAction<Flashcard[]>) => {
      state.flashcards = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setGeneratedForNamespace: (state, action: PayloadAction<string>) => {
      state.generatedForNamespace = action.payload;
    },
    clearFlashCards: (state) => {
      state.flashcards = [];
      state.generatedForNamespace = null;
      state.error = null;
    },
    shuffleFlashCards: (state) => {
      state.flashcards = [...state.flashcards].sort(() => Math.random() - 0.5);
    },
  },
});

export const {
  setFlashCards,
  setLoading,
  setError,
  setGeneratedForNamespace,
  clearFlashCards,
  shuffleFlashCards,
} = flashcardSlice.actions;

export const selectFlashCards = (state: RootState) =>
  state.flashcard.flashcards;
export const selectFlashCardLoading = (state: RootState) =>
  state.flashcard.loading;
export const selectFlashCardError = (state: RootState) => state.flashcard.error;
export const selectGeneratedForNamespace = (state: RootState) =>
  state.flashcard.generatedForNamespace;

export default flashcardSlice.reducer;
