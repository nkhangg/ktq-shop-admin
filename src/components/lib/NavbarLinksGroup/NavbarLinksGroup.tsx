'use client';
import { useState } from 'react';
import { Group, Box, Collapse, ThemeIcon, Text, UnstyledButton, rem, NavLink } from '@mantine/core';
import { IconCalendarStats, IconChevronRight } from '@tabler/icons-react';
import classes from './NavbarLinksGroup.module.css';
import Link from 'next/link';
import { cn } from '@/utils/app';
import { usePathname } from 'next/navigation';

interface LinksGroupProps {
    icon: React.FC<any>;
    label: string;
    link?: string;
    initiallyOpened?: boolean;
    links?: { label: string; link: string }[];
}

export function LinksGroup({ icon: Icon, label, initiallyOpened, links, link }: LinksGroupProps) {
    const pathname = usePathname();

    const hasLinks = Array.isArray(links);
    const [opened, setOpened] = useState(initiallyOpened || false);
    const items = (hasLinks ? links : []).map((link) => (
        <Link className={cn(classes.link)} href={link.link} {...(pathname === link.link ? { 'data-active': 'true' } : {})} key={link.label}>
            {link.label}
        </Link>
    ));

    return (
        <>
            <UnstyledButton
                component={!hasLinks && link ? Link : undefined}
                href={!hasLinks && link ? link : ''}
                {...(pathname === link ? { 'data-active': 'true' } : {})}
                onClick={() => setOpened((o) => !o)}
                className={classes.control}
            >
                <Group justify="space-between" gap={0}>
                    <Box style={{ display: 'flex', alignItems: 'center' }}>
                        <ThemeIcon variant="light" size={30}>
                            <Icon style={{ width: rem(18), height: rem(18) }} />
                        </ThemeIcon>
                        <Box ml="md">{label}</Box>
                    </Box>
                    {hasLinks && (
                        <IconChevronRight
                            className={classes.chevron}
                            stroke={1.5}
                            style={{
                                width: rem(16),
                                height: rem(16),
                                transform: opened ? 'rotate(-90deg)' : 'none',
                            }}
                        />
                    )}
                </Group>
            </UnstyledButton>
            {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
        </>
    );
}

const mockdata = {
    label: 'Releases',
    icon: IconCalendarStats,
    links: [
        { label: 'Upcoming releases', link: '/' },
        { label: 'Previous releases', link: '/' },
        { label: 'Releases schedule', link: '/' },
    ],
};

export function NavbarLinksGroup() {
    return (
        <Box mih={220} p="md">
            <LinksGroup {...mockdata} />
        </Box>
    );
}
