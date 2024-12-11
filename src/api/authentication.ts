import axios from '@/instances/axios';
import { joinUrl } from '@/utils/app';
import { getRefreshToken, REFRESH_KEY, setAccessToken, setRefreshToken, TOKEN_KEY } from '@/utils/cookies';
import Cookies from 'js-cookie';
import { Api, IApiResponse } from './api';
import { injectable } from 'inversify';

export interface IAuthData {
    username: string;
    password: string;
}

export interface IForgotPasswordData {
    email: string;
}

export interface IGrantNewPasswordData {
    code: string;
    new_password: string;
    password_confirmation: string;
}

export interface IAuthResponse extends IApiResponse<IUser> {
    [TOKEN_KEY]: string;
    [REFRESH_KEY]: string;
}

@injectable()
export default class ApiAuthentication extends Api {
    // Các endpoint URL
    public URL_LOGIN = 'login';
    public URL_FORGOT_PASSWORD = 'forgot-password';
    public URL_GRANT_NEW_PASSWORD = 'grant-new-password';
    public URL_REFRESH_TOKEN = 'refresh-token';
    public URL_LOGOUT = 'logout';
    public URL_ME = 'me';

    constructor() {
        super('admin/auth');
    }

    public async login(data: IAuthData): Promise<IAuthResponse> {
        const response = await this.post<IAuthResponse>(this.URL_LOGIN, data);
        const { token, refresh_token } = response;

        setAccessToken(token);
        setRefreshToken(refresh_token);

        return response;
    }

    public async forgotPassword(data: IForgotPasswordData): Promise<IApiResponse<boolean>> {
        return await this.post<IApiResponse<boolean>>(this.URL_FORGOT_PASSWORD, data);
    }

    public async grantNewPassword({ password_confirmation, ...data }: IGrantNewPasswordData): Promise<IApiResponse<IUser>> {
        return await this.post<IApiResponse<IUser>>(this.URL_GRANT_NEW_PASSWORD, data);
    }

    public async refreshToken(failedRequest: any): Promise<void> {
        const refresh_token = getRefreshToken();

        if (!refresh_token) return Promise.reject();

        try {
            const response = await this.post<IAuthResponse>(this.URL_REFRESH_TOKEN, { refresh_token });

            setAccessToken(response.token);
            setRefreshToken(response.refresh_token);

            failedRequest.response.config.headers['Authorization'] = 'Bearer ' + response.token;
            return Promise.resolve();
        } catch (error) {
            this.logout();
            return Promise.reject(error);
        }
    }

    public async logout(): Promise<IApiResponse<boolean>> {
        return await this.post<IApiResponse<boolean>>(this.URL_LOGOUT, {});
    }

    public async me(): Promise<IApiResponse<IUser>> {
        return await this.get<IApiResponse<IUser>>(this.URL_ME);
    }
}
