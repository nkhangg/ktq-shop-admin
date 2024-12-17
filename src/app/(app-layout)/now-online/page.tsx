'use client';
import { ApiCustomers } from '@/api';
import ActiveColumn from '@/components/lib/table/active-column';
import Table from '@/components/lib/table/table';
import { IColumn } from '@/components/lib/table/type';
import { container } from '@/di/container';
import { useTitle } from '@/hooks';
import { formatTime } from '@/instances/moment';
import Routes from '@/instances/routes';
import { ICustomer } from '@/types';
import { ActionIcon, Box } from '@mantine/core';
import { IconLink } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export interface IALNowOnlineRootPageProps {}

export default function ALNowOnlineRootPage(props: IALNowOnlineRootPageProps) {
    useTitle('Customers Online');

    const customersApi = container.get(ApiCustomers);

    const [params, setParams] = useState<Record<string, string | number>>({});

    const { data, isPending } = useQuery({
        queryFn: () => customersApi.getCustomersOnline(params),
        queryKey: ['customers/online[GET]', { ...params }],
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
                actions={{
                    title: (
                        <div className="w-full flex items-center justify-center">
                            <span className="text-center">Action</span>
                        </div>
                    ),
                    body(row) {
                        return (
                            <Box className="flex items-center justify-center">
                                <ActionIcon component={Link} href={Routes.DETAIL_CUSTOMER(row)} size="sm">
                                    <IconLink style={{ width: '70%', height: '70%' }} stroke={1.5} color="white" />
                                </ActionIcon>
                            </Box>
                        );
                    },
                }}
                rowKey="id"
            />
        );
    }, [data, isPending]);

    return <Box>{table}</Box>;
}
