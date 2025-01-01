import { useAdminUserStore } from '@/store/zustand';
import { GenerateForm } from '../lib/generate-form';
import { TInput, TRefForm } from '../lib/generate-form/type';
import validate from '../lib/generate-form/ultils/validate';
import AdminUserBase, { IAdminUserBaseProps } from './admin-user-base';
import { useDispatch } from 'react-redux';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { useMutation } from '@tanstack/react-query';
import ApiAdminUsers, { IAdminUserPasswordData, IComfirmPasswordAdmin } from '@/api/admin-users';
import { container } from '@/di/container';
import { Api, ApiError } from '@/api/api';
import { useEffect, useMemo, useRef } from 'react';
import { IRole } from '@/types';
import { useRolesSelectData } from '@/hooks/roles';

export interface IAdminUserRoleProps extends IAdminUserBaseProps {}

export default function AdminUserRole(props: IAdminUserRoleProps) {
    const { data, setCallback, useTimePassword, setData } = useAdminUserStore();

    const { rolesSelect } = useRolesSelectData();

    const dispatch = useDispatch();

    const adminUserApi = container.get(ApiAdminUsers);

    const formRef: TRefForm<{ role_id: IRole['id'] }> = useRef({});

    const inputs: TInput<{ role_id: IRole['id'] }>[] = [
        {
            key: 'role_id',
            type: 'select',
            title: 'Role',
            data: rolesSelect,
        },
    ];

    const { mutate } = useMutation({
        mutationFn: (data: { role_id: IRole['id'] } & IComfirmPasswordAdmin) => adminUserApi.updateRole(props.id, data),
        mutationKey: ['admin-user/role/[id]/[PUT]'],
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);

            setData(data.data);
        },
    });

    const handleSubmit = (values: { role_id: IRole['id'] }) => {
        if (useTimePassword.use_time) {
            dispatch(
                addComfirm({
                    title: `Are you want to update?`,
                    callback: () => mutate({ ...values, admin_password: '' }),
                    acceptLabel: 'Update',
                }),
            );
            return;
        }

        setCallback(({ password, use_time }) => {
            if (!password) return;
            mutate({ ...values, admin_password: password, use_time: !!use_time.length });
        });
    };

    const generateForm = useMemo(() => {
        return (
            <GenerateForm
                initData={
                    data
                        ? {
                              role_id: data.role.id,
                          }
                        : undefined
                }
                formRef={formRef}
                layout={{
                    xl: { col: 1, gap: 2 },
                    lg: { col: 1 },
                    md: { col: 1 },
                }}
                inputs={inputs}
                onSubmit={handleSubmit}
            />
        );
    }, [data, inputs]);

    return <AdminUserBase {...props}>{generateForm}</AdminUserBase>;
}
