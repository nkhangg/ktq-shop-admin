import { IAdminUser, IPermission, IResource, IResourcePermission, IRole } from '@/types';
import { injectable } from 'inversify';
import { Api, IApiResponse, IApiResponsePagination } from './api';

@injectable()
export default class ApiResources extends Api {
    constructor() {
        super('admin/resources');
    }

    public async syncResources(): Promise<IApiResponse<boolean>> {
        return await this.post<IApiResponse<boolean>>('sync-resources', {});
    }

    public async getAll(params: Record<string, any>): Promise<IApiResponsePagination<IResource[]>> {
        return await this.get<IApiResponsePagination<IResource[]>>('', { params });
    }

    public async getResourceById(id: IResource['id']): Promise<IApiResponse<IResource>> {
        return await this.get<IApiResponse<IResource>>(`${id}`);
    }

    public async resourceByRole(role_id: IRole['id'], params: Record<string, string | number>): Promise<IApiResponsePagination<IResource[]>> {
        return await this.get<IApiResponsePagination<IResource[]>>(`roles/${role_id}`, { params });
    }

    public async resourceIgnoreByRole(role_id: IRole['id'], params: Record<string, string | number>): Promise<IApiResponsePagination<IResource[]>> {
        return await this.get<IApiResponsePagination<IResource[]>>(`ignore-roles/${role_id}`, { params });
    }

    public async createResourcePermission(data: {
        admin_user_id: IAdminUser['id'];
        permission_id: IPermission['id'];
        resource_id: IResource['id'];
    }): Promise<IApiResponse<IResourcePermission>> {
        return await this.post<IApiResponse<IResourcePermission>>(`resource-permissions`, {
            ...data,
            admin_user_id: Number(data.admin_user_id),
            permission_id: Number(data.permission_id),
        });
    }

    public async deleteResources(data: IResource[]): Promise<IApiResponse<IResource>> {
        const resource_ids = data.map((item) => item.id);
        return await this.delete<IApiResponse<IResource>>(``, { data: { resource_ids } });
    }
}
