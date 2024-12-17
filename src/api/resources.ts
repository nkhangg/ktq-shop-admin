import { ICountry, IProvince, IResource, IRole } from '@/types';
import { injectable } from 'inversify';
import { Api, IApiResponse, IApiResponsePagination } from './api';

@injectable()
export default class ApiResources extends Api {
    constructor() {
        super('admin/resources');
    }

    public async resourceByRole(role_id: IRole['id'], params: Record<string, string | number>): Promise<IApiResponsePagination<IResource[]>> {
        return await this.get<IApiResponsePagination<IResource[]>>(`roles/${role_id}`, { params });
    }

    public async resourceIgnoreByRole(role_id: IRole['id'], params: Record<string, string | number>): Promise<IApiResponsePagination<IResource[]>> {
        return await this.get<IApiResponsePagination<IResource[]>>(`ignore-roles/${role_id}`, { params });
    }
}
