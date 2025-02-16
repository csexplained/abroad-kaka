"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Usertype from "@/types/user.type";

const initialState: Usertype = {
    mobileno: "",
    email: "",
    fullname: "",
    refreshToken: "",
    address: "",
    city: "",
    pinCode: "",
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<Usertype>) {
            return action.payload;
        },
        clearUser(state) {
            Object.assign(state, initialState);
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
