import { ApiResources } from '@/api';
import { container } from '@/di/container';
import { IResource } from '@/types';
import { Chip, Modal, Table, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';

export interface IResourceRoleAcceptProps {
    opened: boolean;
    id: IResource['id'];
    close: () => void;
}

export default function ResourceRoleAccept({ close, opened, id }: IResourceRoleAcceptProps) {
    const resourceApi = container.get(ApiResources);
    const { data } = useQuery({
        queryKey: ['resources/id[GET]', id],
        queryFn: () => resourceApi.getResourceById(Number(id)),
    });

    return (
        <Modal opened={opened} onClose={close} centered size={'lg'} title="Resource Role Accept">
            <Table highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Name</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {data?.data?.roleResources && data.data.roleResources.length > 0 ? (
                        data.data.roleResources.map(({ role }) => (
                            <Table.Tr key={role.role_name}>
                                <Table.Td>{role.id}</Table.Td>
                                <Table.Td>
                                    <Chip checked={false} size="xs" color="cyan">
                                        {role.role_name}
                                    </Chip>
                                </Table.Td>
                            </Table.Tr>
                        ))
                    ) : (
                        <Table.Tr>
                            <Table.Td colSpan={2} align="center">
                                <Text>No roles available</Text>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </Modal>
    );
}
