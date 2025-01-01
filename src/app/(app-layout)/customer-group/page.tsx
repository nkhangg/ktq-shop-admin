'use client';
import { ApiCustomerGroup } from '@/api';
import { Api, ApiError } from '@/api/api';
import { GenerateForm } from '@/components/lib/generate-form';
import { TInput } from '@/components/lib/generate-form/type';
import Table from '@/components/lib/table/table';
import { IActionData, IColumn } from '@/components/lib/table/type';
import { container } from '@/di/container';
import { useTitle } from '@/hooks';
import { useCustomerGroupsSelectData } from '@/hooks/customer-groups';
import moment from '@/instances/moment';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { ICustomerGroup } from '@/types';
import { ActionIcon, Box, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

export interface IALCustomerGroupRootPageProps {}

export default function ALCustomerGroupRootPage(props: IALCustomerGroupRootPageProps) {
    useTitle('Customer Group');

    const customerGroupApi = container.get(ApiCustomerGroup);

    const [opened, { open, close }] = useDisclosure(false);

    const [params, setParams] = useState<Record<string, string | number>>({});

    const [chooses, setChooses] = useState<ICustomerGroup[]>([]);

    const choosesRef = useRef<ICustomerGroup[]>(chooses);

    const [dataUpdate, setDataUpdate] = useState<ICustomerGroup | null>(null);

    const dispatch = useDispatch();

    const { data, isPending, refetch } = useQuery({
        queryFn: () => customerGroupApi.getAll(params),
        queryKey: ['customers-groups[GET]', { ...params }],
    });

    const { refresh } = useCustomerGroupsSelectData();

    const createMutation = useMutation({
        mutationFn: (data: Pick<ICustomerGroup, 'name'>) => customerGroupApi.create(data),
        mutationKey: ['customers-groups[POST]'],
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

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: ICustomerGroup['id']; data: Pick<ICustomerGroup, 'name'> }) => customerGroupApi.update(id, data),
        mutationKey: ['customers-groups[PUT]'],
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
            setChooses([]);
            close();

            requestIdleCallback(() => refresh());
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: ICustomerGroup['id']) => customerGroupApi.deleteCustomerGroup(id),
        mutationKey: ['customers-groups[DELETE]'],
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
            setChooses([]);
            close();
            requestIdleCallback(() => refresh());
        },
    });

    const columns: IColumn<ICustomerGroup>[] = [
        {
            key: 'id',
            title: 'ID',
            typeFilter: 'number',
        },
        {
            key: 'name',
            title: 'Name',
            typeFilter: 'text',
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

    const inputs: TInput<ICustomerGroup>[] = [
        {
            key: 'name',
            type: 'text',
            title: 'Name',
            validate: {
                options: {
                    min: 4,
                },
            },
        },
    ];

    const actions = useMemo(() => {
        return [
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
                            <Box className="flex items-center justify-center gap-2">
                                <ActionIcon
                                    onClick={() => {
                                        setDataUpdate(row);

                                        open();
                                    }}
                                    size="sm"
                                >
                                    <IconEdit style={{ width: '70%', height: '70%' }} stroke={1.5} color="white" />
                                </ActionIcon>
                                <ActionIcon
                                    onClick={() => {
                                        dispatch(
                                            addComfirm({
                                                title: `Are you want to delete this group`,
                                                callback: () => deleteMutation.mutate(row.id),
                                                buttonProps: {
                                                    color: 'red',
                                                },
                                                acceptLabel: 'Delete',
                                            }),
                                        );
                                    }}
                                    size="sm"
                                    color="red"
                                >
                                    <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} color="white" />
                                </ActionIcon>
                            </Box>
                        );
                    },
                }}
            />
        );
    }, [data, isPending, actions]);

    const handleClose = () => {
        setDataUpdate(null);
        close();
    };

    useEffect(() => {
        choosesRef.current = chooses;
    }, [chooses]);

    return (
        <Box>
            {table}

            <Modal opened={opened} onClose={handleClose} title={`${dataUpdate ? 'Edit' : 'Add'} customer group`} centered>
                <GenerateForm
                    layout={{
                        lg: { col: 1, gap: 0 },
                    }}
                    initData={dataUpdate || undefined}
                    inputs={inputs}
                    onSubmit={(values) => {
                        if (dataUpdate) {
                            updateMutation.mutate({ data: { name: values.name }, id: dataUpdate.id });
                        } else {
                            createMutation.mutate({ name: values.name });
                        }
                    }}
                />
            </Modal>
        </Box>
    );
}
