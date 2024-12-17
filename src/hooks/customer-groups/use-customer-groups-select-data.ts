'use client';
import { ApiCustomerGroup } from '@/api';
import { container } from '@/di/container';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import capitalize from 'capitalize';
import { ComboboxData } from '@mantine/core';

export default function useCustomerGroupsSelectData() {
    const customerGroupApi = container.get(ApiCustomerGroup);

    const customerGroupQuery = useQuery({
        queryFn: () => customerGroupApi.getAll({ per_page: 100 }),
        queryKey: ['customer-group/select/[GET]'],
        staleTime: 100000,
        gcTime: 300000,
    });

    const customerGroupSelect = useMemo(() => {
        if (!customerGroupQuery.data?.data) return [];

        return customerGroupQuery.data.data.map((item) => {
            return {
                label: capitalize(item.name),
                value: String(item.id),
            };
        }) as ComboboxData;
    }, [customerGroupQuery.data]);

    return {
        customerGroupSelect,
        refresh: customerGroupQuery.refetch,
    };
}
