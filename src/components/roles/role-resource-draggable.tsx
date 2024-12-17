import { IResource } from '@/types';
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@mantine/core';
import * as React from 'react';

export interface IRoleResourceDraggableProps {
    data: IResource;
    parent: string;
}

export default function RoleResourceDraggable({ data, parent }: IRoleResourceDraggableProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: data.id,
        data: { ...data, parent },
    });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: transform ? 999 : undefined,
    };

    return (
        <Card ref={setNodeRef} {...listeners} {...attributes} style={style} shadow="sm" padding="lg" radius="md" withBorder>
            {data.resource_name}
        </Card>
    );
}
