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
