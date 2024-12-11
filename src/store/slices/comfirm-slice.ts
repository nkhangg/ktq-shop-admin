import { ButtonProps } from '@mantine/core';
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface IComfirmState {
    callback: Function | null;
    onClose?: Function;
    title: string;
    isOpen?: boolean;
    acceptLabel?: string;
    buttonProps?: Pick<ButtonProps, 'color'>;
}

const initialState: Partial<IComfirmState> = {
    callback: null,
    title: 'Are you sure execute this action?',
    isOpen: false,
    acceptLabel: 'Ok',
    buttonProps: {},
};

export const comfirmSlice = createSlice({
    name: 'comfirm-slice',
    initialState,
    reducers: {
        addComfirm: (state, action: PayloadAction<IComfirmState>) => {
            state.callback = action.payload.callback;
            state.title = action.payload.title;
            state.onClose = action.payload.onClose;
            state.isOpen = true;
            state.acceptLabel = action.payload.acceptLabel ?? initialState.acceptLabel;
            state.buttonProps = action.payload.buttonProps ?? initialState.buttonProps;
        },
        clearComfirm: (state) => {
            return {
                ...initialState,
            };
        },
    },
});

export const { addComfirm, clearComfirm } = comfirmSlice.actions;

export default comfirmSlice.reducer;
