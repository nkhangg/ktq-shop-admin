import { injectable } from 'inversify';
import { Api, IApiResponse, IApiResponsePagination } from './api';
import { IAddress, IBlacklist, ICustomer } from '@/types';
import { base64ToFile, cleanObject, clearData } from '@/utils/app';
import { nanoid } from '@reduxjs/toolkit';

export type ICustomerView = {
    last_login_in: string;
    online: boolean;
    blacklist: IBlacklist;
    customer: ICustomer;
    address_default: null | IAddress;
    group: ICustomerGroup;
};

export type IBlockData = {
    from: string;
    to: string;
};

export type ICustomerGroup = {
    id: number;
    name: string;
} & ITimestamp;

export type UpdateCustomerData = {
    group_id: ICustomerGroup['id'] | string;
} & ICustomer;

export type CreateCustomerData = {
    group_id: ICustomerGroup['id'] | string;
    password: string;
} & ICustomer;

@injectable()
export default class ApiCustomers extends Api {
    constructor() {
        super('admin/customers');
    }

    public async getCustomers(params: Record<string, string | number>): Promise<IApiResponsePagination<ICustomer[]>> {
        return await this.get<IApiResponsePagination<ICustomer[]>>('', { params });
    }

    public async getCustomersOnline(params: Record<string, string | number>): Promise<IApiResponsePagination<ICustomer[]>> {
        return await this.get<IApiResponsePagination<ICustomer[]>>('online', { params });
    }

    public async getCustomer(id: ICustomer['id']): Promise<IApiResponse<ICustomer>> {
        return await this.get<IApiResponse<ICustomer>>(String(id));
    }

    public async update(data: UpdateCustomerData): Promise<IApiResponse<ICustomer>> {
        const { id, ...prevData } = clearData(data, ['username', 'email', 'created_at', 'updated_at', 'customerGroup']);

        return await this.put<IApiResponse<ICustomer>>(String(id), prevData);
    }

    public async updates(items: ICustomer[], data: Partial<ICustomer>): Promise<IApiResponse<ICustomer>> {
        const ids = items.reduce((prev, cur) => {
            prev.push(cur.id);
            return prev;
        }, [] as ICustomer['id'][]);

        const generateInfo = cleanObject(data);

        return await this.put<IApiResponse<ICustomer>>(`multiple`, { ids, ...generateInfo });
    }

    public async create(data: CreateCustomerData): Promise<IApiResponse<ICustomer>> {
        const generateData = cleanObject(data);

        return await this.post<IApiResponse<ICustomer>>(``, generateData);
    }

    public async getCustomerView(id: ICustomer['id']): Promise<IApiResponse<ICustomerView>> {
        return await this.get<IApiResponse<ICustomerView>>(`view/${id}`);
    }

    public async deletes(items: ICustomer[]): Promise<IApiResponse<boolean>> {
        const ids = items.reduce((prev, cur) => {
            prev.push(cur.id);
            return prev;
        }, [] as ICustomer['id'][]);

        return await this.delete<IApiResponse<boolean>>('multiple', {
            data: {
                ids,
            },
        });
    }

    public async inActive(id: ICustomer['id']): Promise<IApiResponse<boolean>> {
        return await this.put<IApiResponse<boolean>>(`${id}/in-active`, {});
    }

    public async active(id: ICustomer['id']): Promise<IApiResponse<boolean>> {
        return await this.put<IApiResponse<boolean>>(`${id}/active`, {});
    }

    public async inActives(items: ICustomer[]): Promise<IApiResponse<boolean>> {
        const ids = items.reduce((prev, cur) => {
            prev.push(cur.id);
            return prev;
        }, [] as ICustomer['id'][]);

        return await this.put<IApiResponse<boolean>>('in-actives', {
            ids,
        });
    }

    public async actives(items: ICustomer[]): Promise<IApiResponse<boolean>> {
        const ids = items.reduce((prev, cur) => {
            prev.push(cur.id);
            return prev;
        }, [] as ICustomer['id'][]);

        return await this.put<IApiResponse<boolean>>('actives', {
            ids,
        });
    }

    public async deleteCustomer(id: ICustomer['id']): Promise<IApiResponse<boolean>> {
        return await this.delete<IApiResponse<boolean>>(`${id}`);
    }

    public async updateAvatar(id: ICustomer['id'], data: string): Promise<IApiResponse<ICustomer>> {
        const formData = new FormData();

        formData.append('avatar', base64ToFile(data, `${nanoid()}.png`));

        return await this.post<IApiResponse<ICustomer>>(`${id}/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }

    public async updateBgCover(id: ICustomer['id'], data: string): Promise<IApiResponse<ICustomer>> {
        const formData = new FormData();

        formData.append('image', base64ToFile(data, `${nanoid()}.png`));

        return await this.post<IApiResponse<ICustomer>>(`${id}/bg-cover`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }

    public async deleteMedia(id: ICustomer['id'], data: 'bg_cover' | 'avatar'): Promise<IApiResponse<ICustomer>> {
        return await this.delete<IApiResponse<ICustomer>>(`${id}/media`, { data: { attr: data } });
    }
}
