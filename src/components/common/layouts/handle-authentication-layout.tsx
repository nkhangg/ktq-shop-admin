'use client';
import Routes from '@/instances/routes';
import { clearForgotStore } from '@/store/slices/forgot-pass-slice';
import { getAccessToken, getRefreshToken } from '@/utils/cookies';
import { redirect } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';

export interface IHandleAuthenticationLayoutProps {
    children: ReactNode;
}

export default function HandleAuthenticationLayout({ children }: IHandleAuthenticationLayoutProps) {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = getAccessToken();
        const refresh_token = getRefreshToken();

        if (!token && !refresh_token) {
            redirect(Routes.LOGIN);
        }

        // clear forgot store
        dispatch(clearForgotStore());
    }, []);
    return <>{children}</>;
}
