import { ICustomer } from '@/types';
import { Divider, Stack, Text } from '@mantine/core';
import { ReactNode } from 'react';

export interface ICustomersBaseProps {
    title: string;
    children: ReactNode;
    id: ICustomer['id'];
}

export default function CustomersBase({ title, children }: ICustomersBaseProps) {
    return (
        <Stack h={300} bg="var(--mantine-color-body)" align="stretch" justify="flex-start" gap="md">
            <Text className="uppercase text-left font-semibold">{title}</Text>
            <Divider />

            {children}
        </Stack>
    );
}
