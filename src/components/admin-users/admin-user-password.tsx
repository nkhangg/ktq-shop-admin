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
import { useRef } from 'react';

export interface IAdminUserPasswordProps extends IAdminUserBaseProps {}

export default function AdminUserPassword(props: IAdminUserPasswordProps) {
    const { data, setCallback, useTimePassword } = useAdminUserStore();

    const dispatch = useDispatch();

    const adminUserApi = container.get(ApiAdminUsers);

    const formRef: TRefForm<IAdminUserPasswordData> = useRef({});

    const inputs: TInput<IAdminUserPasswordData>[] = [
        {
            key: 'password',
            type: 'password',
            title: 'Password',
            validate: {
                options: {
                    min: 6,
                },
            },
        },
        {
            key: 'confirm_password',
            type: 'password',
            title: 'Confirm Password',
            validate: {
                options: {
                    min: 6,
                },
                validateFN(input, values, value) {
                    const resultPasswordValidate = validate.text(input, value as string) || null;

                    if (!resultPasswordValidate && values.password.length) {
                        if (values.password !== value) return 'Please check your confirm password';
                    }

                    return resultPasswordValidate;
                },
            },
        },
    ];

    const { mutate } = useMutation({
        mutationFn: (data: IAdminUserPasswordData & IComfirmPasswordAdmin) => adminUserApi.setNewPassword(props.id, data),
        mutationKey: ['admin-user/set-new-password/[id]/[PUT]'],
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);

            if (formRef.current?.reset) {
                formRef.current.reset();
            }
        },
    });

    const handleSubmit = (values: IAdminUserPasswordData) => {
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

    return (
        <AdminUserBase {...props}>
            <GenerateForm
                formRef={formRef}
                submitButton={{
                    title: 'Change password',
                }}
                layout={{
                    xl: { col: 1, gap: 2 },
                    lg: { col: 1 },
                    md: { col: 1 },
                }}
                inputs={inputs}
                onSubmit={handleSubmit}
            />
        </AdminUserBase>
    );
}
