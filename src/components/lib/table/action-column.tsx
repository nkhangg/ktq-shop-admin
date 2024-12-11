'use client';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Box, Button, Dialog, Text, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Url } from 'next/dist/shared/lib/router/router';
import Link from 'next/link';
import * as React from 'react';
import { useDispatch } from 'react-redux';

export interface IActionColumnProps<R> {
    data: R;
    loading?: boolean;
    editOption?: {
        type?: 'button' | 'link';
        url?: string | Url;
        callback?: () => void;
    };
    labelDel?: (data: R) => string;
    labelEdit?: (data: R) => string;
    onSubmit?: (action: IActionColData<R>) => void;
    onClose?: () => void;
    messages?: { edit?: string; delete?: string } | ((action: IActionColData<R>, data: R) => { edit?: string; delete?: string });
}

export interface IActionColData<R> {
    key: 'delete' | 'edit';
    data: R;
}

export default function ActionColumn<R>({
    labelEdit,
    labelDel,
    onSubmit,
    onClose,
    data,
    loading,
    editOption = {
        type: 'button',
    },
    messages = {
        delete: 'Are you sure delete this item',
        edit: 'Are you want to update this item',
    },
}: IActionColumnProps<R>) {
    const [action, setAction] = React.useState<IActionColData<R> | null>(null);

    const dispatch = useDispatch();

    const handleClose = () => {
        setAction(null);
    };

    const handleSubmit = (action: IActionColData<R> | null) => {
        if (!action) return;

        if (onSubmit) {
            onSubmit(action);
        }

        handleClose();
    };

    return (
        <>
            <Box className="flex items-center justify-center gap-2">
                <Tooltip opened={!!labelEdit} label={labelEdit ? labelEdit(data) : null}>
                    <ActionIcon
                        component={editOption.type === 'link' ? Link : undefined}
                        href={editOption.type === 'link' && editOption.url ? editOption.url : ''}
                        onClick={() => {
                            if (editOption.type === 'link') return;

                            if (editOption?.callback) {
                                editOption.callback();
                            } else {
                                dispatch(
                                    addComfirm({
                                        callback: () => handleSubmit({ key: 'edit', data }),
                                        title:
                                            (messages && action && (typeof messages === 'function' ? messages(action, data)[action.key] : messages[action.key])) ??
                                            'Are you want to update?',
                                        onClose: handleClose,
                                        acceptLabel: 'Submit',
                                    }),
                                );
                            }
                        }}
                        size="sm"
                    >
                        <IconEdit style={{ width: '70%', height: '70%' }} stroke={1.5} color="white" />
                    </ActionIcon>
                </Tooltip>
                <Tooltip opened={!!labelDel} label={labelDel ? labelDel(data) : undefined}>
                    <ActionIcon
                        onClick={() => {
                            dispatch(
                                addComfirm({
                                    callback: () => handleSubmit({ key: 'delete', data }),
                                    title:
                                        (messages && action && (typeof messages === 'function' ? messages(action, data)[action.key] : messages[action.key])) ??
                                        'Are you sure delete?',
                                    onClose: handleClose,
                                    acceptLabel: 'Delete',
                                    buttonProps: {
                                        color: 'red',
                                    },
                                }),
                            );
                        }}
                        size="sm"
                        color="red"
                    >
                        <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} color="white" />
                    </ActionIcon>
                </Tooltip>
            </Box>
            {/* <Dialog opened={opened} withCloseButton onClose={handleClose} size="lg" radius="md">
                <Text size="sm" mb="xs" fw={500}>
                    {messages && action && (typeof messages === 'function' ? messages(action, data)[action.key] : messages[action.key])}
                </Text>
                <div className="flex items-center justify-end w-full gap-3">
                    <Button size="xs" disabled={loading} onClick={handleSubmit}>
                        Ok
                    </Button>
                    <Button size="xs" disabled={loading} color="red" onClick={handleClose}>
                        Close
                    </Button>
                </div>
            </Dialog> */}
        </>
    );
}
