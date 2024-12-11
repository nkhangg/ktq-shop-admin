import axios from '@/instances/axios';
import { joinUrl } from '@/utils/app';
import { IApiResponse } from './api';

const api_url = joinUrl('admin/resources');

export const getResources = async (): Promise<IApiResponse<[]>> => {
    const response = await axios({
        method: 'GET',
        url: api_url(''),
    });

    return response.data;
};
