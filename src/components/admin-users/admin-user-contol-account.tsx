'use client';
import { ApiCustomers, ApiBlackList } from '@/api';
import { Api, ApiError, IApiResponse } from '@/api/api';
import { ICustomerView } from '@/api/customers';
import { container } from '@/di/container';
import { useViewCustomer } from '@/hooks/customers';
import moment, { formatTime } from '@/instances/moment';
import Routes from '@/instances/routes';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { useAdminUserStore, useCustomerStore } from '@/store/zustand';
import { Box, Button, Card, Collapse, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, UseMutationResult, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { GenerateForm } from '../lib/generate-form';
import { TInput, TRefForm } from '../lib/generate-form/type';
import { TBlockCustomerData } from '@/api/blacklist';
import { useEffect, useRef } from 'react';
import AdminUserBase, { IAdminUserBaseProps } from './admin-user-base';
import ApiAdminUsers, { IComfirmPasswordAdmin } from '@/api/admin-users';
import { IAdminUser } from '@/types';
import { useAdminUserById } from '@/hooks/admin-users';

export interface AdminUserControlAccountProps extends IAdminUserBaseProps {}

export default function AdminUserControlAccount({ ...props }: AdminUserControlAccountProps) {
    const adminUsersApi = container.get(ApiAdminUsers);
    const blacklistApi = container.get(ApiBlackList);

    const dispatch = useDispatch();

    const router = useRouter();

    const viewQuery = useViewCustomer(props.id, 'mutation');

    const [opened, { toggle }] = useDisclosure(false);

    const queryAdminUser = useAdminUserById(props.id);

    const { data, setCallback, setData, useTimePassword } = useAdminUserStore();

    const query = useQuery({
        queryKey: ['black-list/admin-user/[GET]', props.id],
        queryFn: () => blacklistApi.getByAdminUserId(Number(props.id)),
    });

    const inputs: TInput<TBlockCustomerData>[] = [
        {
            key: 'from',
            type: 'datetime',
            title: 'From',
        },

        {
            key: 'to',
            type: 'datetime',
            title: 'To',
            validate: {
                validateFN: (_, values, value) => {
                    if (!values.from) return 'From value is required';

                    if (values.from && !value) {
                        return null;
                    } else {
                        if (moment(value).isBefore(moment(values.from))) return `The "to" date must be greater than the "from" date.`;
                    }

                    return null;
                },
            },
            props: {
                description: 'Can empty this field if want to block infinity',
            },
        },
        {
            key: 'black_list_type',
            type: 'select',
            data: [
                { value: 'block', label: 'Block' },
                { value: 'warning', label: 'Warning' },
            ],
            title: 'Type',
        },
        {
            key: 'reason',
            type: 'text-area',
            title: 'Reason',
            validate: {
                validateFN: (_, values, value) => {
                    if (values.black_list_type === 'block') {
                        return !value || !(value as string).trim().length ? 'Reason is required' : null;
                    }

                    return null;
                },
            },
        },
    ];

    const deleteMutation = useMutation({
        mutationKey: ['admin-users/delete[DELETE]', props.id],
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
            // query.refetch();
            router.replace(Routes.ADMIN_USERS);
        },
    });

    const activeMutation = useMutation({
        mutationKey: ['admin-users/active[PUT]', props.id],
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
            queryAdminUser.refetch();
        },
    });

    const inActiveMutation = useMutation({
        mutationKey: ['admin-users/in-active[PUT]', props.id],
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
            queryAdminUser.refetch();
        },
    });

    const blockCustomerMutation = useMutation({
        mutationKey: ['black-lists/block-admin-user[POST]', props.id],
        mutationFn: (values: TBlockCustomerData & IComfirmPasswordAdmin) => blacklistApi.blockAdminUser(props.id, values),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);

            query.refetch();
        },
    });

    const unlockAdminUserMutation = useMutation({
        mutationKey: ['black-lists/admin-user[PUT]', props.id],
        mutationFn: (data: IComfirmPasswordAdmin) => blacklistApi.unlockAdminUser({ id: props.id, ...data }),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            query.refetch();
        },
    });

    const handleDelete = () => {
        if (!data) return;

        if (useTimePassword.use_time) {
            dispatch(
                addComfirm({
                    title: 'Are you want to delete?',
                    callback: () =>
                        deleteMutation.mutate({
                            admin_user: data,
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
                admin_user: data,
                use_time: !!use_time.length,
                admin_password: password,
            });
        });
    };

    const toggleCustomer = () => {
        if (!data) return;

        if (useTimePassword.use_time) {
            dispatch(
                addComfirm({
                    callback: () =>
                        data.is_active ? inActiveMutation.mutate({ admin_password: '', admin_users: [data] }) : activeMutation.mutate({ admin_password: '', admin_users: [data] }),
                    title: `Are you want to ${data.is_active ? 'Inactive' : 'Active'} this admin.`,
                }),
            );
            return;
        }

        setCallback(({ password, use_time }) => {
            if (!password) return;

            data.is_active
                ? inActiveMutation.mutate({ admin_password: password, admin_users: [data], use_time: !!use_time.length })
                : activeMutation.mutate({ admin_password: password, admin_users: [data], use_time: !!use_time.length });
        });
    };

    const handleBlockCustomer = (values: TBlockCustomerData) => {
        if (useTimePassword.use_time) {
            dispatch(
                addComfirm({
                    callback: () => blockCustomerMutation.mutate({ ...values, admin_password: '' }),
                    title: `Are you want to block this account ?`,
                }),
            );
            return;
        }

        setCallback(({ password, use_time }) => {
            if (!password) return;

            blockCustomerMutation.mutate({ ...values, admin_password: password, use_time: !!use_time.length });
        });
    };

    const handleUnlockCustomer = () => {
        if (useTimePassword.use_time) {
            dispatch(
                addComfirm({
                    callback: () => unlockAdminUserMutation.mutate({ admin_password: '' }),
                    title: `Are you want to unlock this admin.`,
                }),
            );
            return;
        }

        setCallback(({ password, use_time }) => {
            if (!password) return;

            unlockAdminUserMutation.mutate({ admin_password: password, use_time: !!use_time.length });
        });
    };

    useEffect(() => {
        setData(queryAdminUser.data?.data || null);
    }, [queryAdminUser.data]);

    return (
        <AdminUserBase {...props}>
            <Box className="grid grid-cols-3 gap-5 ">
                <Card
                    classNames={{
                        root: 'h-fit',
                    }}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                >
                    <Box className="flex items-center justify-between gap-4">
                        <Tooltip hidden={!query.data?.data || moment(query.data?.data?.start_at).isBefore(moment(Date.now()))} label={'Has not been implemented yet'}>
                            <Button disabled={!data?.is_active} onClick={toggle} color="blue" fullWidth mt="md">
                                {!query.data?.data ? 'Block Customer' : 'Setting block'}
                            </Button>
                        </Tooltip>

                        {query.data?.data && (
                            <Button onClick={handleUnlockCustomer} color="red" fullWidth mt="md">
                                Unlock
                            </Button>
                        )}
                    </Box>

                    <Collapse mt={'md'} in={opened}>
                        <GenerateForm
                            initData={
                                query.data?.data
                                    ? {
                                          black_list_type: query.data.data.back_list_type || null,
                                          from: query.data.data.start_at ? moment(query.data.data.start_at).toDate() : null,
                                          to: query.data.data.end_at ? moment(query.data.data.end_at).toDate() : null,
                                          reason: query.data.data.reason || '',
                                      }
                                    : undefined
                            }
                            layout={{
                                xl: { col: 1, gap: 1 },
                                lg: { col: 1 },
                                md: { col: 1 },
                            }}
                            onSubmit={handleBlockCustomer}
                            inputs={inputs}
                        />
                    </Collapse>
                </Card>

                <Card
                    classNames={{
                        root: 'h-fit',
                    }}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                >
                    <Button onClick={toggleCustomer} disabled={!data} color={data?.is_active ? 'red' : 'green'} fullWidth mt="md">
                        {data?.is_active ? 'In active on system' : 'Active on system'}
                    </Button>
                </Card>
                <Card
                    classNames={{
                        root: 'h-fit',
                    }}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                >
                    <Button onClick={handleDelete} color="red" fullWidth mt="md">
                        Delete Admin
                    </Button>
                </Card>
            </Box>
        </AdminUserBase>
    );
}
