import { ComponentType } from 'react';

export type ICustomer = {
    id: number;
    username: string;
    email: string;
    first_name: null | string;
    last_name: null | string;
    avatar: string | null;
    bg_cover: string | null;
    is_active: boolean;
    gender: string;
    phone: string;
    vat_number: string;
    date_of_birth: null | string | Date;
    customerGroup: ICustomerGroup;
} & ITimestamp;

export type ICustomerGroup = {
    created_at: string;
    updated_at: string;
    id: number;
    name: string;
};

export type ISession = {
    id: number;
    user_role_type: string;
    session_token: string;
    payload: ISessionPayload;
    expires_at: string;
    live: boolean;
    user_agent: string;
} & ITimestamp;

export interface ISessionPayload {
    clientIp: string;
    userAgent: string;
    deviceType: string;
}

export type IBlacklist = {
    id: number;
    user_id_app: number;
    user_role_type: 'customer' | 'admin';
    back_list_type: 'block' | 'warning';
    start_at: string;
    end_at: string | null;
    reason: string;
};

export type IAddress = {
    id: number;
    address_line: string;
    ward: string;
    district: string;
    city: string;
    postal_code: string | null;
    state: string;
    is_default: boolean;
    country: ICountry;
    region: any | null;
} & ITimestamp;

export interface ICountry {
    created_at: string;
    updated_at: string;
    id: number;
    country_name: string;
    country_code: string;
}

export interface IProvince {
    id: number;
    name: string;
    code: number;
    division_type: string;
    codename: string;
    phone_code: number;
}

export type IAdminUser = {
    id: number;
    email: string;
    username: string;
    first_name: any;
    last_name: any;
    is_active: boolean;
    gender: string;
    role: IRole;
} & ITimestamp;

export type IRole = {
    created_at: string;
    updated_at: string;
    id: number;
    role_name: string;
};

export type ICustomerPageMenuData = {
    key: string;
    title: string;
    titleContent: string;
    component: ComponentType<any>;
};

export type ICacheStatus = {
    total_keys: string;
    used_memory: string;
};

export type ICacheStatusDetail = {
    private_keys?: string;
    public_keys?: string;
    system_keys?: string;
} & ICacheStatus;

export type TComfirmPassword = {
    password: string;
    use_time: string[];
};

export type IRoleResource = {
    id: number;
    role: IRole;
    resource: IResource;
};

export type IResourcePermission = {
    id: number;
    adminUser: IAdminUser;
    resource: IResource;
    permission: IPermission;
};

export type IResource = {
    id: number;
    resource_name: string;
    type_resource: string;
    resource_code: string;
    resource_method: string;
    description: string;
    roleResources?: IRoleResource[];
    resourcePermissions?: IResourcePermission[];
} & ITimestamp;

export type IPermission = {
    id: number;
    permission_code: string;
    description: string;
} & ITimestamp;
