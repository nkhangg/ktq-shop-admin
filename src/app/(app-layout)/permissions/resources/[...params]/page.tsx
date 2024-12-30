'use client';
import { Api, ApiError } from '@/api/api';
import ApiResourcePermissions from '@/api/resource-permissions';
import { GenerateForm } from '@/components/lib/generate-form';
import { TInput } from '@/components/lib/generate-form/type';
import ActionColumn from '@/components/lib/table/action-column';
import ActiveColumn from '@/components/lib/table/active-column';
import Table from '@/components/lib/table/table';
import { IActionData, IColumn } from '@/components/lib/table/type';
import { container } from '@/di/container';
import { useTitle } from '@/hooks';
import { useAdminUsersSelectData } from '@/hooks/admin-users';
import { usePermissionSelectData } from '@/hooks/permissions';
import Routes from '@/instances/routes';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { IAdminUser, IPermission, IResource, IResourcePermission } from '@/types';
import { buildColorWithPermission } from '@/utils/app';
import { ActionIcon, Box, Chip, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLink } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import capitalize from 'capitalize';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
export interface IALDetailResourcesRootPageProps {
    params: { params: string[] };
}

export default function ALDetailResourcesRootPage({
    params: {
        params: [id],
    },
}: IALDetailResourcesRootPageProps) {
    useTitle('Detail Resources');

    const resourcePermissionsApi = container.get(ApiResourcePermissions);

    const [params, setParams] = useState<Record<string, string | number>>({});

    const [chooses, setChooses] = useState<IResourcePermission[]>([]);

    const choosesRef = useRef<IResourcePermission[]>(chooses);

    const [opened, { toggle, close }] = useDisclosure(false);

    const dispatch = useDispatch();

    const { adminUsersSelectData } = useAdminUsersSelectData();
    const { permissionsDataSelect } = usePermissionSelectData();

    const { data, isPending, refetch } = useQuery({
        queryFn: () => resourcePermissionsApi.getByResourceId(Number(id), params),
        queryKey: ['resource-permissions/[GET]', { ...params }, id],
    });

    const deleteMutation = useMutation({
        mutationFn: (id: IResourcePermission['id']) => resourcePermissionsApi.deleteResourcePermission(id, { resource_id: Number(id) }),
        mutationKey: ['resource-permissions[DELETE]'],
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
            setChooses([]);
            close();
        },
    });

    const addMutation = useMutation({
        mutationFn: (data: { admin_user_id: IAdminUser['id']; permission_id: IPermission['id'] }) =>
            resourcePermissionsApi.createResourcePermission({ resource_id: Number(id), ...data }),
        mutationKey: ['resource-permissions[POST]'],
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
            setChooses([]);
            close();
        },
    });

    const columns: IColumn<IResourcePermission>[] = [
        {
            key: 'id',
            title: 'ID',
            typeFilter: 'number',
        },
        {
            key: 'adminUser',
            title: 'Username',
            renderRow(row, _) {
                return <span>{row.adminUser.username}</span>;
            },
        },
        {
            key: 'adminUser',
            title: 'Email',
            renderRow(row, _) {
                return <span>{row.adminUser.email}</span>;
            },
        },
        {
            key: 'adminUser',
            title: 'Active',
            renderRow(row, _) {
                return <ActiveColumn active={row.adminUser.is_active} />;
            },
        },
        {
            key: 'adminUser',
            title: 'Role',
            renderRow({ adminUser: { role } }, _) {
                return (
                    <Chip checked={false} size="xs" color="cyan">
                        {role.role_name}
                    </Chip>
                );
            },
        },
        {
            key: 'permission',
            title: 'Permission',
            renderRow({ permission }, _) {
                return <Text style={{ color: buildColorWithPermission(permission) }}>{capitalize(permission.permission_code)}</Text>;
            },
        },
    ];

    const inputs: TInput<{ permission_id: IPermission['id']; admin_user_id: IAdminUser['id'] }>[] = [
        {
            key: 'admin_user_id',
            type: 'select',
            data: adminUsersSelectData,
            title: 'Admin User',
            props: {
                searchable: true,
            },
        },
        {
            key: 'permission_id',
            type: 'select',
            data: permissionsDataSelect,
            title: 'Resource',
            props: {
                searchable: true,
            },
        },
    ];

    const actions = useMemo(() => {
        return [
            {
                title: 'Add',
                callback: toggle,
                key: 'add',
            },
        ] as IActionData[];
    }, [chooses]);

    useEffect(() => {
        choosesRef.current = chooses;
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
                            <ActionColumn
                                itemActions={[
                                    <ActionIcon component={Link} href={Routes.DETAIL_ADMIN_USER(row.adminUser)} size={'sm'}>
                                        <IconLink style={{ width: '70%', height: '70%' }} stroke={1.5} color="white" />
                                    </ActionIcon>,
                                ]}
                                showEdit={false}
                                data={row}
                                onSubmit={(action) => {
                                    if (action.key === 'delete') {
                                        deleteMutation.mutate(row.id);
                                    }
                                }}
                            />
                        );
                    },
                }}
            />
        );
    }, [data, isPending, actions]);

    return (
        <Box>
            {table}

            <Modal size={'lg'} opened={opened} centered onClose={close}>
                <GenerateForm
                    inputs={inputs}
                    layout={{
                        lg: { col: 2 },
                    }}
                    onSubmit={(values) => {
                        dispatch(
                            addComfirm({
                                title: 'Are you sure this action ?',
                                callback: () => {
                                    addMutation.mutate(values);
                                },
                            }),
                        );
                    }}
                />
            </Modal>
        </Box>
    );
}
