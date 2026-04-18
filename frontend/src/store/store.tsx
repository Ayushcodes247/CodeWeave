import { configureStore } from "@reduxjs/toolkit";
import authenticationReducer from "../features/authentication/authSlice";

export const Store = configureStore({
    reducer : {
        authentication : authenticationReducer
    }
});

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;