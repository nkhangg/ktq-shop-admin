import {
    IconAdjustments,
    IconCalendarStats,
    IconFileAnalytics,
    IconGauge,
    IconLock,
    IconLogout,
    IconNotes,
    IconPresentationAnalytics,
    IconUserCog,
    IconUsers,
} from '@tabler/icons-react';
import Routes from './routes';

export default class Menu {
    public static getMenuLogoutData(): INavbarItemData {
        return { label: 'Logout', icon: IconLogout, link: Routes.LOGOUT };
    }

    public static getMenu(): INavbarItemData[] {
        return [
            { label: 'Dashboard', icon: IconGauge, link: Routes.DASHBOARD },
            {
                label: 'Customers',
                icon: IconUsers,
                initiallyOpened: false,
                links: [
                    { label: 'All Customers', link: Routes.CUSTOMERS },
                    { label: 'Now Online', link: Routes.NOW_ONLINE },
                    { label: 'Customer Groups', link: Routes.CUSTOMER_GROUP },
                ],
            },
            {
                label: 'Permission',
                icon: IconUserCog,
                initiallyOpened: false,
                links: [
                    { label: 'All Admin Users', link: Routes.ADMIN_USERS },
                    { label: 'Admin User Roles', link: Routes.USER_ROLE },
                ],
            },
            {
                label: 'Resources',
                icon: IconCalendarStats,
                links: [
                    { label: 'Upcoming releases', link: '/' },
                    { label: 'Previous releases', link: '/' },
                    { label: 'Releases schedule', link: '/' },
                ],
            },
            { label: 'Analytics', icon: IconPresentationAnalytics },
            { label: 'Contracts', icon: IconFileAnalytics },
            { label: 'Settings', icon: IconAdjustments },
            {
                label: 'Security',
                icon: IconLock,
                links: [
                    { label: 'Histories', link: Routes.HISTORIES },
                    { label: 'Change password', link: Routes.CHANGE_PASSWORD },
                    { label: 'Logout', link: Routes.LOGOUT },
                ],
            },
        ];
    }
}