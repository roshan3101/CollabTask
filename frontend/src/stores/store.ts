import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "./slices/auth.slice"
import CommonReducer from "./slices/common.slice"
import OrganizationReducer from "./slices/organization.slice"

export const store = configureStore({
    reducer: {
        auth: AuthReducer,
        common: CommonReducer,
        organizations: OrganizationReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch