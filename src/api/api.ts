import { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { toast_error, toast_success } from '@/instances/toast';
import { joinUrl } from '@/utils/app';
import axios from '@/instances/axios';
import capitalize from 'capitalize';
import { ITableFilter } from '@/components/lib/table/type';
import { defaultPrefixShort, searchKey } from '@/components/lib/table/ultils';
export type ApiError = AxiosError<IApiResponse<null>>;

export interface IApiResponse<T> {
    message: string;
    status_code: number;
    data: null | T;
    timestamp: string;
    errors: string | ErrorItem[];
}

export interface IApiResponsePagination<T> extends IApiResponse<T> {
    current_page: number;
    from: number;
    to: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface ErrorItem {
    field: string;
    errors: string[];
}

export class Api {
    public base_url: string;

    protected api_url: (value: string) => string;

    constructor(base_url: string = '') {
        this.base_url = base_url;
        this.api_url = joinUrl(this.base_url);
    }

    // Xử lý lỗi và thông báo
    public static response_form_error(error: ApiError, noti = { error: true, success: true }) {
        const response = error.response?.data;

        if (response?.errors && response.errors.length) {
            const errorItem = response.errors[0];

            if (typeof errorItem !== 'string') {
                let message = errorItem.errors[0] ?? response.message;

                if (response.errors.length > 1) {
                    message = `${message} and ${response.errors.length - 1} different error`;
                }

                toast_error(message);

                return response;
            }
        }

        toast_error(response?.message);

        return response;
    }

    public static handle_response<T>(response: IApiResponse<T>) {
        if (!response || ![200, 201].includes(response.status_code)) return;

        toast_success(response.message);

        return response;
    }

    public generateNestParams(params: Record<string, any>) {
        const excludeKeys = ['page'];

        const prefixSortKey = defaultPrefixShort;

        if (!params) return params;

        const newParams = Object.keys(params).reduce((prev, cur) => {
            if (excludeKeys.includes(cur)) {
                prev[cur] = params[cur];
            } else if (cur.includes(prefixSortKey)) {
                prev['sortBy'] = `${cur.replace(defaultPrefixShort, '')}:${String(params[cur]).toLocaleUpperCase()}`;
            } else if (cur === 'per_page') {
                prev['limit'] = params[cur];
            } else if (cur === searchKey) {
                prev['search'] = params[cur];
            } else {
                prev[`filter.${cur}`] = params[cur];
            }

            return prev;
        }, {});
        return newParams;
    }

    // GET method
    protected async get<T>(url: string, config?: AxiosRequestConfig, nestParams = true): Promise<T> {
        const response = await axios({
            method: 'GET',
            url: this.api_url(url),
            ...config,
            params: nestParams ? this.generateNestParams(config?.params) : config?.params,
        });
        return response.data;
    }

    public parseFilterToParams<T extends Record<string, any>>(data: ITableFilter<T>[]) {
        if (!data) return null;

        return data.reduce((acc, item) => {
            acc[item.key] = item.type;
            return acc;
        }, {} as Record<string, any>);
    }

    // POST method
    protected async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await axios({
            method: 'POST',
            url: this.api_url(url),
            data,
            ...config,
        });
        return response.data;
    }

    // PUT method
    protected async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await axios({
            method: 'PUT',
            url: this.api_url(url),
            data,
            ...config,
        });
        return response.data;
    }

    // DELETE method
    protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await axios({
            method: 'DELETE',
            url: this.api_url(url),
            ...config,
        });
        return response.data;
    }
}
