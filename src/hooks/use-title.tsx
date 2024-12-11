'use client';

import { pushTitle } from '@/store/slices/main-layout';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function useTitle(value: string | null) {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(pushTitle(value));
    }, []);
}
