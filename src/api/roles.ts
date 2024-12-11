import { IRole } from '@/types';
import { injectable } from 'inversify';
import { Api, IApiResponse, IApiResponsePagination } from './api';

@injectable()
export default class ApiRoles extends Api {
    constructor() {
        super('admin/roles');
    }

    public async getAll(params: Record<string, any>): Promise<IApiResponsePagination<IRole[]>> {
        return await this.get<IApiResponsePagination<IRole[]>>('', { params });
    }

    public async create(data: Partial<IRole>): Promise<IApiResponse<IRole>> {
        return await this.post<IApiResponse<IRole>>('', data);
    }

    public async update(id: IRole['id'], data: Partial<IRole>): Promise<IApiResponse<IRole>> {
        return await this.put<IApiResponse<IRole>>(`${id}`, data);
    }

    public async deleteRole(id: IRole['id']): Promise<IApiResponse<boolean>> {
        return await this.delete<IApiResponse<boolean>>(`${id}`);
    }
}
