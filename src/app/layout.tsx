// app/layout.tsx
import 'reflect-metadata';
import { RootConfigLayout } from '@/components/common/layouts';
import { ReactNode } from 'react';

export const metadata = {
    title: 'KTQ Shops',
    description: 'The project provide all api for shop to buy all type product',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body>
                <RootConfigLayout>{children}</RootConfigLayout>
            </body>
        </html>
    );
}
