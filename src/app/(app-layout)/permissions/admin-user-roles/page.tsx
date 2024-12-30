'use client';
import { ApiRoles } from '@/api';
import { Api, ApiError } from '@/api/api';
import { GenerateForm } from '@/components/lib/generate-form';
import { TInput } from '@/components/lib/generate-form/type';
import ActionColumn from '@/components/lib/table/action-column';
import Table from '@/components/lib/table/table';
import { IActionData, IColumn, TRefTableActionFn } from '@/components/lib/table/type';
import { RoleGrantPermission } from '@/components/roles';
import { container } from '@/di/container';
import { formatTime } from '@/instances/moment';
import Routes from '@/instances/routes';
import { RootState } from '@/store';
import { IRole } from '@/types';
import { ActionIcon, Box, Button, Modal, Select, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAuth2fa, IconLink, IconSeeding, IconShieldHeart, IconX } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
export interface IALAdminUserRolesRootPageProps {}

export default function ALAdminUserRolesRootPage(props: IALAdminUserRolesRootPageProps) {
    const rolesApi = container.get(ApiRoles);
    const [params, setParams] = useState<Record<string, string | number>>({});

    const [chooses, setChooses] = useState<IRole[]>([]);

    const [dataUpdate, setDataUpdate] = useState<IRole | null>(null);

    const choosesRef = useRef<IRole[]>(chooses);

    const refAction: TRefTableActionFn = useRef({});

    const [opened, { open, close }] = useDisclosure(false);
    const [grantPermissionModal, grantPermissionModalAction] = useDisclosure(false);

    const { data, isPending, refetch } = useQuery({
        queryKey: ['roles[GET]', { ...params }],
        queryFn: () => rolesApi.getAll(params),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: IRole['id']) => rolesApi.deleteRole(id),
        mutationKey: ['role[DELETE]'],
        onSuccess(data) {
            Api.handle_response(data);
            refetch();
        },
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<IRole>) => rolesApi.create(data),
        mutationKey: ['role[POST]'],
        onSuccess(data) {
            Api.handle_response(data);
            refetch();
            handleClose();
        },
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: IRole['id']; data: Partial<IRole> }) => rolesApi.update(id, data),
        mutationKey: ['role[PUT]'],
        onSuccess(data) {
            Api.handle_response(data);
            refetch();
            handleClose();
        },
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
    });

    const columns: IColumn<IRole>[] = [
        {
            key: 'id',
            title: 'ID',
            typeFilter: 'number',
        },
        {
            key: 'role_name',
            title: 'Name',
            typeFilter: 'text',
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

    const inputs: TInput<IRole>[] = [
        {
            key: 'role_name',
            title: 'Name',
            type: 'text',
            validate: {
                options: {
                    min: 4,
                },
            },
            props: {
                withAsterisk: true,
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
                title: 'Add',
                callback: open,
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
                                itemActions={[
                                    <Tooltip label={`Permission this role`}>
                                        <ActionIcon
                                            onClick={() => {
                                                setDataUpdate(row);
                                                grantPermissionModalAction.open();
                                            }}
                                            size="sm"
                                            color="lime"
                                        >
                                            <IconShieldHeart style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                        </ActionIcon>
                                    </Tooltip>,
                                    <Tooltip label={`Resource of ${row.role_name}`}>
                                        <ActionIcon color="gray" component={Link} href={Routes.DETAIL_ROLE_RESOURCES(row)} size="sm">
                                            <IconSeeding style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                        </ActionIcon>
                                    </Tooltip>,
                                ]}
                                messages={(_, data) => {
                                    return {
                                        delete: `Are you sure delete customer ${data.role_name}`,
                                    };
                                }}
                                editOption={{
                                    callback: () => {
                                        setDataUpdate(row);

                                        open();
                                    },
                                }}
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
    }, [data, isPending, actions, refAction]);

    return (
        <Box>
            {table}

            <Modal opened={opened} onClose={handleClose} title={`${dataUpdate ? 'Edit' : 'Create'} role`} centered>
                <GenerateForm
                    initData={dataUpdate || undefined}
                    layout={{
                        lg: {
                            col: 1,
                        },
                    }}
                    inputs={inputs}
                    onSubmit={(values) => {
                        if (!dataUpdate) {
                            createMutation.mutate(values);
                        } else {
                            updateMutation.mutate({ data: { role_name: values.role_name }, id: dataUpdate.id });
                        }
                    }}
                />
            </Modal>

            {dataUpdate && (
                <RoleGrantPermission
                    opened={grantPermissionModal}
                    open={grantPermissionModalAction.open}
                    close={() => {
                        setDataUpdate(null);
                        grantPermissionModalAction.close();
                    }}
                    role_id={dataUpdate.id}
                />
            )}
        </Box>
    );
}
