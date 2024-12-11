// app/layout.tsx
'use client';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Dialog, Group, LoadingOverlay, Modal, Text } from '@mantine/core';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useDisclosure } from '@mantine/hooks';
import { clearComfirm } from '@/store/slices/comfirm-slice';

export default function RootConfigLayout({ children }: { children: React.ReactNode }) {
    const isFetching = useIsFetching();
    const isMutating = useIsMutating();
    const [opened, { toggle, close }] = useDisclosure(false);

    const { callback, title, onClose, acceptLabel, buttonProps } = useSelector((state: RootState) => state.comfirm);

    const dispatch = useDispatch();

    const handleClose = () => {
        dispatch(clearComfirm());
        close();

        if (onClose) {
            onClose();
        }
    };

    const handleCallBack = () => {
        if (callback) {
            callback();
        }

        handleClose();
    };

    const comfirmViewMemo = useMemo(() => {
        return (
            <Modal opened={opened} onClose={handleClose} title={title} zIndex={99999}>
                <Group mt="lg" justify="flex-end">
                    <Button disabled={isFetching + isMutating > 0} onClick={handleClose} variant="default">
                        Cancel
                    </Button>
                    <Button disabled={isFetching + isMutating > 0} onClick={handleCallBack} color="blue" {...buttonProps}>
                        {acceptLabel}
                    </Button>
                </Group>
            </Modal>
        );
    }, [callback, title, isFetching, isMutating, toggle]);

    useEffect(() => {
        if (callback) {
            toggle();
        }
    }, [callback]);

    return (
        <>
            {children}
            <ToastContainer />
            <LoadingOverlay visible={isFetching + isMutating > 0} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
            {comfirmViewMemo}
        </>
    );
}
