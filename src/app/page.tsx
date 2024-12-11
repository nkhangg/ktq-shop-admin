'use client';
import Routes from '@/instances/routes';
import { redirect } from 'next/navigation';

export default function HomeRootPage() {
    redirect(Routes.DASHBOARD);
}
