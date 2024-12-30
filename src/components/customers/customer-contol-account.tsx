'use client';
import { ApiCustomers, ApiBlackList } from '@/api';
import { Api, ApiError, IApiResponse } from '@/api/api';
import { ICustomerView } from '@/api/customers';
import { container } from '@/di/container';
import { useViewCustomer } from '@/hooks/customers';
import moment, { formatTime } from '@/instances/moment';
import Routes from '@/instances/routes';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { useCustomerStore } from '@/store/zustand';
import { Box, Button, Card, Collapse } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { GenerateForm } from '../lib/generate-form';
import { TInput, TRefForm } from '../lib/generate-form/type';
import CustomersBase, { ICustomersBaseProps } from './customers-base';
import { TBlockCustomerData } from '@/api/blacklist';
import { useRef } from 'react';

export interface ICustomerControlAccountProps extends ICustomersBaseProps {}

export default function CustomerControlAccount({ ...props }: ICustomerControlAccountProps) {
    const customersApi = container.get(ApiCustomers);
    const blacklistApi = container.get(ApiBlackList);

    const dispatch = useDispatch();

    const router = useRouter();

    const viewQuery = useViewCustomer(props.id, 'mutation');

    const [opened, { toggle }] = useDisclosure(false);

    const { data } = useCustomerStore();

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

    const delMutation = useMutation({
        mutationKey: ['customers/delete[DELETE]'],
        mutationFn: (customerId: number) => customersApi.deleteCustomer(customerId),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);

            router.push(Routes.CUSTOMERS);
        },
    });

    const inActiveMutation = useMutation({
        mutationKey: ['customers/hidden[PUT]'],
        mutationFn: (customerId: number) => customersApi.inActive(customerId),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);

            (viewQuery as UseMutationResult<IApiResponse<ICustomerView>, Error, void, unknown>).mutate();
        },
    });

    const activeMutation = useMutation({
        mutationKey: ['customers/unhidden[PUT]'],
        mutationFn: (customerId: number) => customersApi.active(customerId),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            (viewQuery as UseMutationResult<IApiResponse<ICustomerView>, Error, void, unknown>).mutate();
        },
    });

    const blockCustomerMutation = useMutation({
        mutationKey: ['black-lists/block-customer[POST]'],
        mutationFn: (values: TBlockCustomerData) => blacklistApi.blockCustomer(props.id, values),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);

            (viewQuery as UseMutationResult<IApiResponse<ICustomerView>, Error, void, unknown>).mutate();
        },
    });

    const unlockCustomerMutation = useMutation({
        mutationKey: ['black-lists/unlock-customer[PUT]'],
        mutationFn: () => blacklistApi.unlockCustomer(props.id),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);

            (viewQuery as UseMutationResult<IApiResponse<ICustomerView>, Error, void, unknown>).mutate();
        },
    });

    const handleDelete = () => {
        dispatch(
            addComfirm({
                callback: () => delMutation.mutate(props.id),
                title: `Are you want to delete this customer. This action can't remake`,
            }),
        );
    };

    const toggleCustomer = () => {
        const customer = data?.customer || null;

        if (!customer) return;

        dispatch(
            addComfirm({
                callback: () => (customer.is_active ? inActiveMutation.mutate(props.id) : activeMutation.mutate(props.id)),
                title: `Are you want to ${customer.is_active ? 'Inactive' : 'Active'} this customer.`,
            }),
        );
    };

    const handleBlockCustomer = (values: TBlockCustomerData) => {
        dispatch(
            addComfirm({
                callback: () => blockCustomerMutation.mutate(values),
                title: `Are you want to block this account ?`,
            }),
        );
    };

    const handleUnlockCustomer = () => {
        dispatch(
            addComfirm({
                callback: () => unlockCustomerMutation.mutate(),
                title: `Are you want to unlock this customer.`,
            }),
        );
    };

    return (
        <CustomersBase {...props}>
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
                        <Button disabled={!data?.customer.is_active} onClick={toggle} color="blue" fullWidth mt="md">
                            {!data?.blacklist ? 'Block Customer' : 'Setting block'}
                        </Button>

                        {data?.blacklist && (
                            <Button onClick={handleUnlockCustomer} color="red" fullWidth mt="md">
                                Unlock
                            </Button>
                        )}
                    </Box>

                    <Collapse mt={'md'} in={opened}>
                        <GenerateForm
                            initData={
                                data?.blacklist
                                    ? {
                                          black_list_type: data.blacklist.back_list_type || null,
                                          from: data.blacklist.start_at ? moment(data.blacklist.start_at).toDate() : null,
                                          to: data.blacklist.end_at ? moment(data.blacklist.end_at).toDate() : null,
                                          reason: data.blacklist.reason || '',
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
                    <Button onClick={toggleCustomer} disabled={!data?.customer} color={data?.customer.is_active ? 'red' : 'green'} fullWidth mt="md">
                        {data?.customer.is_active ? 'Hide customer on system' : 'Unhide customer on system'}
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
                        Delete Customer
                    </Button>
                </Card>
            </Box>
        </CustomersBase>
    );
}
