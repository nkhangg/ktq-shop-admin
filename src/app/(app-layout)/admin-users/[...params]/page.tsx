'use client';
import AdminUserAccountInformation from '@/components/admin-users/admin-user-account-information';
import AdminUserPassword from '@/components/admin-users/admin-user-password';
import CustomerView from '@/components/customers/customer-view';
import { useTitle } from '@/hooks';
import { useAdminUserStore } from '@/store/zustand';
import { ICustomerPageMenuData } from '@/types';
import { Button, Divider, Grid, Stack, Text } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';

export interface IALDetailAdminUserRootPageProps {
    params: { params: string[] };
}

export default function ALDetailAdminUserRootPage({
    params: {
        params: [id, username],
    },
}: IALDetailAdminUserRootPageProps) {
    useTitle(`Admin ${username}`);

    const [tab, setTab] = useState<ICustomerPageMenuData['key']>('account-information');

    const menus: ICustomerPageMenuData[] = useMemo(() => {
        return [
            {
                key: 'account-information',
                title: 'Account Information',
                titleContent: 'Account Information',
                component: AdminUserAccountInformation,
            },
            {
                key: 'password',
                title: 'Password',
                titleContent: 'Password control',
                component: AdminUserPassword,
            },
            {
                key: 'role',
                title: 'Role',
                titleContent: 'Role',
                component: CustomerView,
            },
            {
                key: 'control',
                title: 'Control',
                titleContent: 'Control',
                component: CustomerView,
            },
        ];
    }, []);

    const children = useMemo(() => {
        const data = menus.find((menu) => menu.key === tab);

        if (!data) return;

        return <data.component id={id} title={data.titleContent} />;
    }, [tab, menus]);

    return (
        <>
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
        </>
    );
}
