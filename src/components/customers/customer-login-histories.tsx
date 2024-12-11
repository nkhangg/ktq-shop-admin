'use client';
import { ApiSessions } from '@/api';
import { container } from '@/di/container';
import moment, { formatTime } from '@/instances/moment';
import { ICustomer, ISession } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import Table from '../lib/table/table';
import { IActionData, IColumn } from '../lib/table/type';
import CustomersBase, { ICustomersBaseProps } from './customers-base';
import { ActionIcon, Box, Button, Dialog, Text, Tooltip } from '@mantine/core';
import { IconLogout2 } from '@tabler/icons-react';
import { cn } from '@/utils/app';
import ActionColumn from '../lib/table/action-column';
import { useDisclosure } from '@mantine/hooks';
import { Api, ApiError } from '@/api/api';

export interface ICustomerLoginHistoriesProps extends ICustomersBaseProps {}

export default function CustomerLoginHistories(props: ICustomerLoginHistoriesProps) {
    const sessionApi = container.get(ApiSessions);

    const [params, setParams] = useState<Record<string, string | number>>({});

    const [chooses, setChooses] = useState<ISession[]>([]);

    const choosesRef = useRef<ISession[]>(chooses);

    const [opened, { toggle, close }] = useDisclosure(false);

    const [action, setAction] = useState<ISession | null>(null);

    const { data, isPending, refetch } = useQuery({
        queryFn: () => sessionApi.getSessionsByCustomer(props.id, params),
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
        if (!action) return;

        const payload = {
            id_session: action.id,
            id_customer: props.id,
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
                callback: () => logoutsMutation.mutate({ id_customer: props.id, sessions: chooses }),
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

    useEffect(() => {
        choosesRef.current = chooses;
    }, [chooses]);

    const handleCloseDialog = () => {
        close();

        setAction(null);
    };

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

    return (
        <CustomersBase {...props}>
            <Box pb={'xl'}>{table}</Box>

            <Dialog opened={opened} withCloseButton onClose={handleCloseDialog} size="lg" radius="md">
                <Text size="sm" mb="xs" fw={500}>
                    {`Logout session ID: ${action?.id}`}
                </Text>
                <div className="flex items-center justify-end w-full gap-3">
                    <Button size="xs" disabled={false} onClick={handleLogout}>
                        Ok
                    </Button>
                    <Button size="xs" disabled={false} color="red" onClick={handleCloseDialog}>
                        Close
                    </Button>
                </div>
            </Dialog>
        </CustomersBase>
    );
}
