import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const startTimer = createAsyncThunk('timer/startTimer', async (second) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, second * 1000);
    });
});

const initialState = {
    timerComplete: false,
    isLoading: false,
};

const timerSlice = createSlice({
    name: 'timer',
    initialState,
    reducers: {
        resetTimerComplete: (state) => {
            state.timerComplete = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(startTimer.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(startTimer.fulfilled, (state) => {
                state.isLoading = false;
            });
    },
});

export const { resetTimerComplete } = timerSlice.actions;

export default timerSlice.reducer;
