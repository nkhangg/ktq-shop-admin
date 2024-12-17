'use client';
export interface IALDetailRoleRootPageProps {
    params: { params: string[] };
}
import { ApiResources } from '@/api';
import { RoleResourceDroppable } from '@/components/roles';
import { container } from '@/di/container';
import { useTitle } from '@/hooks';
import { DndContext } from '@dnd-kit/core';
import { Box } from '@mantine/core';
import { useQueries } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export default function ALDetailRoleRootPage({
    params: {
        params: [id, name],
    },
}: IALDetailRoleRootPageProps) {
    useTitle(name);

    const resourceApi = container.get(ApiResources);

    const [dropData, setDropData] = useState<string | null>(null);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (!over) {
            setDropData(`Item "${active.id}" không được thả vào vùng nào.`);
            return;
        }

        if (active.data.current?.parent === over.id) {
            setDropData(`Item "${active.id}" đã nằm trong vùng "${over.id}" rồi!`);
            return;
        }

        setDropData(`Item "${active.id}" thả vào vùng "${over.id}"`);
    };

    console.log(id);

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <Box className="grid grid-cols-2 gap-5">
                <RoleResourceDroppable
                    role_id={Number(id)}
                    queryFN={(role_id, params = {}) => resourceApi.resourceByRole(role_id, params)}
                    id="have-access-droppable"
                    title="Have access"
                />

                <RoleResourceDroppable
                    role_id={Number(id)}
                    queryFN={(role_id, params = {}) => resourceApi.resourceIgnoreByRole(role_id, params)}
                    id="no-access-permissions-droppable"
                    title="No Access Permissions"
                    labelEmpty="Drop here to remove it from the whitelist"
                />
            </Box>
            <p>{dropData}</p>
        </DndContext>
    );
}
