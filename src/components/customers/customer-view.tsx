'use client';
import { useViewCustomer } from '@/hooks/customers';
import { formatTime } from '@/instances/moment';
import { Table } from '@mantine/core';
import capitalize from 'capitalize';
import { useMemo } from 'react';

import CustomersBase, { ICustomersBaseProps } from './customers-base';

import 'cropperjs/dist/cropper.css';
import { showAddress } from '@/utils/app';

export interface ICustomerViewProps extends ICustomersBaseProps {}

export default function CustomerView(props: ICustomerViewProps) {
    const { data } = useViewCustomer(props.id);

    const viewData = useMemo(() => {
        const view = data?.data;
        if (!view) return [];

        const blacklistStatus = view.blacklist
            ? `Block start ${formatTime(view.blacklist.start_at)} end ${view.blacklist.end_at ? formatTime(view.blacklist.end_at) : 'Until unlocked'}`
            : 'Unlocked';

        return [
            {
                title: 'Last Logged In',
                content: `${formatTime(view.last_login_in)} (${view.online ? 'Online' : 'Offline'})`,
            },
            {
                title: 'Account Lock',
                content: blacklistStatus,
            },
            {
                title: 'Account Created',
                content: formatTime(view.customer.created_at),
            },
            {
                title: 'Customer Group',
                content: capitalize(view.group.name),
            },
            {
                title: 'Default Billing Address',
                content: view.address_default ? showAddress(view.address_default) : 'N/A',
            },
        ];
    }, [data]);

    return (
        <CustomersBase {...props}>
            <Table striped withRowBorders={false}>
                <Table.Tbody>
                    {viewData.map((item) => (
                        <Table.Tr key={item.title}>
                            <Table.Td>{item.title}:</Table.Td>
                            <Table.Td>{item.content}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </CustomersBase>
    );
}
