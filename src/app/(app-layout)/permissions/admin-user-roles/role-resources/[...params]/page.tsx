'use client';
import { ApiResources, ApiRoles } from '@/api';
import { Api, ApiError } from '@/api/api';
import Table from '@/components/lib/table/table';
import { IActionData, IColumn, TRefTableActionFn } from '@/components/lib/table/type';
import { container } from '@/di/container';
import { useTitle } from '@/hooks';
import { formatTime } from '@/instances/moment';
import Routes from '@/instances/routes';
import { IResource, IRole } from '@/types';
import { buildColorWithMethod } from '@/utils/app';
import { Box, Text } from '@mantine/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface IALRoleResourceRootPageProps {
    params: {
        params: string[];
    };
}

export default function ALRoleResourceRootPage({
    params: {
        params: [role_id, name],
    },
}: IALRoleResourceRootPageProps) {
    useTitle('Role resources of ' + name);

    const resourceApi = container.get(ApiResources);
    const rolesApi = container.get(ApiRoles);

    const [params, setParams] = useState<Record<string, string | number>>({});

    const [chooses, setChooses] = useState<IResource[]>([]);

    const choosesRef = useRef<IResource[]>(chooses);

    const refAction: TRefTableActionFn = useRef({});

    const router = useRouter();

    const { data, isPending, refetch } = useQuery({
        queryKey: ['resource/ignore-roles[GET]', role_id, { ...params }],
        queryFn: () => resourceApi.resourceIgnoreByRole(Number(role_id), params),
    });

    const { mutate } = useMutation({
        mutationFn: ({ id, data }: { id: IRole['id']; data: IResource[] }) => rolesApi.addResourceForRole(id, data),
        mutationKey: ['resource/roles[POST]'],
        onSuccess(data) {
            Api.handle_response(data);
            router.replace(Routes.DETAIL_ROLE_RESOURCES({ id: Number(role_id), role_name: name }));
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

    useEffect(() => {
        choosesRef.current = chooses;
    }, [chooses]);

    const actions = useMemo(() => {
        return [
            {
                title: 'Add resources',
                callback: () => {
                    mutate({ id: Number(role_id), data: chooses });
                },
                key: 'add-resource-for-this-role',
                comfirmAction: true,
                disabled: chooses.length <= 0,
                comfirmOption: (data) => {
                    return {
                        title: `Are you want to add ${choosesRef.current.length} resources`,
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
            />
        );
    }, [data, isPending, actions, refAction]);

    return <Box>{table}</Box>;
}
