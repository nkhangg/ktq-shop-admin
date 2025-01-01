import { IAdminUser, ICustomer, IResource, IRole } from '@/types';

export default class Routes {
    public static LOGIN = '/login';
    public static LOGOUT = '/logout';
    public static HISTORIES = '/histories';
    public static FORGOT_PASSWORD = '/forgot-password';
    public static CHANGE_PASSWORD = '/change-password';
    public static DASHBOARD = '/dashboard';
    public static GRANT_PERMISSION = '/grant-permission';
    public static USER_ROLES = '/permissions/admin-user-roles';
    public static RESOURCES = '/permissions/resources';
    public static USER_ROLE_RESOURCES = '/permissions/admin-user-roles/role-resources';
    public static ADMIN_USERS = '/permissions/admin-users';
    public static CUSTOMERS = '/customers';
    public static PERMISSION_DENIED = '/permission-denied';
    public static CUSTOMER_GROUP = '/customer-group';
    public static NOW_ONLINE = '/now-online';
    public static CACHES_MANAGEMENT = '/caches-management';
    public static CONFIGURATION = '/configuration';
    public static PRODUCTS = '/catalog/products';
    public static CATEGORIES = '/catalog/categories';

    public static DETAIL_CUSTOMER = (customer: ICustomer) => {
        return `${this.CUSTOMERS}/${customer.id}/${customer.username}`;
    };

    public static DETAIL_ADMIN_USER = (adminUser: IAdminUser) => {
        return `${this.ADMIN_USERS}/${adminUser.id}/${adminUser.username}`;
    };

    public static DETAIL_ROLE_RESOURCES = (role: Partial<IRole>) => {
        return `${this.USER_ROLES}/${role.id}/${(role.role_name || '').replaceAll(' ', '-').toLocaleLowerCase()}`;
    };

    public static ROLE_RESOURCE = (role: Partial<IRole>) => {
        return `${this.USER_ROLE_RESOURCES}/${role.id}/${(role.role_name || '').replaceAll(' ', '-').toLocaleLowerCase()}`;
    };
    public static DETAIL_RESOURCE = (resource: IResource) => {
        return `${this.RESOURCES}/${resource.id}`;
    };
}
