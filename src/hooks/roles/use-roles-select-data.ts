'use client';
import { ApiRoles } from '@/api';
import { container } from '@/di/container';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import capitalize from 'capitalize';
import { ComboboxData } from '@mantine/core';
export default function useRolesSelectData() {
    const rolesApi = container.get(ApiRoles);

    const { data, refetch } = useQuery({
        queryFn: () => rolesApi.getAll({ per_page: 100 }),
        queryKey: ['roles/select/[GET]'],
        staleTime: 100000,
        gcTime: 300000,
    });

    const rolesSelect = useMemo(() => {
        if (!data?.data) return [];

        return data.data.map((item) => {
            return {
                label: capitalize(item.role_name),
                value: String(item.id),
            };
        }) as ComboboxData;
    }, [data]);

    return {
        rolesSelect,
        refresh: refetch,
    };
}
