import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthenticationState {
  user: object | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthenticationState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
};

const AuthenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    setAuthentication(state, action: PayloadAction<AuthenticationState>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    clearAuthenticationState(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setAuthentication, clearAuthenticationState, setLoading } =
  AuthenticationSlice.actions;
export default AuthenticationSlice.reducer;
