'use client';
import ApiAddress from '@/api/addresses';
import { Api, ApiError } from '@/api/api';
import { container } from '@/di/container';
import moment from '@/instances/moment';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { IAddress } from '@/types';
import { cn } from '@/utils/app';
import { ActionIcon, Box, Modal, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEdit, IconPointerHeart, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Table from '../lib/table/table';
import { IActionData, IColumn } from '../lib/table/type';
import CustomersBase, { ICustomersBaseProps } from './customers-base';
import CAddressAction, { CAddressActionRef } from './children/address-action';

export interface ICustomerAddressesProps extends ICustomersBaseProps {}

export default function CustomerAddresses(props: ICustomerAddressesProps) {
    const addressApi = container.get(ApiAddress);

    const [params, setParams] = useState<Record<string, string | number>>({});

    const [chooses, setChooses] = useState<IAddress[]>([]);

    const choosesRef = useRef<IAddress[]>(chooses);

    const [addressUpdate, setAddressUpdate] = useState<IAddress | null>(null);

    const [addressOpened, addressModalAction] = useDisclosure(false);

    const dispatch = useDispatch();

    const { data, isPending, refetch } = useQuery({
        queryFn: () => addressApi.getAddressesByCustomer(props.id, params),
        queryKey: ['customers/addresses[GET]', { ...params }],
    });

    const setDefaultMutation = useMutation({
        mutationFn: (address_id: IAddress['id']) => addressApi.setAddressDefault(props.id, address_id),
        mutationKey: ['customers/addresses/set-default[POST]'],
        onSuccess(data) {
            Api.handle_response(data);

            refetch();
        },
        onError(error) {
            Api.response_form_error(error as ApiError);
        },
    });

    const deletesMutation = useMutation({
        mutationFn: (addresses: IAddress[]) => addressApi.deletesByCustomer(props.id, addresses),
        mutationKey: ['customers/addresses/multiple[DELETE]'],
        onSuccess(data) {
            Api.handle_response(data);

            refetch();
        },
        onError(error) {
            Api.response_form_error(error as ApiError);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (address_id: IAddress['id']) => addressApi.deleteByCustomer(props.id, address_id),
        mutationKey: ['customers/addresses/multiple[DELETE]'],
        onSuccess(data) {
            Api.handle_response(data);

            refetch();
        },
        onError(error) {
            Api.response_form_error(error as ApiError);
        },
    });

    const columns: IColumn<IAddress>[] = [
        {
            key: 'id',
            title: 'ID',
            typeFilter: 'number',
        },
        {
            key: 'address_line',
            title: 'Address line',
            typeFilter: 'text',
        },
        {
            key: 'ward',
            title: 'Ward',
            typeFilter: 'text',
        },
        {
            key: 'district',
            title: 'District',
            typeFilter: 'text',
        },
        {
            key: 'city',
            title: 'City',
            typeFilter: 'text',
        },
        {
            key: 'state',
            title: 'State',
            typeFilter: 'text',
        },
        {
            key: 'postal_code',
            title: 'Postal code',
            typeFilter: 'text',
        },
        {
            key: 'country',
            title: 'Country',
            typeFilter: 'text',
            renderRow(row) {
                return <span>{row.country?.country_name || ''}</span>;
            },
        },
        {
            key: 'is_default',
            title: 'Default',
            typeFilter: 'text',
            renderRow(row) {
                return (
                    <Box className="flex items-center justify-center">
                        <div
                            className={cn(`w-3 aspect-square rounded-full`, {
                                ['bg-green-700']: row.is_default,
                                ['bg-red-700']: !row.is_default,
                            })}
                        ></div>
                    </Box>
                );
            },
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

    const actions = useMemo(() => {
        return [
            {
                title: 'Delete',
                callback: () => deletesMutation.mutate(chooses),
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
                callback: () => addressModalAction.toggle(),
                key: 'add',
            },
        ] as IActionData[];
    }, [chooses]);

    const handleSetDefault = (data: IAddress) => {
        dispatch(
            addComfirm({
                callback: () => setDefaultMutation.mutate(data.id),
                title: `This address to set default`,
            }),
        );
    };

    const handleDelete = (data: IAddress) => {
        dispatch(
            addComfirm({
                callback: () => deleteMutation.mutate(data.id),
                title: `This address to delete`,
                acceptLabel: 'Delete',
                buttonProps: { color: 'red' },
            }),
        );
    };

    const handleCloseAddressModal = () => {
        addressModalAction.close();

        setAddressUpdate(null);
    };

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
                            <Box className="flex items-center justify-center gap-2">
                                <Tooltip hidden={row.is_default} label={'Set default'}>
                                    <ActionIcon onClick={() => handleSetDefault(row)} disabled={row.is_default} color="gray">
                                        <IconPointerHeart style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                    </ActionIcon>
                                </Tooltip>

                                <Tooltip hidden={row.is_default} label={'Update'}>
                                    <ActionIcon
                                        onClick={() => {
                                            setAddressUpdate(row);
                                            addressModalAction.open();
                                        }}
                                        color="gray"
                                    >
                                        <IconEdit style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                    </ActionIcon>
                                </Tooltip>

                                <Tooltip label={'Delete'}>
                                    <ActionIcon onClick={() => handleDelete(row)} disabled={row.is_default} color="red">
                                        <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                    </ActionIcon>
                                </Tooltip>
                            </Box>
                        );
                    },
                }}
            />
        );
    }, [data, isPending, actions]);

    return (
        <CustomersBase {...props}>
            <Box pb={'xl'}>{table}</Box>

            <Modal size={'xl'} opened={addressOpened} onClose={handleCloseAddressModal} centered>
                <CAddressAction
                    addressData={addressUpdate || undefined}
                    onSuccess={() => {
                        handleCloseAddressModal();
                        refetch();
                    }}
                    customerId={props.id}
                />
            </Modal>
        </CustomersBase>
    );
}
