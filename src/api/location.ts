import { ICountry, IProvince } from '@/types';
import { injectable } from 'inversify';
import { Api, IApiResponse } from './api';

@injectable()
export default class ApiLocations extends Api {
    constructor() {
        super('locations');
    }

    public async countries(search?: string): Promise<IApiResponse<ICountry[]>> {
        return await this.get<IApiResponse<ICountry[]>>('countries', { params: { search } });
    }

    public async provinces(search?: string): Promise<IApiResponse<IProvince[]>> {
        return await this.get<IApiResponse<IProvince[]>>('provinces', { params: { search } });
    }

    public async districts(query: { search?: string; province_name?: string }): Promise<IApiResponse<IProvince[]>> {
        return await this.get<IApiResponse<IProvince[]>>('districts', { params: query }, false);
    }

    public async wards(query: { search?: string; province_name?: string; district_name?: string }): Promise<IApiResponse<IProvince[]>> {
        return await this.get<IApiResponse<IProvince[]>>('wards', { params: query }, false);
    }
}
