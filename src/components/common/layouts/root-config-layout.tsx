// app/layout.tsx
'use client';
import 'reflect-metadata';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@/app/globals.css';
import { persistor, store } from '@/store';
import { MantineProvider } from '@mantine/core';
import { HydrationBoundary, QueryClient, QueryClientProvider, useIsFetching, useIsMutating } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { InnerConfigLayout } from '.';

export default function RootConfigLayout({ children }: { children: React.ReactNode }) {
    const client = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 10000,
                gcTime: 30000,
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    });

    return (
        <QueryClientProvider client={client}>
            <HydrationBoundary>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <MantineProvider defaultColorScheme="dark" withGlobalClasses withStaticClasses withCssVariables>
                            <InnerConfigLayout>{children}</InnerConfigLayout>
                        </MantineProvider>
                    </PersistGate>
                </Provider>
            </HydrationBoundary>
        </QueryClientProvider>
    );
}
