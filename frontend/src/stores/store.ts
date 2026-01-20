import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "./slices/auth.slice"
import CommonReducer from "./slices/common.slice"

export const store = configureStore({
    reducer: {
        auth: AuthReducer,
        common: CommonReducer
    },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch