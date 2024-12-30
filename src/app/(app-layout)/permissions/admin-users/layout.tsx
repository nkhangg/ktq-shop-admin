'use client';
import { ApiAdminUsers } from '@/api';
import { ExpiredUseTimePasswordSSE } from '@/api/sse';
import { GenerateForm } from '@/components/lib/generate-form';
import { TInput } from '@/components/lib/generate-form/type';
import { container } from '@/di/container';
import { RootState } from '@/store';
import { useAdminUserStore } from '@/store/zustand';
import { TComfirmPassword } from '@/types';
import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import { useSelector } from 'react-redux';

export interface IAdminUserPageRootLayoutProps {
    children: ReactNode;
}

export default function AdminUserPageRootLayout({ children }: IAdminUserPageRootLayoutProps) {
    const adminUsersApi = container.get(ApiAdminUsers);

    const { setCallback, callback, setUseTimePassword, useTimePassword } = useAdminUserStore();

    const { user } = useSelector((state: RootState) => state.app);

    const [opened, { open, close }] = useDisclosure(false);

    const { data, refetch } = useQuery({
        queryKey: ['admin-users/use-time-password[GET]'],
        queryFn: () => adminUsersApi.getUseTimePassword(),
    });

    const inputs: TInput<TComfirmPassword>[] = [
        {
            key: 'password',
            type: 'password',
            title: 'Enter your password',
        },
        {
            key: 'use_time',
            type: 'checkbox',
            data: ['Use up to 5 minutes later'],
            title: 'Use time',
            validate: {
                validateFN: () => null,
            },
        },
    ];

    useEffect(() => {
        if (callback) {
            open();
        }
    }, [callback]);

    useEffect(() => {
        if (!user) return;

        const eventSourceClient = new ExpiredUseTimePasswordSSE(String(user?.id));

        if (eventSourceClient.eventSource) {
            eventSourceClient.eventSource.onmessage = (data: MessageEvent) => {
                refetch();
            };
        }

        return () => {
            eventSourceClient.close();
        };
    }, [user]);

    useEffect(() => {
        if (!data?.data) return;

        setUseTimePassword(data.data);
    }, [data]);

    const handleClose = () => {
        setCallback(null);

        close();
    };

    return (
        <>
            {children}

            <Modal zIndex={999} opened={opened} onClose={handleClose} centered>
                <GenerateForm
                    layout={{
                        lg: {
                            col: 1,
                        },
                    }}
                    inputs={inputs}
                    onSubmit={async (values) => {
                        if (!callback) return;

                        await callback({
                            password: values.password,
                            use_time: values.use_time,
                        });

                        if (values.use_time) {
                            requestIdleCallback(() => refetch());
                        }

                        handleClose();
                    }}
                />
            </Modal>
        </>
    );
}
