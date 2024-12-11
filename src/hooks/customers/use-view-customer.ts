import { ApiCustomers } from '@/api';
import { IApiResponse } from '@/api/api';
import { ICustomerView } from '@/api/customers';
import { container } from '@/di/container';
import { useCustomerStore } from '@/store/zustand';
import { ICustomer } from '@/types';
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function useViewCustomer(id: ICustomer['id'], type: 'query' | 'mutation' = 'query') {
    const customersApi = container.get(ApiCustomers);

    const { setData } = useCustomerStore();

    let action: UseQueryResult<IApiResponse<ICustomerView>, Error> | UseMutationResult<IApiResponse<ICustomerView>, Error, void, unknown> | null = null;

    switch (type) {
        case 'query':
            action = useQuery({
                queryFn: () => customersApi.getCustomerView(id),
                queryKey: ['customers/views'],
            });
            break;
        case 'mutation':
            action = useMutation({
                mutationFn: () => customersApi.getCustomerView(id),
                mutationKey: ['customers/views'],
            });
            break;
    }

    useEffect(() => {
        if (!action.data?.data) return;

        setData(action.data?.data || null);
    }, [action.data]);

    return action;
}
