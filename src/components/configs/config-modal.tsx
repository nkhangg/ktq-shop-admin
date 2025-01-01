import { Modal, ModalProps } from '@mantine/core';
import { GenerateForm } from '../lib/generate-form';
import { TInput, TRefForm } from '../lib/generate-form/type';
import { IConfig } from '@/types';
import validate from '../lib/generate-form/ultils/validate';
import { useMutation } from '@tanstack/react-query';
import { container } from '@/di/container';
import { ApiConfigs } from '@/api';
import { Api, ApiError } from '@/api/api';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { keySpaces, keyTypes } from '@/instances/constants';

export interface IConfigModalProps extends ModalProps {
    data: IConfig | null;
}

export default function ConfigModal({ data, ...props }: IConfigModalProps) {
    const configApi = container.get(ApiConfigs);

    const dispatch = useDispatch();

    const inputs: TInput<IConfig>[] = [
        {
            key: 'key_name',
            type: 'text',
            title: 'Name',
            validate: {
                options: {
                    min: 4,
                },
            },
            props: {
                disabled: Boolean(data),
            },
        },
        {
            key: 'key_space',
            type: 'select',
            title: 'Space',
            data: keySpaces,
        },
        {
            key: 'key_type',
            type: 'select',
            title: 'Type',
            data: keyTypes,
        },
        {
            key: 'key_value',
            type: 'text-area',
            title: 'Value',
            colspan: 3,
            validate: {
                validateFN: (input, values) => {
                    if (values.key_type === 'number') {
                        return validate.number(input, values.key_value);
                    }

                    if (values.key_type === 'json') {
                        return validate.json(input, values.key_value);
                    }

                    return null;
                },
            },
        },
    ];

    const createMutation = useMutation({
        mutationKey: ['configs[POST]'],
        mutationFn: (data: Partial<IConfig>) => configApi.createConfigs(data),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            handleClose();
        },
    });

    const updateMutation = useMutation({
        mutationKey: ['configs[PUT]'],
        mutationFn: (data: Partial<IConfig>) => configApi.updateConfigs(data),
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);
            handleClose();
        },
    });

    const handleClose = () => {
        props.onClose();
    };

    return (
        <Modal {...props} onClose={handleClose} centered size={'80%'}>
            <GenerateForm
                initData={data || undefined}
                layout={{
                    lg: {
                        col: 3,
                        gap: 4,
                    },
                }}
                inputs={inputs}
                onSubmit={(values) => {
                    if (data) {
                        dispatch(
                            addComfirm({
                                callback: () => updateMutation.mutate({ ...values, id: data.id }),
                                title: `Are you want to update: ${data?.key_name}`,
                            }),
                        );
                    } else {
                        createMutation.mutate(values);
                    }
                }}
            />
        </Modal>
    );
}
