import { IBlacklist, ICustomer } from '@/types';
import { injectable } from 'inversify';
import { Api, IApiResponse, IApiResponsePagination } from './api';

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
        return await this.post<IApiResponse<IBlacklist>>('block-customer', { ...data, to: !data.to || !(data.to as string).length ? null : data.to, customer_id: Number(id) });
    }

    public async unlockCustomer(id: ICustomer['id']): Promise<IApiResponse<IBlacklist>> {
        return await this.put<IApiResponse<IBlacklist>>('unlock-customer', { customer_id: Number(id) });
    }
}
