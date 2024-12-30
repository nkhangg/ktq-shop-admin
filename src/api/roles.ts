import { IPermission, IResource, IRole } from '@/types';
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

    public async addResourceForRole(role_id: IRole['id'], data: IResource[]): Promise<IApiResponse<IRole>> {
        const resource_ids = data.map((item) => item.id);

        return await this.post<IApiResponse<IRole>>(`resources/${role_id}`, { resource_ids });
    }

    public async deleteResourceForRole(role_id: IRole['id'], data: IResource[]): Promise<IApiResponse<boolean>> {
        const resource_ids = data.map((item) => item.id);

        return await this.delete<IApiResponse<boolean>>(`resources/${role_id}`, { data: { resource_ids } });
    }

    public async update(id: IRole['id'], data: Partial<IRole>): Promise<IApiResponse<IRole>> {
        return await this.put<IApiResponse<IRole>>(`${id}`, data);
    }

    public async deleteRole(id: IRole['id']): Promise<IApiResponse<boolean>> {
        return await this.delete<IApiResponse<boolean>>(`${id}`);
    }
}
