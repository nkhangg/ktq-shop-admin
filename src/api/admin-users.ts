import { IAdminUser, IRole } from '@/types';
import { clearData } from '@/utils/app';
import { injectable } from 'inversify';
import { Api, IApiResponse, IApiResponsePagination } from './api';

export interface IComfirmPasswordAdmin {
    admin_password: string;
    use_time?: boolean;
}

export type IAdminUserPasswordData = {
    password: string;
    confirm_password: string;
};

@injectable()
export default class ApiAdminUsers extends Api {
    constructor() {
        super('admin/admin-users');
    }

    public async getAll(params: Record<string, string | number>): Promise<IApiResponsePagination<IAdminUser[]>> {
        return await this.get<IApiResponsePagination<IAdminUser[]>>('', { params });
    }

    public async getById(id: IAdminUser['id']): Promise<IApiResponse<IAdminUser>> {
        return await this.get<IApiResponse<IAdminUser>>(`${id}`);
    }

    public async getUseTimePassword(): Promise<IApiResponse<{ use_time: boolean }>> {
        return await this.get<IApiResponse<{ use_time: boolean }>>(`use-time-password`);
    }

    public async update(id: IAdminUser['id'], data: Partial<IAdminUser> & IComfirmPasswordAdmin): Promise<IApiResponse<IAdminUser>> {
        const newData = clearData(data, ['created_at', 'updated_at', 'role', 'id', 'username', 'email']);

        return await this.put<IApiResponse<IAdminUser>>(`${id}`, newData);
    }

    public async setNewPassword(id: IAdminUser['id'], data: IAdminUserPasswordData & IComfirmPasswordAdmin): Promise<IApiResponse<IAdminUser>> {
        const { password, ...values } = clearData(data, ['confirm_password']);

        return await this.put<IApiResponse<IAdminUser>>(`${id}/set-new-password`, { new_password: password, ...values });
    }

    public async createNewAdminUser(data: Partial<IAdminUser> & { password: string } & IComfirmPasswordAdmin): Promise<IApiResponse<IAdminUser>> {
        const newData = clearData(data, []);

        return await this.post<IApiResponse<IAdminUser>>(``, newData);
    }

    public async active(id: IAdminUser['id'], data: IComfirmPasswordAdmin): Promise<IApiResponse<IAdminUser>> {
        return await this.put<IApiResponse<IAdminUser>>(`${id}/active`, data);
    }

    public async actives(data: IComfirmPasswordAdmin & { admin_users: IAdminUser[] }): Promise<IApiResponse<boolean>> {
        const ids = data.admin_users.reduce((prev, cur) => {
            prev.push(cur.id);
            return prev;
        }, [] as IAdminUser['id'][]);

        const newData = clearData(data, ['admin_users']);

        return await this.put<IApiResponse<boolean>>(`actives`, { ...newData, ids });
    }

    public async inActives(data: IComfirmPasswordAdmin & { admin_users: IAdminUser[] }): Promise<IApiResponse<boolean>> {
        const ids = data.admin_users.reduce((prev, cur) => {
            prev.push(cur.id);
            return prev;
        }, [] as IAdminUser['id'][]);

        const newData = clearData(data, ['admin_users']);

        return await this.put<IApiResponse<boolean>>(`in-actives`, { ...newData, ids });
    }

    public async deletes(data: IComfirmPasswordAdmin & { admin_users: IAdminUser[] }): Promise<IApiResponse<boolean>> {
        const ids = data.admin_users.reduce((prev, cur) => {
            prev.push(cur.id);
            return prev;
        }, [] as IAdminUser['id'][]);

        const newData = clearData(data, ['admin_users']);

        return await this.delete<IApiResponse<boolean>>(`multiple`, { data: { ...newData, ids } });
    }

    public async deleteAdminUser(data: IComfirmPasswordAdmin & { admin_user: IAdminUser }): Promise<IApiResponse<boolean>> {
        const newData = clearData(data, ['admin_user']);

        return await this.delete<IApiResponse<boolean>>(`${data.admin_user.id}`, { data: { ...newData } });
    }

    public async updateRole(id: IAdminUser['id'], data: IComfirmPasswordAdmin & { role_id: IRole['id'] }): Promise<IApiResponse<IAdminUser>> {
        const newData = clearData(data, []);

        return await this.put<IApiResponse<IAdminUser>>(`role/${id}`, { ...newData, role_id: Number(newData.role_id) });
    }
}
