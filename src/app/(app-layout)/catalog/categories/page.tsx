'use client';

import { useTitle } from '@/hooks';
import { Box } from '@mantine/core';

export interface IALCategoriesRootPageProps {}

export default function ALCategoriesRootPage(props: IALCategoriesRootPageProps) {
    useTitle('Categories');
    return <Box>This is categories page</Box>;
}
