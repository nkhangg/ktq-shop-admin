'use client';
import { cn } from '@/utils/app';
import { Box, Button, Card, Modal, Table, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { IconCircleChevronDown, IconCircleChevronRight, IconClearFormatting, IconRefresh, IconTrash } from '@tabler/icons-react';
import CacheChart from '@/components/caches-management/cache-chart';
import { useQuery } from '@tanstack/react-query';
import { container } from '@/di/container';
import { ApiCacheService } from '@/api';
import { useEffect, useMemo } from 'react';
import ClearCacheModal from '@/components/caches-management/cache-clear-modal';
export interface IALCachesManagementRootPageProps {}

export default function ALCachesManagementRootPage(props: IALCachesManagementRootPageProps) {
    const [opened, { toggle }] = useDisclosure(false);
    const [clearOpened, clearAction] = useDisclosure(false);

    const cacheServiceApi = container.get(ApiCacheService);

    const { data, refetch } = useQuery({
        queryKey: ['cache-services[GET]', opened],
        queryFn: () => cacheServiceApi.getStatus(opened),
    });

    const elements = useMemo(() => {
        return [
            { title: 'Total Keys', value: data?.data?.total_keys },
            { title: 'Used Memory', value: data?.data?.used_memory },
        ];
    }, [data]);

    const dataChart = useMemo(() => {
        if (!data?.data) return [];

        const { used_memory, total_keys, ...prev } = data.data;

        return transformObjectToArray(prev);
    }, [data]);

    const rows = elements.map((element) => (
        <Table.Tr key={element.title}>
            <Table.Td className="font-bold text-lg">{element.title}</Table.Td>
            <Table.Td className="font-bold text-lg">{element.value}</Table.Td>
        </Table.Tr>
    ));

    function transformObjectToArray(obj: Record<string, any>): { value: number; name: string }[] {
        const result: { value: number; name: string }[] = [];

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const transformedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

                result.push({
                    name: transformedKey,
                    value: Number(obj[key]),
                });
            }
        }

        return result;
    }

    return (
        <>
            <Box className="grid grid-cols-12 gap-5">
                <Card radius={'md'} className="col-span-6 h-fit">
                    <Table>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </Card>
                <Card radius={'md'} className="col-span-6">
                    <Box
                        className={cn('flex items-center h-full gap-2', {
                            ['justify-center']: !opened,
                            ['justify-end']: opened,
                        })}
                    >
                        <Button onClick={() => clearAction.toggle()} color="red" size="xs" rightSection={<IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />}>
                            Clear cache
                        </Button>
                        <Button onClick={() => refetch()} color="teal" size="xs" rightSection={<IconRefresh style={{ width: '70%', height: '70%' }} stroke={1.5} />}>
                            Refresh
                        </Button>
                        <Tooltip hidden={opened} label={'This functionality may affect application performance'}>
                            <Button
                                size="xs"
                                onClick={toggle}
                                rightSection={
                                    opened ? (
                                        <IconCircleChevronDown style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                    ) : (
                                        <IconCircleChevronRight style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                    )
                                }
                            >
                                {opened ? 'Hide chart' : 'Show chart'}
                            </Button>
                        </Tooltip>
                    </Box>

                    {opened && (
                        <Box className="flex items-center justify-center mt-4">
                            <CacheChart data={dataChart} />
                        </Box>
                    )}
                </Card>
            </Box>

            <ClearCacheModal
                data={dataChart}
                opened={clearOpened}
                onClose={() => {
                    clearAction.close();
                    refetch();
                }}
            />
        </>
    );
}
