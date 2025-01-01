import { IConfig } from '@/types';
import { clearData } from '@/utils/app';
import { injectable } from 'inversify';
import { Api, IApiResponse, IApiResponsePagination } from './api';

@injectable()
export default class ApiConfigs extends Api {
    constructor() {
        super('admin/configs');
    }

    public async getConfigs(params: Record<string, string | number>): Promise<IApiResponsePagination<IConfig[]>> {
        return await this.get<IApiResponsePagination<IConfig[]>>('', { params });
    }

    public async createConfigs(data: Partial<IConfig>): Promise<IApiResponse<IConfig>> {
        return await this.post<IApiResponse<IConfig>>('', data);
    }

    public async updateConfigs(data: Partial<IConfig>): Promise<IApiResponse<IConfig>> {
        const { id, key_name, ...newData } = clearData(data, []);
        return await this.put<IApiResponse<IConfig>>(`${id}`, newData);
    }

    public async deleteConfigs(data: IConfig[]): Promise<IApiResponse<boolean>> {
        const ids = data.map((item) => Number(item.id));

        return await this.delete<IApiResponse<boolean>>(``, { data: { ids } });
    }
}
