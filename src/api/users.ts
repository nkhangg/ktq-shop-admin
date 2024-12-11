import { IAdminUser } from '@/types';
import { injectable } from 'inversify';
import { Api, IApiResponsePagination } from './api';

@injectable()
export default class ApiUsers extends Api {
    constructor() {
        super('admin/admin-users');
    }

    public async getAll(params: Record<string, string | number>): Promise<IApiResponsePagination<IAdminUser[]>> {
        return await this.get<IApiResponsePagination<IAdminUser[]>>('', { params });
    }
}
