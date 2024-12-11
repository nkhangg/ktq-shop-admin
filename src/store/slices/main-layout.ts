import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface IMainLayoutState {
    title: string | null;
}

const initialState: IMainLayoutState = {
    title: null,
};

export const counterSlice = createSlice({
    name: 'main-layout',
    initialState,
    reducers: {
        pushTitle: (state, action: PayloadAction<string | null>) => {
            state.title = action.payload;
        },
    },
});

export const { pushTitle } = counterSlice.actions;

export default counterSlice.reducer;
