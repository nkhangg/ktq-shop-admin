'use client';

import AccountInformation from '@/components/customers/account-infomation';
import CustomerAddresses from '@/components/customers/customer-addresses';
import CustomerControlAccount from '@/components/customers/customer-contol-account';
import CustomerLoginHistories from '@/components/customers/customer-login-histories';
import CustomerView from '@/components/customers/customer-view';
import { useTitle } from '@/hooks';
import { Button, Divider, Grid, Stack, Text } from '@mantine/core';
import { ComponentType, useMemo, useState } from 'react';

export interface IALDetailCustomerRootPageProps {
    params: { params: string[] };
}
export type CustomerPageMenuData = {
    key: string;
    title: string;
    titleContent: string;
    component: ComponentType<any>;
};

export default function ALDetailCustomerRootPage({
    params: {
        params: [id, username],
    },
}: IALDetailCustomerRootPageProps) {
    useTitle(`${username}`);

    const [tab, setTab] = useState<CustomerPageMenuData['key']>('customer-view');

    const menus: CustomerPageMenuData[] = useMemo(() => {
        return [
            {
                key: 'customer-view',
                title: 'Customer View',
                titleContent: 'Personal Information',
                component: CustomerView,
            },
            {
                key: 'account-information',
                title: 'Account Information',
                titleContent: 'Account Information',
                component: AccountInformation,
            },
            {
                key: 'address',
                title: 'Address',
                titleContent: 'Personal Information',
                component: CustomerAddresses,
            },
            {
                key: 'orders',
                title: 'Orders',
                titleContent: 'Personal Information',
                component: CustomerView,
            },
            {
                key: 'shopping-cart',
                title: 'Shopping Cart',
                titleContent: 'Personal Information',
                component: CustomerView,
            },
            {
                key: 'login-histories',
                title: 'Login Histories',
                titleContent: 'Histories',
                component: CustomerLoginHistories,
            },
            {
                key: 'control',
                title: 'Control',
                titleContent: 'Control Account',
                component: CustomerControlAccount,
            },
        ];
    }, []);

    const children = useMemo(() => {
        const data = menus.find((menu) => menu.key === tab);

        if (!data) return;

        return <data.component id={id} title={data.titleContent} />;
    }, [tab, menus]);

    return (
        <Grid gutter="lg">
            <Grid.Col span={2} className="">
                <Stack h={300} bg="var(--mantine-color-body)" align="stretch" justify="flex-start" gap="md">
                    <Text className="uppercase text-center font-semibold">Information</Text>
                    <Divider />
                    <Stack>
                        {menus.map((menu) => {
                            return (
                                <Button onClick={() => setTab(menu.key)} key={menu.key} variant={tab === menu.key ? 'light' : 'default'} className="text-left">
                                    {menu.title}
                                </Button>
                            );
                        })}
                    </Stack>
                </Stack>
            </Grid.Col>
            <Grid.Col span={10} className="">
                {children}
            </Grid.Col>
        </Grid>
    );
}
