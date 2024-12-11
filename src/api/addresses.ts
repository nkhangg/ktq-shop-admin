import { injectable } from 'inversify';
import { Api, IApiResponse, IApiResponsePagination } from './api';
import { IAddress, ICountry, ICustomer, ISession } from '@/types';

export type AddressData = {
    country_id: string;
    province: string;
    district: string | null;
    ward: string | null;
    address_line: string;
    postal_code: string | null;
};

@injectable()
export default class ApiAddress extends Api {
    constructor() {
        super('admin/addresses');
    }

    public async getAddressesByCustomer(id: ICustomer['id'], params: Record<string, string | number>): Promise<IApiResponsePagination<IAddress[]>> {
        return await this.get<IApiResponsePagination<IAddress[]>>(`customer/${id}`, { params });
    }

    public async setAddressDefault(customer_id: ICustomer['id'], address_id: IAddress['id']): Promise<IApiResponse<IAddress>> {
        return await this.post<IApiResponse<IAddress>>(`customer/set-default`, { customer_id: Number(customer_id), address_id });
    }

    public async deletesByCustomer(customer_id: ICustomer['id'], addresses: IAddress[]): Promise<IApiResponse<boolean>> {
        const address_ids = addresses.reduce((prev, cur) => {
            prev.push(cur.id);
            return prev;
        }, [] as IAddress['id'][]);

        return await this.delete<IApiResponse<boolean>>(`customer/multiple`, { data: { customer_id: Number(customer_id), address_ids } });
    }

    public async deleteByCustomer(customer_id: ICustomer['id'], address_id: IAddress['id']): Promise<IApiResponse<boolean>> {
        return await this.delete<IApiResponse<boolean>>(`customer`, { data: { customer_id: Number(customer_id), address_id } });
    }

    public async createByCustomer(customer_id: ICustomer['id'], data: AddressData): Promise<IApiResponse<boolean>> {
        return await this.post<IApiResponse<boolean>>(`customer/${customer_id}`, { customer_id: Number(customer_id), ...data, country_id: Number(data.country_id) });
    }

    public async updateByCustomer(customer_id: ICustomer['id'], address_id: IAddress['id'], data: AddressData): Promise<IApiResponse<boolean>> {
        return await this.put<IApiResponse<boolean>>(`customer/${customer_id}`, {
            customer_id: Number(customer_id),
            address_id: Number(address_id),
            ...data,
            country_id: Number(data.country_id),
        });
    }
}
