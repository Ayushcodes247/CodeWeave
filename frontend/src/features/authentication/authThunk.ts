import { createAsyncThunk } from "@reduxjs/toolkit";
import { setAuthentication, clearAuthenticationState } from "./authSlice";
import api from "../../services/api";
import { Store } from "../../store/store";

export const loginUser = createAsyncThunk(
  "authorization/login",
  async (credentials: { email: string; password: string }, { dispatch }) => {
    const response = await api.post(
      `${import.meta.env.VITE_BASE_URL}/auth/login`,
      credentials,
    );
    dispatch(
      setAuthentication({
        user: response.data.user,
        accessToken: response.data.accessToken,
        isAuthenticated: true,
        loading: false,
        authChecked: true,
      }),
    );

    return response.data;
  },
);

export const registerUser = createAsyncThunk(
  "authorization/register",
  async (
    credentials: {
      username: string;
      email: string;
      password: string;
      gender: string;
    },
    { dispatch },
  ) => {
    const response = await api.post(
      `${import.meta.env.VITE_BASE_URL}/auth/register`,
      credentials,
    );
    dispatch(
      setAuthentication({
        user: response.data.user,
        accessToken: response.data.accessToken,
        isAuthenticated: true,
        loading: false,
        authChecked: true,
      }),
    );

    return response.data;
  },
);

export const autoLogin = createAsyncThunk(
  "authorization/autologin",
  async (_, { dispatch }) => {
    const response = await api.get(
      `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
      {
        withCredentials: true,
      },
    );

    const newAccessToken = response.data.accessToken;

    const userResponse = await api.get(
      `${import.meta.env.VITE_BASE_URL}/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${newAccessToken}`,
        },
      },
    );

    dispatch(
      setAuthentication({
        user: userResponse.data.user,
        accessToken: newAccessToken,
        isAuthenticated: true,
        loading: false,
        authChecked: true,
      }),
    );

    api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
    return userResponse.data;
  },
);

export const logoutUserOne = createAsyncThunk(
  "authorization/logout-one",
  async (_, { dispatch }) => {
    const token = Store.getState().authentication.accessToken;
    const { status, data } = await api.post(
      `${import.meta.env.VITE_BASE_URL}/auth/logout-one`,
      {},
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (status === 200) {
      dispatch(clearAuthenticationState());
    }

    return data;
  },
);
