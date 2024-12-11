import { Api, ApiError } from '@/api/api';
import { IAuthResponse } from '@/api/authentication';
import { store } from '@/store';
import { clearUser } from '@/store/slices/app-slice';
import { clearAllToken, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '@/utils/cookies';
import axios, { CreateAxiosDefaults } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import Routes from './routes';

const config: CreateAxiosDefaults = {
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT || 1000),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
};

// Tạo instance axios
const axiosInstance = axios.create(config);

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAccessToken();

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            window.location.href = Routes.PERMISSION_DENIED;
        }

        return Promise.reject(error);
    },
);

const logout = () => {
    clearAllToken();

    store.dispatch(clearUser());
    window.location.href = Routes.LOGIN;
};

// Hàm refresh token
const refreshAuthLogic = async (failedRequest: any) => {
    const refresh_token = getRefreshToken();

    if (!refresh_token) {
        logout();
        return Promise.reject();
    }

    try {
        const response = await axios<IAuthResponse>({
            baseURL: config.baseURL,
            method: 'POST',
            url: 'admin/auth/refresh-token',
            data: { refresh_token },
        });

        setAccessToken(response.data.token);
        setRefreshToken(response.data.refresh_token);

        failedRequest.response.config.headers['Authorization'] = 'Bearer ' + response.data.token;
        return Promise.resolve();
    } catch (error) {
        const response = Api.response_form_error(error as ApiError, { error: false, success: false });

        if (response?.status === 401) {
            logout();
        }

        return Promise.reject(error);
    }
};

createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic, {});

export default axiosInstance;
