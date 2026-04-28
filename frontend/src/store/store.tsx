import { configureStore } from "@reduxjs/toolkit";
import authenticationReducer from "../features/authentication/authSlice";
import roomReducer from "../features/rooms/roomSlice";
import requestReducer from "../features/request/requestSlice";

export const Store = configureStore({
    reducer : {
        authentication : authenticationReducer,
        room : roomReducer,
        request : requestReducer
    }
});

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;