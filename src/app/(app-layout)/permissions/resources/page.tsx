'use client';
import { ApiResources } from '@/api';
import { Api, ApiError } from '@/api/api';
import { TInput, TRefForm } from '@/components/lib/generate-form/type';
import ActionColumn from '@/components/lib/table/action-column';

import Table from '@/components/lib/table/table';
import { IActionData, IColumn, TRefTableActionFn } from '@/components/lib/table/type';
import ResourceRoleAccept from '@/components/resources/resource-role-accept';
import { container } from '@/di/container';
import { useTitle } from '@/hooks';
import { formatTime } from '@/instances/moment';
import Routes from '@/instances/routes';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { IResource } from '@/types';
import { buildColorWithMethod } from '@/utils/app';
import { ActionIcon, Box, Button, Modal, Text, Table as TB } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPencilMinus, IconUserCheck } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

export interface IALResourcesRootPageProps {}

export default function ALResourcesRootPage(props: IALResourcesRootPageProps) {
    useTitle('Resources');
    const resourcesApi = container.get(ApiResources);
    const [params, setParams] = useState<Record<string, string | number>>({});

    const [chooses, setChooses] = useState<IResource[]>([]);

    const [opened, { open, close }] = useDisclosure(false);

    const [clickedData, setClickedData] = useState<IResource | null>(null);

    const choosesRef = useRef<IResource[]>(chooses);

    const refAction: TRefTableActionFn = useRef({});

    const { data, isPending, refetch } = useQuery({
        queryKey: ['resources[GET]', { ...params }],
        queryFn: () => resourcesApi.getAll(params),
    });

    const deleteMutation = useMutation({
        mutationFn: (data: IResource[]) => resourcesApi.deleteResources(data),
        mutationKey: ['resources[DELETE]'],
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
            setChooses([]);
        },
    });

    const syncResourcesMutation = useMutation({
        mutationFn: () => resourcesApi.syncResources(),
        mutationKey: ['resources/sync-resources[POST]'],
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
            setChooses([]);
        },
    });

    const dispatch = useDispatch();

    const columns: IColumn<IResource>[] = [
        {
            key: 'id',
            title: 'ID',
            typeFilter: 'number',
        },
        {
            key: 'resource_code',
            title: 'Code',
            typeFilter: 'text',
        },

        {
            key: 'resource_name',
            title: 'Name',
            typeFilter: 'text',
        },
        {
            key: 'resource_method',
            title: 'Method',
            typeFilter: 'text',
            renderRow(row, _) {
                return (
                    <Box className="flex items-center justify-center">
                        <Text style={{ color: buildColorWithMethod(row) }} size="xs">
                            {row.resource_method}
                        </Text>
                    </Box>
                );
            },
        },
        {
            key: 'created_at',
            title: 'Created at',
            typeFilter: 'date',
            renderRow(row, _) {
                return <span>{formatTime(row.created_at)}</span>;
            },
        },
        {
            key: 'updated_at',
            title: 'Update at',
            typeFilter: 'datetime',
            renderRow(row, _) {
                return <span>{formatTime(row.updated_at)}</span>;
            },
        },
    ];

    useEffect(() => {
        choosesRef.current = chooses;
    }, [chooses]);

    const actions = useMemo(() => {
        return [
            {
                title: 'Delete',
                callback: () => {
                    dispatch(
                        addComfirm({
                            callback: () => deleteMutation.mutate(chooses),
                            title: 'Delete resources',
                            acceptLabel: 'Delete',
                            buttonProps: {
                                color: 'red',
                            },
                        }),
                    );
                },
                key: 'delete',
                disabled: chooses.length <= 0,
            },
            {
                title: 'Sync resources',
                callback: () => {
                    dispatch(addComfirm({ callback: syncResourcesMutation.mutate, title: 'Sync resources' }));
                },
                key: 'sync-resources',
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
                actionsOptions={{
                    actions,
                    loading: isPending,
                    selectProps: {
                        placeholder: 'Actions',
                        label: undefined,
                    },
                    refAction,
                }}
                rows={data?.data || []}
                withColumnBorders
                withTableBorder
                columns={columns}
                onParams={(data) => {
                    setParams(data);
                }}
                rowKey="id"
                actions={{
                    title: (
                        <div className="w-full flex items-center justify-center">
                            <span className="text-center">Action</span>
                        </div>
                    ),
                    body(row) {
                        return (
                            <ActionColumn
                                itemActions={[
                                    <ActionIcon
                                        onClick={() => {
                                            setClickedData(row);
                                            open();
                                        }}
                                        color="teal"
                                        size={'sm'}
                                    >
                                        <IconUserCheck style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                    </ActionIcon>,
                                ]}
                                data={row}
                                editOption={{
                                    url: Routes.DETAIL_RESOURCE(row),
                                    type: 'link',
                                }}
                                onSubmit={(action) => {
                                    if (action.key === 'delete') {
                                        deleteMutation.mutate([row]);
                                    }
                                }}
                            />
                        );
                    },
                }}
            />
        );
    }, [data, isPending, actions, refAction]);

    return (
        <Box>
            {table}

            {clickedData && (
                <ResourceRoleAccept
                    id={clickedData.id}
                    opened={opened}
                    close={() => {
                        close();
                        setClickedData(null);
                    }}
                />
            )}
        </Box>
    );
}
