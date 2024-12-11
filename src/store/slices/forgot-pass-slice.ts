import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CounterState {
    countdown: number;
    email: string | null;
}

const initialState: CounterState = {
    countdown: 30,
    email: null,
};

export const counterSlice = createSlice({
    name: 'forgotPass',
    initialState,
    reducers: {
        increment: (state) => {
            state.countdown += 1;
        },
        decrement: (state) => {
            state.countdown -= 1;
        },
        incrementByAmount: (state, action: PayloadAction<number>) => {
            state.countdown += action.payload;
        },
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        clearForgotStore: (state) => {
            return { ...initialState };
        },
    },
});

export const { increment, decrement, incrementByAmount, setEmail, clearForgotStore } = counterSlice.actions;

export default counterSlice.reducer;
