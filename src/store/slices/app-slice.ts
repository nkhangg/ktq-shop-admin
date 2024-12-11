import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AppState {
    user: null | IUser;
}

const initialState: AppState = {
    user: null,
};

export const counterSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        addUser: (state, action: PayloadAction<IUser>) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
        },
    },
});

export const { addUser, clearUser } = counterSlice.actions;

export default counterSlice.reducer;
