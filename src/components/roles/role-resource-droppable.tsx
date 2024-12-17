'use client';
import { IApiResponsePagination } from '@/api/api';
import { IResource, IRole } from '@/types';
import { cn } from '@/utils/app';
import { useDroppable } from '@dnd-kit/core';
import { Box, Divider, Overlay, Pagination, Text, TextInput } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import RoleResourceDraggable from './role-resource-draggable';
import { container } from '@/di/container';
import { ApiResources } from '@/api';
import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';

export interface IRoleResourceDroppableProps {
    id: string;
    role_id: IRole['id'];
    title: string;
    labelEmpty?: string;
    queryFN: (...args: any[]) => Promise<IApiResponsePagination<IResource[]>>;
}

export default function RoleResourceDroppable({ id, title, role_id, labelEmpty = 'Drop to add first resource for this role', queryFN }: IRoleResourceDroppableProps) {
    const { isOver, setNodeRef, active, over } = useDroppable({
        id,
    });

    const form = useForm({
        mode: 'controlled',
        initialValues: {
            search: '',
        },
    });

    const [params, setParams] = useState<Record<string, any>>({});

    const style = {
        padding: '20px',
        minHeight: '100px',
        margin: '10px',
        borderRadius: '5px',
    };

    const { data } = useQuery({
        queryKey: [`resources/${id}/[GET]`, role_id, { ...params }],
        queryFn: () => queryFN(role_id, params),
    });

    return (
        <Box ref={setNodeRef} style={style}>
            <Box className="flex flex-col gap-5">
                <Box className="flex flex-col gap-5">
                    <Box>
                        <Text className="px-3 font-bold" mb={'xs'} size="lg">
                            {title}
                        </Text>
                        <Divider />
                    </Box>

                    <Box className="flex items-end justify-between">
                        <form
                            onSubmit={form.onSubmit(({ search }) => {
                                setParams((prev) => ({ ...prev, search }));
                            })}
                        >
                            <TextInput {...form.getInputProps('search')} size="xs" label={'Search'} placeholder={`Find ${title.toLocaleLowerCase()}`} />
                        </form>

                        <Pagination
                            size={'sm'}
                            total={data?.last_page || 0}
                            value={data?.current_page}
                            onChange={(page) => {
                                setParams((prev) => ({ ...prev, page }));
                            }}
                        />
                    </Box>
                </Box>

                <Box className={cn('flex flex-col gap-3 relative')}>
                    {(data?.data ?? []).map((item) => {
                        return <RoleResourceDraggable parent={id} data={item} key={item.id} />;
                    })}

                    {(data?.data ?? []).length <= 0 ? (
                        <Box className="flex items-center justify-center border min-h-[40vh] rounded-lg">
                            <Text className="font-bold text-xl">{labelEmpty}</Text>
                        </Box>
                    ) : (
                        ''
                    )}

                    {isOver && active?.data.current?.parent !== over?.id ? (
                        <Overlay className="flex items-center justify-center" radius={'md'}>
                            <Text className="font-bold text-xl">Drop to add</Text>
                        </Overlay>
                    ) : (
                        ''
                    )}
                </Box>
            </Box>
        </Box>
    );
}
