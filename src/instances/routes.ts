import { IAdminUser, ICustomer } from '@/types';

export default class Routes {
    public static LOGIN = '/login';
    public static LOGOUT = '/logout';
    public static HISTORIES = '/histories';
    public static FORGOT_PASSWORD = '/forgot-password';
    public static CHANGE_PASSWORD = '/change-password';
    public static DASHBOARD = '/dashboard';
    public static GRANT_PERMISSION = '/grant-permission';
    public static USER_ROLE = '/admin-user-roles';
    public static ADMIN_USERS = '/admin-users';
    public static CUSTOMERS = '/customers';
    public static PERMISSION_DENIED = '/permission-denied';
    public static CUSTOMER_GROUP = '/customer-group';
    public static NOW_ONLINE = '/now-online';

    public static DETAIL_CUSTOMER = (customer: ICustomer) => {
        return `${this.CUSTOMERS}/${customer.id}/${customer.username}`;
    };

    public static DETAIL_ADMIN_USER = (adminUser: IAdminUser) => {
        return `${this.ADMIN_USERS}/${adminUser.id}/${adminUser.username}`;
    };
}
