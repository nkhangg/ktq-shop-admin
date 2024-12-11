'use client';
import { ApiCustomerGroup, ApiCustomers } from '@/api';
import { Api, ApiError } from '@/api/api';
import { UpdateCustomerData } from '@/api/customers';
import { container } from '@/di/container';
import moment from '@/instances/moment';
import { Box, ComboboxData } from '@mantine/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import capitalize from 'capitalize';
import { useEffect, useMemo, useState } from 'react';
import { GenerateForm } from '../lib/generate-form';
import { TInput } from '../lib/generate-form/type';
import CUpdateAvatar from './children/update-avatar';
import CUpdateBgCover from './children/update-bg-cover';
import CustomersBase, { ICustomersBaseProps } from './customers-base';
export interface IAccountInformationProps extends ICustomersBaseProps {}

export default function AccountInformation(props: IAccountInformationProps) {
    const customersApi = container.get(ApiCustomers);
    const customerGroupApi = container.get(ApiCustomerGroup);

    const { data } = useQuery({
        queryFn: () => customersApi.getCustomer(props.id),
        queryKey: ['customers/update/[GET]'],
    });

    const { mutate } = useMutation({
        mutationFn: (data: UpdateCustomerData) => customersApi.update(data),
        mutationKey: ['customers/update/[PUT]'],
        onSuccess(data) {
            if (!data.data) return;

            setInitFormData({
                ...data.data,
                group_id: String(data.data?.customerGroup.id),
            });

            Api.handle_response(data);
        },
        onError(error) {
            Api.response_form_error(error as ApiError);
        },
    });

    const customerGroupQuery = useQuery({
        queryFn: () => customerGroupApi.getAll({}),
        queryKey: ['customer-group/[GET]'],
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

    const [initFormData, setInitFormData] = useState<UpdateCustomerData | null>(null);

    const inputs: TInput<UpdateCustomerData>[] = [
        {
            key: 'id',
            type: 'show',
            title: 'ID',
        },

        {
            key: 'username',
            type: 'show',
            title: 'Username',
        },
        {
            key: 'first_name',
            type: 'text',
            title: 'First name',
        },
        {
            key: 'last_name',
            type: 'text',
            title: 'Last name',
        },
        {
            key: 'email',
            type: 'show',
            title: 'Email',
        },
        {
            key: 'phone',
            type: 'text',
            title: 'Phone',
            validate: {
                style: 'phone',
            },
        },
        {
            key: 'gender',
            type: 'select',
            data: [
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Other', value: 'other' },
            ],
            title: 'Gender',
        },
        {
            key: 'date_of_birth',
            type: 'date',
            title: 'Date of birth',
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
        },
    ];

    useEffect(() => {
        if (!data?.data) {
            setInitFormData(null);
        } else {
            setInitFormData({
                ...data.data,
                group_id: String(data.data.customerGroup.id),
            });
        }
    }, [data]);

    return (
        <CustomersBase {...props}>
            <Box>
                <CUpdateAvatar customerId={props.id} />
            </Box>

            <Box>
                <CUpdateBgCover customerId={props.id} />
            </Box>

            <GenerateForm
                initData={initFormData ? { ...initFormData, date_of_birth: initFormData.date_of_birth ? moment(initFormData.date_of_birth).toDate() : null } : undefined}
                onSubmit={(values) => {
                    mutate({ ...values, group_id: Number(values.group_id) });
                }}
                layout={{
                    xl: { col: 2, gap: 2 },
                    lg: { col: 2 },
                    md: { col: 2 },
                }}
                inputs={inputs}
            />
        </CustomersBase>
    );
}
