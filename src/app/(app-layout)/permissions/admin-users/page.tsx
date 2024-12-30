'use client';
import { ApiAdminUsers } from '@/api';
import { IComfirmPasswordAdmin } from '@/api/admin-users';
import { Api, ApiError } from '@/api/api';
import { GenerateForm } from '@/components/lib/generate-form';
import { TInput, TRefForm } from '@/components/lib/generate-form/type';
import ActionColumn from '@/components/lib/table/action-column';
import ActiveColumn from '@/components/lib/table/active-column';
import Table from '@/components/lib/table/table';
import { IActionData, IColumn, TRefTableActionFn } from '@/components/lib/table/type';
import { container } from '@/di/container';
import { useRolesSelectData } from '@/hooks/roles';
import { genderList, rootAdmin } from '@/instances/constants';
import { formatTime } from '@/instances/moment';
import Routes from '@/instances/routes';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { useAdminUserStore } from '@/store/zustand';
import { IAdminUser } from '@/types';
import { Box, DefaultMantineColor, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery } from '@tanstack/react-query';
import capitalize from 'capitalize';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

export interface IALAdminUsersRootPageProps {}

export default function ALAdminUsersRootPage(props: IALAdminUsersRootPageProps) {
    const adminUsersApi = container.get(ApiAdminUsers);
    const [params, setParams] = useState<Record<string, string | number>>({});

    const [chooses, setChooses] = useState<IAdminUser[]>([]);

    const [opened, { open, close }] = useDisclosure(false);

    const { setCallback, useTimePassword } = useAdminUserStore();

    const formRef: TRefForm = useRef({});

    const choosesRef = useRef<IUser[]>(chooses);

    const refAction: TRefTableActionFn = useRef({});

    const { data, isPending, refetch } = useQuery({
        queryKey: ['admin-users[GET]', { ...params }],
        queryFn: () => adminUsersApi.getAll(params),
    });

    const dispatch = useDispatch();

    const activesMutation = useMutation({
        mutationKey: ['admin-users/actives[PUT]', chooses],
        mutationFn: (
            data: IComfirmPasswordAdmin & {
                admin_users: IAdminUser[];
            },
        ) => adminUsersApi.actives(data),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
        },
    });

    const inActivesMutation = useMutation({
        mutationKey: ['admin-users/in-actives[PUT]', chooses],
        mutationFn: (
            data: IComfirmPasswordAdmin & {
                admin_users: IAdminUser[];
            },
        ) => adminUsersApi.inActives(data),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
        },
    });

    const deletesMutation = useMutation({
        mutationKey: ['admin-users/deletes[DELETE]', chooses],
        mutationFn: (
            data: IComfirmPasswordAdmin & {
                admin_users: IAdminUser[];
            },
        ) => adminUsersApi.deletes(data),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
        },
    });

    const deleteMutation = useMutation({
        mutationKey: ['admin-users/delete[DELETE]', chooses],
        mutationFn: (
            data: IComfirmPasswordAdmin & {
                admin_user: IAdminUser;
            },
        ) => adminUsersApi.deleteAdminUser(data),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
        },
    });

    const createMutation = useMutation({
        mutationKey: ['admin-users/create[POST]'],
        mutationFn: (
            data: Partial<IAdminUser> & {
                password: string;
            } & IComfirmPasswordAdmin,
        ) => adminUsersApi.createNewAdminUser(data),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();

            if (formRef.current?.reset) {
                formRef.current.reset();
            }

            close();
        },
    });

    const columns: IColumn<IAdminUser>[] = [
        {
            key: 'id',
            title: 'ID',
            typeFilter: 'number',
        },
        {
            key: 'username',
            title: 'Username',
            typeFilter: 'text',
        },
        {
            key: 'email',
            title: 'Email',
            typeFilter: 'text',
        },
        {
            key: 'first_name',
            title: 'First name',
            typeFilter: 'text',
        },
        {
            key: 'last_name',
            title: 'Last name',
            typeFilter: 'text',
        },
        {
            key: 'is_active',
            title: 'Active',
            typeFilter: {
                type: 'select',
                data: ['Active', 'Inactive'],
            },
            renderRow(row) {
                return <ActiveColumn active={row.is_active} />;
            },
        },
        {
            key: 'role',
            title: 'Role',
            typeFilter: {
                type: 'select',
                data: ['Active', 'Inactive'],
            },
            renderRow(row) {
                return <span>{row?.role && capitalize(row.role.role_name)}</span>;
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

    const createInputs: TInput<Partial<IAdminUser> & { password: string }>[] = [
        {
            key: 'username',
            type: 'text',
            title: 'Username',
            validate: {
                options: {
                    min: 4,
                },
            },
            props: {
                withAsterisk: true,
            },
        },

        {
            key: 'email',
            type: 'text',
            title: 'Email',
            props: {
                withAsterisk: true,
            },
        },
        {
            key: 'first_name',
            type: 'text',
            title: 'First name',
            validate: {
                options: {
                    required: false,
                },
            },
        },
        {
            key: 'last_name',
            type: 'text',
            title: 'Last name',
            validate: {
                options: {
                    required: false,
                },
            },
        },
        {
            key: 'gender',
            type: 'select',
            data: genderList,
            title: 'Gender',
            validate: {
                options: {
                    required: false,
                },
            },
        },
        {
            key: 'password',
            type: 'password',
            title: 'Password',

            validate: {
                options: {
                    min: 6,
                },
            },
            props: {
                withAsterisk: true,
            },
        },
    ];

    useEffect(() => {
        choosesRef.current = chooses;
    }, [chooses]);

    const handleAction = (values: IAdminUser, mutation: any, confirmTitle: string, acceptLabel: string, color: DefaultMantineColor = 'blue') => {
        if (useTimePassword.use_time) {
            dispatch(
                addComfirm({
                    title: confirmTitle,
                    callback: () =>
                        mutation.mutate({
                            ...values,
                            admin_users: chooses,
                            admin_password: '',
                        }),
                    acceptLabel,
                    buttonProps: {
                        color,
                    },
                }),
            );
            return;
        }

        setCallback(({ password, use_time }) => {
            if (!password) return;
            mutation.mutate({
                ...values,
                admin_password: password,
                use_time: !!use_time.length,
                admin_users: chooses,
            });
        });
    };

    const handleActives = (values: IAdminUser) => handleAction(values, activesMutation, 'Are you want to active?', 'Actives');

    const handleInActives = (values: IAdminUser) => handleAction(values, inActivesMutation, 'Are you want to in active?', 'InActives');

    const handleDeletes = (values: IAdminUser) => handleAction(values, deletesMutation, 'Are you want to deletes?', 'Deletes', 'red');

    const handleDelete = (values: IAdminUser) => {
        if (useTimePassword.use_time) {
            dispatch(
                addComfirm({
                    title: 'Are you want to delete?',
                    callback: () =>
                        deleteMutation.mutate({
                            admin_user: values,
                            admin_password: '',
                        }),
                    acceptLabel: 'Delete',
                    buttonProps: {
                        color: 'red',
                    },
                }),
            );
            return;
        }

        setCallback(({ password, use_time }) => {
            if (!password) return;

            deleteMutation.mutate({
                admin_user: values,
                use_time: !!use_time.length,
                admin_password: password,
            });
        });
    };

    const handleCreateNewAdmin = (values: Partial<IAdminUser> & { password: string }) => {
        if (!useTimePassword.use_time) {
            setCallback(({ password, use_time }) => {
                if (!password) return;
                createMutation.mutate({
                    ...values,
                    admin_password: password,
                    use_time: !!use_time.length,
                });
            });
            return;
        }

        createMutation.mutate({
            ...values,
            admin_password: '',
        });
    };

    const actions = useMemo(() => {
        return [
            {
                title: 'Active',
                callback: handleActives,
                key: 'active',
                disabled: chooses.length <= 0,
            },
            {
                title: 'In active',
                callback: handleInActives,
                key: 'in-active',
                disabled: chooses.length <= 0,
            },
            {
                title: 'Delete',
                callback: handleDeletes,
                key: 'delete',
                disabled: chooses.length <= 0,
            },
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
                                confirm={false}
                                messages={(_, data) => {
                                    return {
                                        delete: `Are you sure delete customer ${data.username}`,
                                    };
                                }}
                                disabledDel={row.username == rootAdmin.username}
                                editOption={{ type: 'link', url: Routes.DETAIL_ADMIN_USER(row) }}
                                data={row}
                                onSubmit={(action) => {
                                    if (action.key === 'delete') {
                                        handleDelete(row);
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

            <Modal opened={opened} onClose={close} title="Create a admin user" centered size={'xl'}>
                <GenerateForm
                    formRef={formRef}
                    submitButton={{
                        title: 'Create',
                    }}
                    layout={{
                        lg: {
                            col: 2,
                            gap: 4,
                        },
                    }}
                    inputs={createInputs}
                    onSubmit={handleCreateNewAdmin}
                />
            </Modal>
        </Box>
    );
}
