import { ApiAdminUsers } from '@/api';
import { IComfirmPasswordAdmin } from '@/api/admin-users';
import { Api, ApiError } from '@/api/api';
import { container } from '@/di/container';
import { genderList } from '@/instances/constants';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { useAdminUserStore } from '@/store/zustand';
import { IAdminUser } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { GenerateForm } from '../lib/generate-form';
import { TInput } from '../lib/generate-form/type';
import AdminUserBase, { IAdminUserBaseProps } from './admin-user-base';

export interface IAdminUserAccountInformationProps extends IAdminUserBaseProps {}

export default function AdminUserAccountInformation(props: IAdminUserAccountInformationProps) {
    const adminUsersApi = container.get(ApiAdminUsers);

    const { setCallback, setData, useTimePassword } = useAdminUserStore();

    const dispatch = useDispatch();

    const { data, refetch } = useQuery({
        queryKey: ['admin-users/[id]/[GET]', props.id],
        queryFn: () => adminUsersApi.getById(props.id),
    });

    const updateMutation = useMutation({
        mutationKey: ['admin-users/[id]/[PUT]', props.id],
        mutationFn: (data: Partial<IAdminUser> & IComfirmPasswordAdmin) => adminUsersApi.update(props.id, data),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            refetch();
        },
    });

    const inputs: TInput<IAdminUser>[] = [
        {
            key: 'id',
            type: 'show',
            title: 'ID',
        },
        {
            key: 'email',
            type: 'show',
            title: 'Email',
        },
        {
            key: 'username',
            type: 'show',
            title: 'Username',
        },
        {
            key: 'first_name',
            type: 'text',
            title: 'First name',
            validate: {
                options: {
                    required: false,
                },
            },
        },
        {
            key: 'last_name',
            type: 'text',
            title: 'Last name',
            validate: {
                options: {
                    required: false,
                },
            },
        },
        {
            key: 'gender',
            type: 'select',
            data: genderList,
            title: 'Gender',
            validate: {
                options: {
                    required: false,
                },
            },
        },
    ];

    const handleSubmit = (values: IAdminUser) => {
        if (useTimePassword.use_time) {
            dispatch(
                addComfirm({
                    title: `Are you want to update?`,
                    callback: () => updateMutation.mutate({ ...values, admin_password: '' }),
                    acceptLabel: 'Update',
                }),
            );
            return;
        }

        setCallback(({ password, use_time }) => {
            if (!password) return;
            updateMutation.mutate({ ...values, admin_password: password, use_time: !!use_time.length });
        });
    };

    useEffect(() => {
        setData(data?.data || null);
    }, [data]);

    return (
        <AdminUserBase {...props}>
            <GenerateForm
                initData={data?.data || undefined}
                layout={{
                    xl: { col: 3, gap: 2 },
                    lg: { col: 2 },
                    md: { col: 2 },
                }}
                inputs={inputs}
                onSubmit={handleSubmit}
            />
        </AdminUserBase>
    );
}
