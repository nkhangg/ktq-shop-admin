'use client';

import { Api, ApiError } from '@/api/api';
import ApiAuthentication, { IGrantNewPasswordData } from '@/api/authentication';
import { container } from '@/di/container';
import Routes from '@/instances/routes';
import { Anchor, Button, Divider, Group, Paper, PasswordInput, Stack, Text } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as yup from 'yup';

export interface IAlForgotPasswordCodePageProps {
    params: { code: string };
}

export default function AlForgotPasswordCodePage({ params }: IAlForgotPasswordCodePageProps) {
    const apiAuthentication = container.get(ApiAuthentication);

    const router = useRouter();

    const validationSchema = yup.object().shape({
        code: yup.string().required(),
        new_password: yup.string().required('Password is required').min(6),
        password_confirmation: yup.string().oneOf([yup.ref('new_password'), undefined], 'Passwords must match'),
    });

    const form = useForm<IGrantNewPasswordData>({
        initialValues: {
            code: params.code,
            new_password: '',
            password_confirmation: '',
        },
        validate: yupResolver(validationSchema),
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data: IGrantNewPasswordData) => apiAuthentication.grantNewPassword(data),
        onSuccess: (response) => {
            Api.handle_response(response as any);

            router.push(Routes.LOGIN);
        },
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
    });

    const handleSubmit = async (data: IGrantNewPasswordData) => {
        mutate(data);
    };

    return (
        <>
            <Paper radius="md" p="xl" withBorder>
                <Text size="lg" fw={500} className="text-center">
                    Change your password
                </Text>

                <Divider labelPosition="center" my="lg" />

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <PasswordInput label="New password" placeholder="123@abc" radius="md" {...form.getInputProps('new_password')} />
                        <PasswordInput label="Comfirm your password" placeholder="123@abc" radius="md" {...form.getInputProps('password_confirmation')} />
                    </Stack>

                    <Group justify="space-between" mt="xl">
                        <Anchor component={Link} href={Routes.LOGIN} c="dimmed" size="xs">
                            Login with password
                        </Anchor>
                        <Button disabled={isPending} type="submit" radius="xl">
                            Change
                        </Button>
                    </Group>
                </form>
            </Paper>
        </>
    );
}
