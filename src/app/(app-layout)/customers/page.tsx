'use client';

import { ApiCustomerGroup, ApiCustomers } from '@/api';
import { Api, ApiError } from '@/api/api';
import { CreateCustomerData, UpdateCustomerData } from '@/api/customers';
import { GenerateForm } from '@/components/lib/generate-form';
import { TInput } from '@/components/lib/generate-form/type';
import ActionColumn from '@/components/lib/table/action-column';
import ActiveColumn from '@/components/lib/table/active-column';
import Table from '@/components/lib/table/table';
import { IActionData, IColumn, TRefTableActionFn } from '@/components/lib/table/type';
import { container } from '@/di/container';
import { formatTime } from '@/instances/moment';
import Routes from '@/instances/routes';
import { RootState } from '@/store';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { ICustomer } from '@/types';
import { ComboboxData, List, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import capitalize from 'capitalize';
import { genderList } from '@/instances/constants';
import { useCustomerGroupsSelectData } from '@/hooks/customer-groups';

export interface IALCustomersRootPageProps {}

export default function ALCustomersRootPage(props: IALCustomersRootPageProps) {
    const customersApi = container.get(ApiCustomers);
    const customerGroupApi = container.get(ApiCustomerGroup);
    const [params, setParams] = useState<Record<string, string | number>>({});

    const [chooses, setChooses] = useState<ICustomer[]>([]);

    const choosesRef = useRef<ICustomer[]>(chooses);

    const refAction: TRefTableActionFn = useRef({});

    const [editOpened, editModalAction] = useDisclosure(false);
    const [blockOpened, blockModalAction] = useDisclosure(false);
    const [createOpened, createModalAction] = useDisclosure(false);

    const { isOpen } = useSelector((state: RootState) => state.comfirm);
    const dispatch = useDispatch();

    const { data, isPending, refetch } = useQuery({
        queryKey: ['customers[GET]', { ...params }],
        queryFn: () => customersApi.getCustomers(params),
    });

    const { customerGroupSelect } = useCustomerGroupsSelectData();

    const delsMuta = useMutation({
        mutationKey: ['bulk-deletes-customers/', chooses],
        mutationFn: () => customersApi.deletes(chooses),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
            setChooses([]);
        },
    });

    const createMutation = useMutation({
        mutationKey: ['customer/[POST]'],
        mutationFn: (data: CreateCustomerData) => customersApi.create(data),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
            createModalAction.close();
        },
    });

    const inActivesMutation = useMutation({
        mutationKey: ['customers/in-actives[PUT]', chooses],
        mutationFn: () => customersApi.inActives(chooses),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
            setChooses([]);
        },
    });

    const activesMultipleMutation = useMutation({
        mutationKey: ['bulk-unhidden-customers/', chooses],
        mutationFn: () => customersApi.actives(chooses),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
            setChooses([]);
        },
    });

    const delMuta = useMutation({
        mutationKey: ['customers/delete[DELETE]', chooses],
        mutationFn: (customerId: number) => customersApi.deleteCustomer(customerId),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
        },
    });

    const updatesMuta = useMutation({
        mutationKey: ['customers/multiple/updates[PUT]', chooses],
        mutationFn: ({ chooses, values }: { chooses: ICustomer[]; values: Partial<ICustomer> }) => customersApi.updates(chooses, values),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
        },
    });

    const columns: IColumn<ICustomer>[] = [
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
            key: 'date_of_birth',
            title: 'Birthday',
            typeFilter: 'date',
            renderRow(row, _) {
                return <span>{row.date_of_birth ? formatTime(row.date_of_birth as string) : ''}</span>;
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

    const editInputs: TInput<ICustomer>[] = [
        {
            key: 'first_name',
            type: 'text',
            title: 'First name',
            validate: {
                validateFN: () => null,
            },
        },
        {
            key: 'last_name',
            type: 'text',
            title: 'Last name',
            validate: {
                validateFN: () => null,
            },
        },
        {
            key: 'date_of_birth',
            type: 'date',
            title: 'Date of birth',
            colspan: 2,
            validate: {
                validateFN: () => null,
            },
        },
    ];

    const createInputs: TInput<CreateCustomerData>[] = [
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
            key: 'phone',
            type: 'text',
            title: 'Phone',
            validate: {
                style: 'phone',
                options: { required: false },
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
            key: 'date_of_birth',
            type: 'date',
            title: 'Date of birth',
            validate: {
                options: {
                    required: false,
                },
            },
        },
        {
            key: 'vat_number',
            type: 'text',
            title: 'VAT Number',
            validate: {
                options: { required: false },
                style: 'number',
            },
        },
        {
            key: 'group_id',
            type: 'select',
            title: 'Group',
            data: customerGroupSelect,
            validate: {
                options: {
                    required: false,
                },
            },
        },
    ];

    useEffect(() => {
        choosesRef.current = chooses;
    }, [chooses]);

    const actions = useMemo(() => {
        return [
            {
                title: 'Active',
                callback: activesMultipleMutation.mutate,
                key: 'active',
                comfirmAction: true,
                disabled: chooses.length <= 0,
                comfirmOption: (data) => {
                    return {
                        title: `Are you want to active ${choosesRef.current.length}`,
                    };
                },
            },
            {
                title: 'Inactive',
                callback: inActivesMutation.mutate,
                key: 'inactive',
                comfirmAction: true,
                disabled: chooses.length <= 0,
                comfirmOption: (data) => {
                    return {
                        title: `Are you want to Inactive ${choosesRef.current.length}`,
                    };
                },
            },
            {
                title: `Edit`,
                callback: editModalAction.toggle,
                key: 'edit',
                disabled: chooses.length <= 0,
            },
            {
                title: 'Delete',
                callback: delsMuta.mutate,
                key: 'delete',
                comfirmAction: true,
                disabled: chooses.length <= 0,
                comfirmOption: (data) => {
                    return {
                        title: `Are you want to deletes ${choosesRef.current.length}`,
                    };
                },
            },
            {
                title: 'Add',
                callback: createModalAction.open,
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
                                        delete: `Are you sure delete customer ${data.username}`,
                                    };
                                }}
                                editOption={{ type: 'link', url: Routes.DETAIL_CUSTOMER(row) }}
                                data={row}
                                onSubmit={(action) => {
                                    if (action.key === 'delete') {
                                        delMuta.mutate(row.id);
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
        <div>
            {table}

            <Modal opened={editOpened} onClose={editModalAction.close} title={`Edits for ${chooses.length} customers`} centered>
                <List className="mb-2">
                    <List.Item fz={'xs'} className="italic">
                        - Write all the fields you want to update. Fields left blank will not be updated
                    </List.Item>
                    <List.Item fz={'xs'} className="italic">
                        - Write [none] if you want to update the data to be empty
                    </List.Item>
                </List>

                <GenerateForm
                    submitButton={{
                        props: {
                            disabled: isOpen || updatesMuta.isPending,
                        },
                    }}
                    onSubmit={(values) => {
                        dispatch(
                            addComfirm({
                                callback: () => {
                                    // console.log('object');
                                    updatesMuta.mutate({ chooses, values });
                                },
                                onClose: () => {
                                    editModalAction.close();

                                    if (refAction.current.clearAction) {
                                        refAction.current.clearAction();
                                    }
                                },
                                title: `Are you sure edits ${chooses.length} customers information`,
                            }),
                        );
                    }}
                    layout={{
                        xl: { col: 2, gap: 2 },
                        lg: { col: 2 },
                        md: { col: 2 },
                    }}
                    inputs={editInputs}
                />
            </Modal>

            <Modal opened={blockOpened} onClose={blockModalAction.close} title={`Block for ${chooses.length} customers`} centered>
                <List className="mb-2">
                    <List.Item fz={'xs'} className="italic">
                        - If [to] is empty = block infinity
                    </List.Item>
                    <List.Item fz={'xs'} className="italic">
                        - If [from] and [to] is empty = unblock
                    </List.Item>
                </List>
            </Modal>

            <Modal opened={createOpened} onClose={createModalAction.close} title={`Create customer`} centered size={'xl'}>
                <GenerateForm
                    onSubmit={(values) => {
                        createMutation.mutate({ ...values, group_id: Number(values.group_id) });
                    }}
                    layout={{
                        xl: { col: 2, gap: 2 },
                        lg: { col: 2 },
                        md: { col: 2 },
                    }}
                    inputs={createInputs}
                />
            </Modal>
        </div>
    );
}
