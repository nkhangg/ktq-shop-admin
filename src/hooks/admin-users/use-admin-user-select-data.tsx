'use client';
import { ApiAdminUsers } from '@/api';
import { container } from '@/di/container';
import { ComboboxData } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export default function useAdminUsersSelectData() {
    const adminUserApi = container.get(ApiAdminUsers);

    const customerGroupQuery = useQuery({
        queryFn: () => adminUserApi.getAll({ per_page: 100 }),
        queryKey: ['admin-users/select/[GET]'],
        staleTime: 100000,
        gcTime: 300000,
    });

    const adminUsersSelectData = useMemo(() => {
        if (!customerGroupQuery.data?.data) return [];

        return customerGroupQuery.data.data.map((item) => {
            return {
                label: `${item.username} - ${item.email}`,
                value: String(item.id),
            };
        }) as ComboboxData;
    }, [customerGroupQuery.data]);

    return {
        rawData: customerGroupQuery.data,
        adminUsersSelectData,
        refresh: customerGroupQuery.refetch,
    };
}
