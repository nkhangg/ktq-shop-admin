import { injectable } from 'inversify';
import { Api, IApiResponse, IApiResponsePagination } from './api';
import { ICustomer, ISession } from '@/types';

export type IBlacklist = {
    id: number;
    user_id_app: number;
    user_role_type: 'customer' | 'admin';
    back_list_type: 'block' | 'warning';
    start_at: string;
    end_at: string;
    reason: string;
};

export type ICustomerView = {
    last_login_in: string;
    online: boolean;
    blacklist: IBlacklist;
    customer: ICustomer;
    address_default: null;
    group: ICustomerGroup;
};

export type ICustomerGroup = {
    id: number;
    name: string;
} & ITimestamp;

@injectable()
export default class ApiSessions extends Api {
    constructor() {
        super('admin/sessions');
    }

    public async getSessionsByCustomer(id: ICustomer['id'], params: Record<string, string | number>): Promise<IApiResponsePagination<ISession[]>> {
        return await this.get<IApiResponsePagination<ISession[]>>(`customer/${id}`, { params });
    }

    public async getCustomerOnline(params: Record<string, string | number>): Promise<IApiResponsePagination<ISession[]>> {
        return await this.get<IApiResponsePagination<ISession[]>>(`customer/online`, { params });
    }

    public async getSessionsAdminCurrent(params: Record<string, string | number>): Promise<IApiResponsePagination<ISession[]>> {
        return await this.get<IApiResponsePagination<ISession[]>>(`me`, { params });
    }

    public async logoutCustomer({ id_session, id_customer }: { id_session: ISession['id']; id_customer: ICustomer['id'] }): Promise<IApiResponse<ISession>> {
        return await this.put<IApiResponse<ISession>>(`customer/logout/${id_customer}`, { id_session });
    }

    public async logoutsCustomer({ sessions, id_customer }: { sessions: ISession[]; id_customer: ICustomer['id'] }): Promise<IApiResponse<ISession>> {
        const ids_session = sessions.map((session) => session.id);

        return await this.put<IApiResponse<ISession>>(`customer/logouts/${id_customer}`, { ids_session });
    }
}
