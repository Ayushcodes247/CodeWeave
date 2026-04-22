import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RoomState {
  room: object | null;
  inviteCode: string | null;
  loading: boolean;
}

const initialState: RoomState = {
  room: null,
  inviteCode: null,
  loading: false,
};

const RoomSlice = createSlice({
  name: "Room",
  initialState,
  reducers: {
    setRoom(state, action: PayloadAction<RoomState>) {
      state.room = action.payload.room;
      state.inviteCode = action.payload.inviteCode;
    },
    clearRoom(state) {
      state.room = null;
      state.inviteCode = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setRoom, clearRoom, setLoading } = RoomSlice.actions;

export default RoomSlice.reducer;
