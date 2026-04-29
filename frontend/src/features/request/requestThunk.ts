import { createAsyncThunk } from "@reduxjs/toolkit";
import { setRequest } from "./requestSlice";
import api from "../../services/api";
import { Store } from "../../store/store";

export const request = createAsyncThunk(
  "request/create",
  async (data: { roomId: string; inviteCode: string }, { dispatch }) => {
    const token = Store.getState().authentication.accessToken;
    const response = await api.post(
      `${import.meta.env.VITE_BASE_URL}/request`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    dispatch(
      setRequest({
        requestData: response.data.requestData,
        loading: false,
      }),
    );

    return response.data;
  },
);

export const ownerRequests = createAsyncThunk(
  "request/owner-requests",
  async (
    { page, limit }: { page: number; limit: number },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const token = Store.getState().authentication.accessToken;

      const response = await api.get(
        `${import.meta.env.VITE_BASE_URL}/request/all-general?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      dispatch(
        setRequest({
          requestData: response.data.requests,
          loading: false,
        }),
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const requesterRequest = createAsyncThunk(
  "request/requester-request",
  async ({ page, limit }: { page: number; limit: number }) => {
    const token = Store.getState().authentication.accessToken;
    const response = await api.get(
      `${import.meta.env.VITE_BASE_URL}/request/all-requester?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  },
);

export const acceptRequest = createAsyncThunk(
  "request/accept",
  async (data: { roomId: string; uid: string }) => {
    const token = Store.getState().authentication.accessToken;
    const response = await api.patch(
      `${import.meta.env.VITE_BASE_URL}/request/accept`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  },
);

export const rejectRequest = createAsyncThunk(
  "request/reject",
  async (data: { roomId: string; uid: string }) => {
    const token = Store.getState().authentication.accessToken;
    const response = await api.patch(
      `${import.meta.env.VITE_BASE_URL}/request/reject`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  },
);
