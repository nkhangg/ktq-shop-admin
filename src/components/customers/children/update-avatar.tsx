import { ApiCustomers } from '@/api';
import { Api, ApiError } from '@/api/api';
import { ImageEditor } from '@/components/editors';
import { container } from '@/di/container';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { useCustomerStore } from '@/store/zustand';
import { ICustomer } from '@/types';
import { ActionIcon, Box, Group, Image, Modal, rem, Text } from '@mantine/core';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useDisclosure } from '@mantine/hooks';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export interface ICUpdateAvatarProps {
    customerId: ICustomer['id'];
}

export default function CUpdateAvatar({ customerId }: ICUpdateAvatarProps) {
    const customersApi = container.get(ApiCustomers);

    const [opened, { close, open }] = useDisclosure(false);

    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const { data, setData } = useCustomerStore();

    const dispatch = useDispatch();

    const onDrop = useCallback((files: FileWithPath[]) => {
        const localUrl = URL.createObjectURL(files[0]);

        setImageUrl(localUrl);

        open();
    }, []);

    useEffect(() => {
        return () => {
            if (!imageUrl) return;
            URL.revokeObjectURL(imageUrl);
        };
    }, [imageUrl]);

    const updateMutation = useMutation({
        mutationFn: (data: string) => customersApi.updateAvatar(customerId, data),
        mutationKey: ['customers/update-avatar/[POST]'],
        onSuccess(response) {
            Api.handle_response(response);

            if (response?.data && data) {
                setData({ ...data, customer: response.data });
            }

            close();
        },
        onError(error) {
            console.log(error);
            Api.response_form_error(error as ApiError);
        },
    });

    const deleteMediaMutation = useMutation({
        mutationFn: (data: 'bg_cover' | 'avatar') => customersApi.deleteMedia(customerId, data),
        mutationKey: ['customers/delete-avatar/[DELETE]'],
        onSuccess(response) {
            Api.handle_response(response);

            if (response?.data && data) {
                setData({ ...data, customer: response.data });
            }

            close();
        },
        onError(error) {
            console.log(error);
            Api.response_form_error(error as ApiError);
        },
    });

    const handleUpdate = (data: string) => {
        dispatch(
            addComfirm({
                title: 'Are you want to update avatar for customer',
                callback: () => updateMutation.mutate(data),
            }),
        );
    };

    const handleDeleteMedia = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        dispatch(
            addComfirm({
                title: `Are you want to delete avatar`,
                callback: () => deleteMediaMutation.mutate('avatar'),
            }),
        );
    };

    return (
        <>
            <Dropzone multiple={false} onDrop={onDrop} onReject={(files) => console.log('rejected files', files)} maxSize={5 * 1024 ** 2} accept={IMAGE_MIME_TYPE}>
                <Group justify="center" gap="xl" p={10} style={{ pointerEvents: 'none' }} className="border-2 border-gray-500 rounded-lg">
                    <Dropzone.Accept>
                        <IconUpload style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }} stroke={1.5} />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                        <IconX style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }} stroke={1.5} />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                        <Box style={{ pointerEvents: 'auto' }} className="flex items-center justify-center flex-col">
                            {data?.customer.avatar ? (
                                <Box className="group relative">
                                    <Image radius="md" h={280} src={data?.customer.avatar} />
                                    <ActionIcon onClick={handleDeleteMedia} variant="default" className="absolute top-1 right-1">
                                        <IconX className="hover:text-red-500" style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                    </ActionIcon>
                                </Box>
                            ) : (
                                <>
                                    <IconPhoto style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }} stroke={1.5} />
                                    <Text className="text-center">Set Avatar</Text>
                                </>
                            )}
                        </Box>
                    </Dropzone.Idle>
                </Group>
            </Dropzone>

            <Modal opened={opened} onClose={close} title="Edit Image" centered size={'xl'}>
                <ImageEditor onCrop={handleUpdate} defaultSrc={imageUrl || ''} />
            </Modal>
        </>
    );
}
