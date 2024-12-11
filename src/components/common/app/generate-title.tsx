'use client';
import { RootState } from '@/store';
import { pushTitle } from '@/store/slices/main-layout';
import { Text } from '@mantine/core';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface IGenerateTitleProps {}

export default function GenerateTitle(props: IGenerateTitleProps) {
    const pathname = usePathname();
    const { title } = useSelector((state: RootState) => state.mainLayout);

    const dispatch = useDispatch();
    const generateName = useCallback(() => {
        return (pathname.startsWith('/') ? pathname.substring(1) : pathname).split('/').join(' / ');
    }, [pathname]);

    useEffect(() => {
        return () => {
            if (!title) return;

            dispatch(pushTitle(null));
        };
    }, [pathname]);

    return (
        <>
            <Text className="capitalize font-medium text-2xl">{title || generateName()}</Text>
        </>
    );
}
