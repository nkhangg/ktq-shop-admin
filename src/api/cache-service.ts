import { ICacheStatus, ICacheStatusDetail } from '@/types';
import { injectable } from 'inversify';
import { Api, IApiResponse } from './api';

@injectable()
export default class ApiCacheService extends Api {
    constructor() {
        super('admin/cache-services');
    }

    public async getStatus(less?: boolean): Promise<IApiResponse<ICacheStatusDetail>> {
        return await this.get<IApiResponse<ICacheStatusDetail>>('', { params: { less } });
    }

    public async clearCachesByKeys(cache_keys: string[]): Promise<IApiResponse<boolean>> {
        return await this.post<IApiResponse<boolean>>('', { cache_keys });
    }
}
