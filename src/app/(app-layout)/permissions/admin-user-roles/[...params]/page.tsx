'use client';
export interface IALDetailRoleRootPageProps {
    params: { params: string[] };
}
import { ApiResources, ApiRoles } from '@/api';
import { Api, ApiError } from '@/api/api';
import ActionColumn from '@/components/lib/table/action-column';
import Table from '@/components/lib/table/table';
import { IActionData, IColumn, TRefTableActionFn } from '@/components/lib/table/type';
import { container } from '@/di/container';
import { useTitle } from '@/hooks';
import { formatTime } from '@/instances/moment';
import Routes from '@/instances/routes';
import { IResource } from '@/types';
import { buildColorWithMethod } from '@/utils/app';
import { Box, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function ALDetailRoleRootPage({
    params: {
        params: [id, name],
    },
}: IALDetailRoleRootPageProps) {
    useTitle('Resource of role ' + name);

    const resourceApi = container.get(ApiResources);
    const roleApi = container.get(ApiRoles);

    const [params, setParams] = useState<Record<string, string | number>>({});

    const [chooses, setChooses] = useState<IResource[]>([]);

    const [dataUpdate, setDataUpdate] = useState<IResource | null>(null);

    const choosesRef = useRef<IResource[]>(chooses);

    const router = useRouter();

    const refAction: TRefTableActionFn = useRef({});

    const [opened, { open, close }] = useDisclosure(false);

    const { data, isPending, refetch } = useQuery({
        queryKey: ['roles/resource[GET]', id, { ...params }],
        queryFn: () => resourceApi.resourceByRole(Number(id), params),
    });

    const deleteMutation = useMutation({
        mutationFn: (data: IResource[]) => roleApi.deleteResourceForRole(Number(id), data),
        mutationKey: ['roles/resource[DELETE]'],
        onSuccess(data) {
            Api.handle_response(data);
            setChooses([]);
            refetch();
        },
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
    });

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

    const handleClose = () => {
        close();

        setDataUpdate(null);
    };

    useEffect(() => {
        choosesRef.current = chooses;
    }, [chooses]);

    const actions = useMemo(() => {
        return [
            // {
            //     title: 'Active',
            //     callback: hiddenMultipleMuta.mutate,
            //     key: 'active',
            //     comfirmAction: true,
            //     disabled: chooses.length <= 0,
            //     comfirmOption: (data) => {
            //         return {
            //             title: `Are you want to active ${choosesRef.current.length}`,
            //         };
            //     },
            // },
            {
                title: 'Delete',
                callback: () => {
                    deleteMutation.mutate(chooses);
                },
                key: 'delete',
                comfirmAction: true,
                disabled: chooses.length <= 0,
                comfirmOption: (data) => {
                    return {
                        title: `Are you want to delete ${choosesRef.current.length}`,
                    };
                },
            },

            {
                title: 'Add',
                callback: () => {
                    router.replace(Routes.ROLE_RESOURCE({ id: Number(id), role_name: name }));
                },
                key: 'add',
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
                                messages={(_, data) => {
                                    return {
                                        delete: `Are you sure delete customer ${data.resource_name}`,
                                    };
                                }}
                                showEdit={false}
                                data={row}
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

    return <Box>{table}</Box>;
}
