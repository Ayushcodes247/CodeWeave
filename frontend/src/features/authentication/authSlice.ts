import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IUser {
  _id: string;
  username: string;
  email: string;
  profilePic: string;
}

interface AuthenticationState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  authChecked: boolean;
}

const initialState: AuthenticationState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  authChecked: false,
};

const AuthenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
    setAuthentication(state, action: PayloadAction<AuthenticationState>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.authChecked = true;
    },
    clearAuthenticationState(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.authChecked = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setAuthentication, clearAuthenticationState, setLoading } =
  AuthenticationSlice.actions;
export default AuthenticationSlice.reducer;
