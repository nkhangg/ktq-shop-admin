import { ApiCacheService } from '@/api';
import { Api, ApiError } from '@/api/api';
import { container } from '@/di/container';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { cn, toSnakeCase } from '@/utils/app';
import { Button, Checkbox, Group, Modal, ModalProps, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { useDispatch } from 'react-redux';

export interface IClearCacheModalProps extends ModalProps {
    data: {
        value: number;
        name: string;
    }[];
}

export default function ClearCacheModal({ data, ...props }: IClearCacheModalProps) {
    const cacheServiceApi = container.get(ApiCacheService);

    const [values, setValues] = useState<string[]>([]);

    const dispatch = useDispatch();

    const { mutate } = useMutation({
        mutationFn: (cache_keys: string[]) => cacheServiceApi.clearCachesByKeys(cache_keys),
        mutationKey: ['cache-services[POST]'],
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            handleClose();
        },
    });

    const cards = data.map((item) => (
        <Checkbox.Card
            radius="md"
            value={item.name}
            key={item.name}
            className={cn(``, {
                ['border-blue-800']: values.includes(item.name),
            })}
        >
            <Group wrap="nowrap" className="items-center p-5">
                <Checkbox.Indicator />
                <div>
                    <Text>
                        {item.name} ({item.value})
                    </Text>
                </div>
            </Group>
        </Checkbox.Card>
    ));

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        dispatch(
            addComfirm({
                callback: () => {
                    const newValues = values.map((item) => toSnakeCase(item));

                    mutate(newValues);
                },
                title: 'Are sure to clear cache?',
                acceptLabel: 'Clear',
                buttonProps: {
                    color: 'red',
                },
            }),
        );
    };

    const handleClose = () => {
        props.onClose();

        setValues([]);
    };

    return (
        <Modal {...props} centered onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <Checkbox.Group value={values} onChange={setValues} label="Pick key to clear" description="Choose all packages that you will need to clear all keys">
                    <Stack pt="md" gap="xs">
                        {cards}
                    </Stack>
                </Checkbox.Group>

                <Button fullWidth mt={'lg'} type="submit">
                    Submit
                </Button>
            </form>
        </Modal>
    );
}
