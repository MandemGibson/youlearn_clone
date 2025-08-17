import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import flashcardReducer from "./slices/flashcardSlice";
import summaryReducer from "./slices/summarySlice";
import quizReducer from "./slices/quizSlice";
import chapterReducer from "./slices/chapterSlice";
import notesReducer from "./slices/notesSlice";

//Create persist config
const persistConfig = {
  key: "root",
  storage,
};

//Combine reducers
const rootReducer = combineReducers({
  flashcard: flashcardReducer,
  summary: summaryReducer,
  quiz: quizReducer,
  chapters: chapterReducer,
  notes: notesReducer,
});

//Wrap root reducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

//Create store with persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

//Create persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
