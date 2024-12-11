'use client';
import { ApiSessions } from '@/api';
import { Api, ApiError } from '@/api/api';
import Table from '@/components/lib/table/table';
import { IActionData, IColumn } from '@/components/lib/table/type';
import { container } from '@/di/container';
import moment, { formatTime } from '@/instances/moment';
import { RootState } from '@/store';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { ICustomer, ISession } from '@/types';
import { cn } from '@/utils/app';
import { ActionIcon, Box, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLogout2 } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface IALHistoriesRootPageProps {}

export default function ALHistoriesRootPage(props: IALHistoriesRootPageProps) {
    const sessionApi = container.get(ApiSessions);

    const { user } = useSelector((state: RootState) => state.app);

    const dispatch = useDispatch();

    const [params, setParams] = useState<Record<string, string | number>>({});

    const [chooses, setChooses] = useState<ISession[]>([]);

    const choosesRef = useRef<ISession[]>(chooses);

    const [opened, { toggle, close }] = useDisclosure(false);

    const [action, setAction] = useState<ISession | null>(null);

    const { data, isPending, refetch } = useQuery({
        queryFn: () => sessionApi.getSessionsAdminCurrent(params),
        queryKey: ['customers/sessions[GET]', { ...params }],
    });

    const logoutMutation = useMutation({
        mutationKey: ['customers/sessions/logout[PUT]', chooses],
        mutationFn: (data: { id_session: ISession['id']; id_customer: ICustomer['id'] }) => sessionApi.logoutCustomer(data),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
            handleCloseDialog();
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
            handleCloseDialog();
        },
    });

    const logoutsMutation = useMutation({
        mutationKey: ['customers/sessions/logouts[PUT]', chooses],
        mutationFn: (data: { sessions: ISession[]; id_customer: ICustomer['id'] }) => sessionApi.logoutsCustomer(data),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
            handleCloseDialog();
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
            setChooses([]);
        },
    });

    const handleLogout = () => {
        if (!action || !user) return;

        const payload = {
            id_session: action.id,
            id_customer: user?.id,
        };

        logoutMutation.mutate(payload);
    };

    const columns: IColumn<ISession>[] = [
        {
            key: 'id',
            title: 'ID',
            typeFilter: 'number',
        },
        {
            key: 'user_agent',
            title: 'User agent',
            typeFilter: 'text',
        },
        {
            key: 'payload',
            title: 'Payload',
            typeFilter: 'text',
            renderRow(row, _) {
                return <span>{JSON.stringify(row.payload)}</span>;
            },
        },
        {
            key: 'expires_at',
            title: 'Expires at',
            typeFilter: 'date',
            renderRow(row, _) {
                return <span>{formatTime(row.expires_at)}</span>;
            },
        },
        {
            key: 'live',
            title: 'Live',
            typeFilter: {
                type: 'select',
                data: ['Live', 'Off'],
            },
            renderRow(row) {
                return (
                    <Box className="flex items-center justify-center">
                        <div
                            className={cn(`w-3 aspect-square rounded-full`, {
                                ['bg-green-700']: row.live,
                                ['bg-red-700']: !row.live,
                            })}
                        ></div>
                    </Box>
                );
            },
        },
        {
            key: 'created_at',
            title: 'Created at',
            typeFilter: 'date',
            renderRow(row, _) {
                return <span>{moment(row.created_at).format()}</span>;
            },
        },
        {
            key: 'updated_at',
            title: 'Update at',
            typeFilter: 'datetime',
            renderRow(row, _) {
                return <span>{moment(row.updated_at).format()}</span>;
            },
        },
    ];

    const actions = useMemo(() => {
        return [
            {
                title: 'Logout sessions',
                callback: () => {
                    if (!user) return;

                    logoutsMutation.mutate({ id_customer: user?.id, sessions: chooses });
                },
                key: 'logout-sessions',
                comfirmAction: true,
                disabled: chooses.length <= 0,
                comfirmOption: (data) => {
                    return {
                        title: `Are you want to logout sessions ${choosesRef.current.length}`,
                    };
                },
            },
        ] as IActionData[];
    }, [chooses]);

    const table = useMemo(() => {
        return (
            <Table
                striped
                highlightOnHover
                showLoading={false}
                styleDefaultHead={{
                    justifyContent: 'flex-start',
                    width: 'fit-content',
                }}
                onChooses={setChooses}
                options={{
                    total: data?.total,
                    perPage: data?.per_page,
                    currentPage: data?.current_page,
                    lastPage: data?.last_page,
                    from: data?.from,
                    to: data?.to,
                }}
                rows={data?.data || []}
                withColumnBorders
                withTableBorder
                columns={columns}
                onParams={(data) => {
                    setParams(data);
                }}
                rowKey="id"
                actionsOptions={{
                    actions,
                    loading: isPending,
                    selectProps: {
                        placeholder: 'Actions',
                        label: undefined,
                    },
                }}
                actions={{
                    title: (
                        <div className="w-full flex items-center justify-center">
                            <span className="text-center">Action</span>
                        </div>
                    ),
                    body(row) {
                        return (
                            <Box className="flex items-center justify-center">
                                <Tooltip hidden={!row.live} label="Logout this session">
                                    <ActionIcon
                                        onClick={() => {
                                            setAction(row);
                                            toggle();

                                            dispatch(
                                                addComfirm({
                                                    callback: () => {
                                                        setAction(row);
                                                        handleLogout();
                                                    },
                                                    title: 'Are you want to logout this session',
                                                    onClose: handleCloseDialog,
                                                }),
                                            );
                                        }}
                                        disabled={!row.live}
                                        color="red"
                                    >
                                        <IconLogout2 style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                    </ActionIcon>
                                </Tooltip>
                            </Box>
                        );
                    },
                }}
            />
        );
    }, [data, isPending, actions]);

    useEffect(() => {
        choosesRef.current = chooses;
    }, [chooses]);

    const handleCloseDialog = () => {
        close();

        setAction(null);
    };

    return <Box>{table}</Box>;
}
