'use client';
import { useTitle } from '@/hooks';
import { Box } from '@mantine/core';

export interface IALProductsRootPageProps {}

export default function ALProductsRootPage(props: IALProductsRootPageProps) {
    useTitle('Products');
    return <Box>this is products page</Box>;
}
