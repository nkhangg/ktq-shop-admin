import { ICountry, IPermission, IProvince, IResource, IRole } from '@/types';
import { injectable } from 'inversify';
import { Api, IApiResponse, IApiResponsePagination } from './api';

@injectable()
export default class ApiPermissions extends Api {
    constructor() {
        super('admin/permissions');
    }

    public async getAll(params: Record<string, string | number>): Promise<IApiResponsePagination<IPermission[]>> {
        return await this.get<IApiResponsePagination<IPermission[]>>('', { params });
    }

    public async getByRole(role_id: IRole['id']): Promise<IApiResponse<IPermission[]>> {
        return await this.get<IApiResponse<IPermission[]>>(`roles/${role_id}`);
    }

    public async addPermissionForRole(role_id: IRole['id'], permission_id: IPermission['id']): Promise<IApiResponse<IPermission>> {
        return await this.post<IApiResponse<IPermission>>(`roles/${role_id}`, { permission_id });
    }

    public async removePermissionForRole(role_id: IRole['id'], permission_id: IPermission['id']): Promise<IApiResponse<IPermission>> {
        return await this.delete<IApiResponse<IPermission>>(`roles/${role_id}`, { data: { permission_id } });
    }
}
