import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import flashcardReducer from "./slices/flashcardSlice";

//Create persist config
const persistConfig = {
  key: "root",
  storage,
};

//Combine reducers
const rootReducer = combineReducers({
  flashcard: flashcardReducer,
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
