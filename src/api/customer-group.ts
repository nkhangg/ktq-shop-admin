import { IAddress, IBlacklist, ICustomer } from '@/types';
import { injectable } from 'inversify';
import { Api, IApiResponse, IApiResponsePagination } from './api';

export type ICustomerView = {
    last_login_in: string;
    online: boolean;
    blacklist: IBlacklist;
    customer: ICustomer;
    address_default: null | IAddress;
    group: ICustomerGroup;
};

export type IBlockData = {
    from: string;
    to: string;
};

export type ICustomerGroup = {
    id: number;
    name: string;
} & ITimestamp;

@injectable()
export default class ApiCustomerGroup extends Api {
    constructor() {
        super('admin/customer-groups');
    }

    public async getAll(params: Record<string, any>): Promise<IApiResponsePagination<ICustomerGroup[]>> {
        return await this.get<IApiResponsePagination<ICustomerGroup[]>>('', { params });
    }

    public async create(data: Pick<ICustomerGroup, 'name'>): Promise<IApiResponse<ICustomerGroup>> {
        return await this.post<IApiResponse<ICustomerGroup>>('', data);
    }

    public async update(id: ICustomerGroup['id'], data: Pick<ICustomerGroup, 'name'>): Promise<IApiResponse<ICustomerGroup>> {
        return await this.put<IApiResponse<ICustomerGroup>>(`${id}`, data);
    }

    public async deleteCustomerGroup(id: ICustomerGroup['id']): Promise<IApiResponse<ICustomerGroup>> {
        return await this.delete<IApiResponse<ICustomerGroup>>(`${id}`);
    }
}
