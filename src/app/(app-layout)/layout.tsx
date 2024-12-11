'use client';
import { GenerateTitle } from '@/components/common/app';
import { HandleAuthenticationLayout } from '@/components/common/layouts';
import { LinksGroup } from '@/components/lib/NavbarLinksGroup/NavbarLinksGroup';
import Menu from '@/instances/menu';
import Routes from '@/instances/routes';
import { cn } from '@/utils/app';
import { ActionIcon, AppShell, Box, Burger, Button, Divider, Group, ScrollArea, Skeleton, useMantineColorScheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { Bokor } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

const bokor = Bokor({ subsets: ['latin'], weight: ['400'] });

export interface IALAppRootLayoutProps {
    children: ReactNode;
}

export default function ALAppRootLayout({ children }: IALAppRootLayoutProps) {
    const [opened, { toggle }] = useDisclosure();
    const { setColorScheme, clearColorScheme } = useMantineColorScheme();
    const router = useRouter();
    return (
        <HandleAuthenticationLayout>
            <AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }} padding="md">
                <AppShell.Header>
                    <Box className="flex items-center justify-between w-full h-full">
                        <Group h="100%" px="md">
                            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                            <Link href={Routes.DASHBOARD} className="flex items-center justify-center">
                                <h2 className={cn(bokor.className, 'text-3xl')}>KTQ SHOP</h2>
                            </Link>

                            <Box className="flex items-center gap-2 ml-2">
                                <ActionIcon onClick={() => router.back()} variant="default">
                                    <IconArrowLeft style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                </ActionIcon>
                                <ActionIcon onClick={() => router.forward()} variant="default">
                                    <IconArrowRight style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                </ActionIcon>
                            </Box>
                        </Group>

                        <Button onClick={() => setColorScheme('dark')}>Theme</Button>
                    </Box>
                </AppShell.Header>
                <AppShell.Navbar>
                    <AppShell.Section grow my="md" component={ScrollArea}>
                        {Menu.getMenu().map((item) => {
                            return <LinksGroup key={item.label} {...item} />;
                        })}
                    </AppShell.Section>
                </AppShell.Navbar>

                <AppShell.Main>
                    <Box>
                        <Box mb={'md'}>
                            <Box className="flex items-center gap-5">
                                <GenerateTitle />
                            </Box>

                            <Divider mt={'md'} />
                        </Box>
                        {children}
                    </Box>
                </AppShell.Main>
            </AppShell>
        </HandleAuthenticationLayout>
    );
}
