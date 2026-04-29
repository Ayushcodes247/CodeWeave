import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RequestState {
  requestData: object | null | Array<object>;
  loading: boolean;
}

const initialState: RequestState = {
  requestData: null,
  loading: false,
};

const RequestSlice = createSlice({
  name: "request",
  initialState,
  reducers: {
    setRequest(state, action: PayloadAction<RequestState>) {
      state.requestData = action.payload.requestData;
    },
    clearRequest(state) {
      state.requestData = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setRequest, clearRequest, setLoading } = RequestSlice.actions;

export default RequestSlice.reducer;
