'use client';
import { ApiConfigs } from '@/api';
import { Api, ApiError } from '@/api/api';
import ConfigModal from '@/components/configs/config-modal';
import ActionColumn from '@/components/lib/table/action-column';
import Table from '@/components/lib/table/table';
import { IActionData, IColumn, TRefTableActionFn } from '@/components/lib/table/type';
import { container } from '@/di/container';
import { keySpaces, keyTypes } from '@/instances/constants';
import { IConfig } from '@/types';
import { Box, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

export interface IALConfigurationRootPageProps {}

export default function ALConfigurationRootPage(props: IALConfigurationRootPageProps) {
    const configsApi = container.get(ApiConfigs);
    const [params, setParams] = useState<Record<string, string | number>>({});

    const [chooses, setChooses] = useState<IConfig[]>([]);

    const [clickData, setClickData] = useState<IConfig | null>(null);

    const choosesRef = useRef<IConfig[]>(chooses);

    const refAction: TRefTableActionFn = useRef({});

    const [opened, { open, close }] = useDisclosure(false);

    const dispatch = useDispatch();

    const { data, isPending, refetch } = useQuery({
        queryKey: ['customers[GET]', { ...params }],
        queryFn: () => configsApi.getConfigs(params),
    });

    const deletesMutation = useMutation({
        mutationKey: ['configs[DELETE]'],
        mutationFn: (data: IConfig[]) => configsApi.deleteConfigs(data),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
        },
    });

    const columns: IColumn<IConfig>[] = [
        {
            key: 'id',
            title: 'ID',
            typeFilter: 'number',
        },
        {
            key: 'key_name',
            title: 'Name',
            typeFilter: 'text',
        },
        {
            key: 'key_space',
            title: 'Space',
            typeFilter: {
                type: 'select',
                data: keySpaces,
            },
            renderRow(row, _) {
                return (
                    <Text
                        style={{
                            color: row.key_space === 'private' ? 'red' : 'green',
                        }}
                    >
                        {row.key_space}
                    </Text>
                );
            },
        },
        {
            key: 'key_type',
            title: 'Type',
            typeFilter: {
                type: 'select',
                data: keyTypes,
            },
        },
        {
            key: 'key_value',
            title: 'Raw Value',
            typeFilter: 'text',
        },
    ];

    useEffect(() => {
        choosesRef.current = chooses;
    }, [chooses]);

    const actions = useMemo(() => {
        return [
            {
                title: 'Delete',
                callback: () => deletesMutation.mutate(chooses),
                key: 'delete',
                comfirmAction: true,
                disabled: chooses.length <= 0,
                comfirmOption: (data) => {
                    return {
                        title: `Are you want to delete ${choosesRef.current.length} configs`,
                    };
                },
            },
            {
                title: 'Add',
                callback: open,
                key: 'add',
            },
        ] as IActionData[];
    }, [chooses]);

    const table = useMemo(() => {
        return (
            <Table
                striped
                highlightOnHover
                showLoading={false}
                styleDefaultHead={{
                    justifyContent: 'flex-start',
                    width: 'fit-content',
                }}
                onChooses={setChooses}
                options={{
                    total: data?.total,
                    perPage: data?.per_page,
                    currentPage: data?.current_page,
                    lastPage: data?.last_page,
                    from: data?.from,
                    to: data?.to,
                }}
                actionsOptions={{
                    actions,
                    loading: isPending,
                    selectProps: {
                        placeholder: 'Actions',
                        label: undefined,
                    },
                    refAction,
                }}
                rows={data?.data || []}
                withColumnBorders
                withTableBorder
                columns={columns}
                onParams={(data) => {
                    setParams(data);
                }}
                rowKey="id"
                actions={{
                    title: (
                        <div className="w-full flex items-center justify-center">
                            <span className="text-center">Action</span>
                        </div>
                    ),
                    body(row) {
                        return (
                            <ActionColumn
                                messages={(_, data) => {
                                    return {
                                        delete: `Are you sure delete configs`,
                                    };
                                }}
                                data={row}
                                editOption={{
                                    callback: () => {
                                        setClickData(row);
                                        open();
                                    },
                                }}
                                onSubmit={(action) => {
                                    if (action.key === 'delete') {
                                        deletesMutation.mutate([row]);
                                    }
                                }}
                            />
                        );
                    },
                }}
            />
        );
    }, [data, isPending, actions, refAction]);

    return (
        <Box>
            {table}

            <ConfigModal
                opened={opened}
                data={clickData}
                onClose={() => {
                    close();
                    refetch();
                    setClickData(null);
                }}
            />
        </Box>
    );
}
