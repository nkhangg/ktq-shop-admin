'use client';
import { ApiAuthentication } from '@/api';
import { container } from '@/di/container';
import Routes from '@/instances/routes';
import { clearAllToken } from '@/utils/cookies';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ALLogoutRootPage() {
    const apiAuthentication = container.get(ApiAuthentication);

    const router = useRouter();

    const handleLogout = () => {
        clearAllToken();
        router.push(Routes.LOGIN);
    };

    const { mutate } = useMutation({
        mutationFn: () => apiAuthentication.logout(),
        onError: handleLogout,
        onSuccess: handleLogout,
    });

    useEffect(() => {
        mutate();
    }, []);
}
