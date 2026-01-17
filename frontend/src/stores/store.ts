import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "./slices/auth.slice"

export const store = configureStore({
    reducer: {
        auth: AuthReducer
    },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch