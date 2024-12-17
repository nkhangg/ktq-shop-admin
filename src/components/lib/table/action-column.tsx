'use client';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { ActionIcon, Box, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Url } from 'next/dist/shared/lib/router/router';
import Link from 'next/link';
import { Fragment, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

export interface IActionColumnProps<R> {
    data: R;
    loading?: boolean;
    editOption?: {
        type?: 'button' | 'link';
        url?: string | Url;
        callback?: () => void;
    };
    itemActions?: JSX.Element[];
    disabledDel?: boolean;
    confirm?: boolean;
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
    confirm = true,
    data,
    itemActions,
    loading,
    editOption = {
        type: 'button',
    },
    messages = {
        delete: 'Are you sure delete this item',
        edit: 'Are you want to update this item',
    },
    disabledDel = false,
}: IActionColumnProps<R>) {
    const [action, setAction] = useState<IActionColData<R> | null>(null);

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

    const items = useMemo(() => {
        return [
            <Tooltip opened={!!labelEdit} label={labelEdit ? labelEdit(data) : null}>
                <ActionIcon
                    component={editOption.type === 'link' ? Link : undefined}
                    href={editOption.type === 'link' && editOption.url ? editOption.url : ''}
                    onClick={() => {
                        if (editOption.type === 'link') return;

                        if (editOption?.callback) {
                            editOption.callback();
                        } else {
                            if (confirm) {
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
                            } else {
                                handleSubmit({ key: 'edit', data });
                            }
                        }
                    }}
                    size="sm"
                >
                    <IconEdit style={{ width: '70%', height: '70%' }} stroke={1.5} color="white" />
                </ActionIcon>
            </Tooltip>,
            ...(itemActions || []),
            <Tooltip opened={!!labelDel} label={labelDel ? labelDel(data) : undefined}>
                <ActionIcon
                    disabled={disabledDel}
                    onClick={() => {
                        if (confirm) {
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
                        } else {
                            handleSubmit({ key: 'delete', data });
                        }
                    }}
                    size="sm"
                    color="red"
                >
                    <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} color="white" />
                </ActionIcon>
            </Tooltip>,
        ];
    }, [itemActions]);

    return (
        <>
            <Box className="flex items-center justify-center gap-2">
                {items.map((item, index) => (
                    <Fragment key={index}>{item}</Fragment>
                ))}
            </Box>
        </>
    );
}
