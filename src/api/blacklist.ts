import { IAdminUser, IBlacklist, ICustomer } from '@/types';
import { injectable } from 'inversify';
import { Api, IApiResponse, IApiResponsePagination } from './api';
import { IComfirmPasswordAdmin } from './admin-users';

export type TBlockCustomerData = {
    from: Date | string | null;
    to: Date | null | string;
    black_list_type: 'block' | 'warning';
    reason: string;
};

@injectable()
export default class ApiBlackList extends Api {
    constructor() {
        super('admin/black-lists');
    }

    public async blockCustomer(id: ICustomer['id'], data: TBlockCustomerData): Promise<IApiResponse<IBlacklist>> {
        let to = data.to;

        if (typeof data.to === 'string' && data.to.length <= 0) {
            to = null;
        }

        return await this.post<IApiResponse<IBlacklist>>('block-customer', { ...data, to, customer_id: Number(id) });
    }

    public async blockAdminUser(id: ICustomer['id'], data: TBlockCustomerData & IComfirmPasswordAdmin): Promise<IApiResponse<IBlacklist>> {
        let to = data.to;

        if (typeof data.to === 'string' && data.to.length <= 0) {
            to = null;
        }

        return await this.post<IApiResponse<IBlacklist>>('block-admin-user', { ...data, to, admin_user_id: Number(id) });
    }

    public async unlockCustomer(id: ICustomer['id']): Promise<IApiResponse<IBlacklist>> {
        return await this.put<IApiResponse<IBlacklist>>('unlock-customer', { customer_id: Number(id) });
    }

    public async unlockAdminUser({ id, ...data }: { id: IAdminUser['id'] } & IComfirmPasswordAdmin): Promise<IApiResponse<IBlacklist>> {
        return await this.put<IApiResponse<IBlacklist>>('unlock-admin-user', { ...data, admin_user_id: Number(id) });
    }

    public async getByAdminUserId(id: IAdminUser['id']): Promise<IApiResponse<IBlacklist>> {
        return await this.get<IApiResponse<IBlacklist>>(`admin-user/${id}`);
    }
}
