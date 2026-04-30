import { createAsyncThunk } from "@reduxjs/toolkit";
import { setRoom } from "./roomSlice";
import api from "../../services/api";
import { Store } from "../../store/store";

export const create = createAsyncThunk(
  "room/create",
  async (
    credentials: {
      roomName: string;
      mode: string;
      maxMembers: number;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const token = Store.getState().authentication.accessToken;
      const response = await api.post(
        `${import.meta.env.VITE_BASE_URL}/room/create`,
        credentials,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      dispatch(
        setRoom({
          room: response.data.room,
          inviteCode: response.data.inviteCode,
          loading: false,
        }),
      );

      return response.data;
    } catch (error) {
      rejectWithValue(error);
    }
  },
);

export const search = createAsyncThunk(
  "room/search",
  async (credential: { roomId: string }, { dispatch, rejectWithValue }) => {
    try {
      const token = Store.getState().authentication.accessToken;
      const response = await api.post(
        `${import.meta.env.VITE_BASE_URL}/room/search`,
        credential,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      dispatch(
        setRoom({
          room: response.data.room,
          inviteCode: null,
          loading: false,
        }),
      );

      return response.data;
    } catch (error) {
      rejectWithValue(error);
    }
  },
);

export const getRoomData = createAsyncThunk(
  "room/details",
  async (
    { page, limit }: { page: number; limit: number },
    { rejectWithValue },
  ) => {
    try {
      const token = Store.getState().authentication.accessToken;
      const response = await api.get(
        `${import.meta.env.VITE_BASE_URL}/room/get-room?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      rejectWithValue(error);
    }
  },
);
