import { IAdminUser, IPermission, IResource, IResourcePermission, IRole } from '@/types';
import { injectable } from 'inversify';
import { Api, IApiResponse, IApiResponsePagination } from './api';

@injectable()
export default class ApiResourcePermissions extends Api {
    constructor() {
        super('admin/resource-permissions');
    }

    public async getByResourceId(id: IResource['id'], params: Record<string, any>): Promise<IApiResponsePagination<IResourcePermission[]>> {
        return await this.get<IApiResponsePagination<IResourcePermission[]>>(`${id}`, { params });
    }

    public async createResourcePermission(data: {
        admin_user_id: IAdminUser['id'];
        permission_id: IPermission['id'];
        resource_id: IResource['id'];
    }): Promise<IApiResponse<IResourcePermission>> {
        return await this.post<IApiResponse<IResourcePermission>>(``, {
            ...data,
            admin_user_id: Number(data.admin_user_id),
            permission_id: Number(data.permission_id),
        });
    }

    public async deleteResourcePermission(id: IResourcePermission['id'], data: { resource_id: IResource['id'] }): Promise<IApiResponse<boolean>> {
        return await this.delete<IApiResponse<boolean>>(`${id}`, { data });
    }
}
