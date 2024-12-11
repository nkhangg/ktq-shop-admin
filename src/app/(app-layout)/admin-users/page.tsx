'use client';
import { ApiUsers } from '@/api';
import ActionColumn from '@/components/lib/table/action-column';
import ActiveColumn from '@/components/lib/table/active-column';
import Table from '@/components/lib/table/table';
import { IActionData, IColumn, TRefTableActionFn } from '@/components/lib/table/type';
import { container } from '@/di/container';
import { formatTime } from '@/instances/moment';
import Routes from '@/instances/routes';
import capitalize from 'capitalize';
import { RootState } from '@/store';
import { IAdminUser } from '@/types';
import { Box } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface IALAdminUsersRootPageProps {}

export default function ALAdminUsersRootPage(props: IALAdminUsersRootPageProps) {
    const usersApi = container.get(ApiUsers);
    const [params, setParams] = useState<Record<string, string | number>>({});

    const [chooses, setChooses] = useState<IAdminUser[]>([]);

    const choosesRef = useRef<IUser[]>(chooses);

    const refAction: TRefTableActionFn = useRef({});

    const { isOpen } = useSelector((state: RootState) => state.comfirm);
    const dispatch = useDispatch();

    const { data, isPending, refetch } = useQuery({
        queryKey: ['customers[GET]', { ...params }],
        queryFn: () => usersApi.getAll(params),
    });

    const columns: IColumn<IAdminUser>[] = [
        {
            key: 'id',
            title: 'ID',
            typeFilter: 'number',
        },
        {
            key: 'username',
            title: 'Username',
            typeFilter: 'text',
        },
        {
            key: 'email',
            title: 'Email',
            typeFilter: 'text',
        },
        {
            key: 'first_name',
            title: 'First name',
            typeFilter: 'text',
        },
        {
            key: 'last_name',
            title: 'Last name',
            typeFilter: 'text',
        },
        {
            key: 'is_active',
            title: 'Active',
            typeFilter: {
                type: 'select',
                data: ['Active', 'Un Active'],
            },
            renderRow(row) {
                return <ActiveColumn active={row.is_active} />;
            },
        },
        {
            key: 'role',
            title: 'Role',
            typeFilter: {
                type: 'select',
                data: ['Active', 'Un Active'],
            },
            renderRow(row) {
                return <span>{row?.role && capitalize(row.role.role_name)}</span>;
            },
        },
        {
            key: 'created_at',
            title: 'Created at',
            typeFilter: 'date',
            renderRow(row, _) {
                return <span>{formatTime(row.created_at)}</span>;
            },
        },
        {
            key: 'updated_at',
            title: 'Update at',
            typeFilter: 'datetime',
            renderRow(row, _) {
                return <span>{formatTime(row.updated_at)}</span>;
            },
        },
    ];

    useEffect(() => {
        choosesRef.current = chooses;
    }, [chooses]);

    const actions = useMemo(() => {
        return [
            // {
            //     title: 'Active',
            //     callback: hiddenMultipleMuta.mutate,
            //     key: 'active',
            //     comfirmAction: true,
            //     disabled: chooses.length <= 0,
            //     comfirmOption: (data) => {
            //         return {
            //             title: `Are you want to active ${choosesRef.current.length}`,
            //         };
            //     },
            // },
            // {
            //     title: 'Add',
            //     callback: createModalAction.open,
            //     key: 'add',
            // },
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
                                        delete: `Are you sure delete customer ${data.username}`,
                                    };
                                }}
                                editOption={{ type: 'link', url: Routes.DETAIL_ADMIN_USER(row) }}
                                data={row}
                                onSubmit={(action) => {
                                    if (action.key === 'delete') {
                                        // delMuta.mutate(row.id);
                                    }
                                }}
                            />
                        );
                    },
                }}
            />
        );
    }, [data, isPending, actions, refAction]);

    return <Box>{table}</Box>;
}
