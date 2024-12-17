import { IAdminUser } from '@/types';
import { Divider, Stack, Text } from '@mantine/core';
import { ReactNode } from 'react';

export interface IAdminUserBaseProps {
    title: string;
    children: ReactNode;
    id: IAdminUser['id'];
}

export default function AdminUserBase({ title, children }: IAdminUserBaseProps) {
    return (
        <>
            <Stack h={300} bg="var(--mantine-color-body)" align="stretch" justify="flex-start" gap="md">
                <Text className="uppercase text-left font-semibold">{title}</Text>
                <Divider />

                {children}
            </Stack>
        </>
    );
}
