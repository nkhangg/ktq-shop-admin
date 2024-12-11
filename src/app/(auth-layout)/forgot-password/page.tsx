'use client';
import { Api, ApiError } from '@/api/api';
import ApiAuthentication, { IForgotPasswordData } from '@/api/authentication';
import { container } from '@/di/container';
import Routes from '@/instances/routes';
import { RootState } from '@/store';
import { clearForgotStore, decrement, setEmail } from '@/store/slices/forgot-pass-slice';
import { Anchor, Button, Divider, Group, Paper, Stack, Text, TextInput } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

export interface IALForgotPasswordRootPageProps {}

export default function ALForgotPasswordRootPage(props: IALForgotPasswordRootPageProps) {
    const apiAuthentication = container.get(ApiAuthentication);

    const timeIntervalId = useRef<any>(null);

    const { countdown, email } = useSelector((state: RootState) => state.forgotPass);
    const countdownRef = useRef(countdown);

    const dispatch = useDispatch();

    const [sent, setSent] = useState(false);

    const validationSchema = yup.object().shape({
        email: yup.string().required('Email is required').email(),
    });

    const form = useForm<IForgotPasswordData>({
        initialValues: {
            email: '',
        },
        validate: yupResolver(validationSchema),
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (data: IForgotPasswordData) => apiAuthentication.forgotPassword(data),
        onSuccess: (response) => {
            if (!response?.data) return;
        },
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSettled: () => {
            handleCountdown();
        },
    });

    const handleSubmit = async (data: IForgotPasswordData) => {
        mutate(data);

        dispatch(setEmail(data.email));
    };

    const handleCountdown = () => {
        setSent(true);

        timeIntervalId.current = setInterval(() => {
            if (countdownRef.current <= 0) {
                clearInterval(timeIntervalId.current);
                setSent(false);
                dispatch(clearForgotStore());
                return;
            }

            dispatch(decrement());
        }, 1000);
    };

    useEffect(() => {
        if (email && countdown > 0) {
            form.setValues({ email });
            handleCountdown();
        }

        return () => {
            if (!timeIntervalId.current) return;

            clearInterval(timeIntervalId.current);
        };
    }, []);

    useEffect(() => {
        countdownRef.current = countdown;
    }, [countdown]);

    return (
        <>
            <Paper radius="md" p="xl" withBorder>
                <Text size="lg" fw={500} className="text-center">
                    Welcome to KTQ Shop
                </Text>

                <Divider label="Forgot password" labelPosition="center" my="lg" />

                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput disabled={sent} label="Email" placeholder="abc@gmail.com" radius="md" {...form.getInputProps('email')} />
                    </Stack>

                    <Group justify="space-between" mt="xl">
                        <Anchor component={Link} href={Routes.LOGIN} c="dimmed" size="xs">
                            Login with password
                        </Anchor>
                        <Button disabled={sent || isPending} type="submit" radius="xl">
                            {!sent ? 'Send' : `${countdown}s`}
                        </Button>
                    </Group>
                </form>
            </Paper>
        </>
    );
}
