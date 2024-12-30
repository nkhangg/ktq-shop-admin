import { ApiPermissions } from '@/api';
import { container } from '@/di/container';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import capitalize from 'capitalize';
import { ComboboxData } from '@mantine/core';

export default function usePermissionSelectData() {
    const permissionsApi = container.get(ApiPermissions);

    const { data, refetch } = useQuery({
        queryKey: ['admin-permission/select[GET]'],
        queryFn: () => permissionsApi.getAll({ per_page: 100 }),
        staleTime: 100000,
        gcTime: 300000,
    });

    const permissionsDataSelect = React.useMemo(() => {
        if (!data?.data) return [];

        return data.data.map((item) => {
            return {
                label: capitalize(item.permission_code),
                value: String(item.id),
            };
        }) as ComboboxData;
    }, [data]);

    return {
        rawData: data?.data || [],
        permissionsDataSelect,
        refresh: refetch,
    };
}
