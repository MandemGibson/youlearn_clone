import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
}

interface QuizState {
  questions: QuizQuestion[];
  loading: boolean;
  error: string | null;
  difficulty: "mixed" | "easy" | "medium" | "hard";
  generatedForNamespace: string | null;
}

const initialState: QuizState = {
  questions: [],
  loading: false,
  error: null,
  difficulty: "mixed",
  generatedForNamespace: null,
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    setQuizLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setQuizError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) state.loading = false;
    },
    setQuizDifficulty: (
      state,
      action: PayloadAction<QuizState["difficulty"]>
    ) => {
      state.difficulty = action.payload;
    },
    setQuizQuestions: (state, action: PayloadAction<QuizQuestion[]>) => {
      state.questions = action.payload;
      state.loading = false;
      state.error = null;
    },
    setQuizNamespace: (state, action: PayloadAction<string>) => {
      state.generatedForNamespace = action.payload;
    },
    clearQuiz: (state) => {
      state.questions = [];
      state.generatedForNamespace = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setQuizLoading,
  setQuizError,
  setQuizDifficulty,
  setQuizQuestions,
  setQuizNamespace,
  clearQuiz,
} = quizSlice.actions;

export const selectQuizQuestions = (state: RootState) => state.quiz.questions;
export const selectQuizLoading = (state: RootState) => state.quiz.loading;
export const selectQuizError = (state: RootState) => state.quiz.error;
export const selectQuizDifficulty = (state: RootState) => state.quiz.difficulty;
export const selectQuizNamespace = (state: RootState) =>
  state.quiz.generatedForNamespace;

export default quizSlice.reducer;
