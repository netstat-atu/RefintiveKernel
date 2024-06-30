import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    isOpen: false,
    type: "success",
    message: ""
};

export const alertSnackSlice = createSlice({
    name: 'alertSnack',
    initialState: initialValue,
    reducers: {
        openAlertSnack(state, action) {
            const { type, message } = action.payload;
            state.isOpen = true;
            state.type = type;
            state.message = message;
        },
        closeAlertSnack: () => initialValue,
    },
});

export const { openAlertSnack, closeAlertSnack } = alertSnackSlice.actions;

export default alertSnackSlice.reducer;
