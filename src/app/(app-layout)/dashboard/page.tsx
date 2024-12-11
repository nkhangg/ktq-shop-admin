'use client';
import { ApiAuthentication } from '@/api';
import { container } from '@/di/container';
import { increment } from '@/store/slices/forgot-pass-slice';
import { Button } from '@mantine/core';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function ALDashboardRootPage() {
    const dispatch = useDispatch();

    const apiAuthentication = container.get(ApiAuthentication);

    useEffect(() => {
        (async () => {
            const response = await apiAuthentication.me();

            console.log(response);
        })();
    }, []);
    return (
        <div>
            <Button onClick={() => dispatch(increment())} title="Click me">
                Click me
            </Button>
        </div>
    );
}
