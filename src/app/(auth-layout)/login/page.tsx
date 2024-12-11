'use client';
import { Api, ApiError } from '@/api/api';
import ApiAuthentication, { IAuthData } from '@/api/authentication';
import { container } from '@/di/container';
import Routes from '@/instances/routes';
import { addUser } from '@/store/slices/app-slice';
import { Anchor, Button, Divider, Group, Paper, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import * as yup from 'yup';
export interface IALLoginRootPageProps {}

export default function ALLoginRootPage(props: IALLoginRootPageProps) {
    const router = useRouter();

    const apiAuthentication = container.get(ApiAuthentication);

    const dispatch = useDispatch();

    const validationSchema = yup.object().shape({
        username: yup.string().required('Username is required').min(4, 'Username must be at least 4 characters'),
        password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    });

    const form = useForm<IAuthData>({
        initialValues: {
            username: '',
            password: '',
        },
        validate: yupResolver(validationSchema),
    });

    const { mutate } = useMutation({
        mutationFn: (data: IAuthData) => apiAuthentication.login(data),
        onSuccess: (response) => {
            if (response?.data) {
                dispatch(addUser(response.data));
            }

            router.push(Routes.DASHBOARD);
        },
        onError: (error) => {
            console.log(error);
            Api.response_form_error(error as ApiError);
        },
    });

    const handleSubmit = async (data: IAuthData) => {
        mutate(data);
    };

    return (
        <>
            <Paper radius="md" p="xl" withBorder>
                <Text size="lg" fw={500} className="text-center">
                    Welcome to KTQ Shop
                </Text>

                <Divider label="Sign by root admin account" labelPosition="center" my="lg" />

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput label="Username" placeholder="Hitle@123" radius="md" {...form.getInputProps('username')} />

                        <PasswordInput label="Password" placeholder="Your password" {...form.getInputProps('password')} radius="md" />
                    </Stack>

                    <Group justify="space-between" mt="xl">
                        <Anchor component={Link} href={Routes.FORGOT_PASSWORD} c="dimmed" size="xs">
                            Forgotten password?
                        </Anchor>
                        <Button type="submit" radius="xl">
                            Sign in
                        </Button>
                    </Group>
                </form>
            </Paper>
        </>
    );
}
