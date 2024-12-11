'use client';
import Routes from '@/instances/routes';
import { getAccessToken, getRefreshToken } from '@/utils/cookies';
import { Box, Container, MantineProvider } from '@mantine/core';
import { redirect } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

export interface IALAuthRootLayoutProps {}

export default function ALAuthRootLayout({ children }: { children: ReactNode }) {
    useEffect(() => {
        const token = getAccessToken();
        const refresh_token = getRefreshToken();

        console.log(token);
        if (token || refresh_token) {
            redirect(Routes.DASHBOARD);
        }
    }, []);

    return (
        <MantineProvider defaultColorScheme="dark">
            <Box className="h-screen flex items-center justify-center">
                <Container size={'xl'} my={40} miw={'480px'}>
                    {children}
                </Container>
            </Box>
        </MantineProvider>
    );
}
