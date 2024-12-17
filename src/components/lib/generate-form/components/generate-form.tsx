'use client';

import {
    Button,
    Checkbox,
    CheckboxProps,
    Group,
    NumberInput,
    NumberInputProps,
    PasswordInput,
    PasswordInputProps,
    Radio,
    RadioProps,
    Select,
    SelectProps,
    Stack,
    Textarea,
    TextareaProps,
    TextInput,
    TextInputProps,
} from '@mantine/core';

import { DateInput, DateInputProps, DateTimePicker, DateTimePickerProps } from '@mantine/dates';

import { Fragment, useCallback, useEffect, useImperativeHandle, useMemo } from 'react';

import { useForm } from '@mantine/form';
import { upperFirst } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';
import { IGenerateFormProps, TInput } from '../type';
import { renderClassReponsive } from '../ultils/fn';
import validate from '../ultils/validate';

export default function GenerateForm<R extends Record<string, any>>({
    props,
    inputs,
    initData,
    layout = { xl: { col: 2, gap: 20 } },
    submitButton = { title: 'Submit' },
    formRef,
    onSubmit,
    onValuesChange,
}: IGenerateFormProps<R>) {
    const inputData = useMemo(() => {
        return inputs.reduce((prev, cur) => {
            (prev as any)[cur.key as keyof R] = cur?.generateValue ? cur.generateValue(cur) : cur.value || '';
            return prev;
        }, {} as R);
    }, [inputs]);

    const validates = useMemo(() => {
        return inputs.reduce((prev, cur) => {
            if (cur?.validate?.validateFN) {
                (prev as any)[cur.key as keyof R] = (value: string) =>
                    cur.validate?.validateFN ? cur.validate?.validateFN(cur, form.getValues(), value) : validate.text(cur, value);
            } else {
                (prev as any)[cur.key as keyof R] = validate[cur?.validate?.style as keyof typeof validate]
                    ? (value: string) => validate[cur?.validate?.style as keyof typeof validate](cur, value)
                    : (value: string) => validate.text(cur, value);
            }

            return prev;
        }, {});
    }, [inputs]);

    const form = useForm<R>({
        mode: 'controlled',
        initialValues: initData || (inputData as R),
        validate: validates,
        onValuesChange,
    });

    const renderInput = useCallback(
        (input: TInput<R>) => {
            const renderColsapn = (colspan?: number) => {
                if (!layout || !layout?.xl?.col || !colspan) return `span 1 / span 1`;

                if (colspan > layout.xl.col) return `span ${layout} / span ${layout}`;

                return `span ${colspan} / span ${colspan}`;
            };

            const props = {
                classNames: {
                    label: 'flex items-center justify-start',
                    error: 'text-left',
                },

                label: input?.title || <span className="capitalize">{input.key}</span>,
                style: {
                    gridColumn: renderColsapn(input.colspan),
                },

                ...form.getInputProps(input.key),
            };

            if (input.render) {
                return input.render(input);
            }

            switch (input.type) {
                case 'number': {
                    return <NumberInput {...props} {...(input.props as NumberInputProps)} />;
                }
                case 'show': {
                    return <TextInput {...props} {...(input.props as TextInputProps)} readOnly={true} />;
                }
                case 'text': {
                    return <TextInput {...props} {...(input.props as TextInputProps)} />;
                }
                case 'datetime': {
                    return (
                        <DateTimePicker
                            {...props}
                            {...(input.props as DateTimePickerProps)}
                            rightSection={
                                form.getValues()[input.key] ? (
                                    <IconX className="cursor-pointer" onClick={() => form.setFieldValue(input.key, '' as R[keyof R])} size={'14px'} />
                                ) : undefined
                            }
                        />
                    );
                }
                case 'date': {
                    return (
                        <DateInput
                            {...props}
                            {...(input.props as DateInputProps)}
                            rightSection={
                                form.getValues()[input.key] ? (
                                    <IconX className="cursor-pointer" onClick={() => form.setFieldValue(input.key, '' as R[keyof R])} size={'14px'} />
                                ) : undefined
                            }
                        />
                    );
                }
                case 'select': {
                    if (!input?.data) throw new Error('The data prop is required');
                    return <Select data={input.data} {...props} checkIconPosition="right" {...(input.props as SelectProps)} />;
                }
                case 'text-area': {
                    return <Textarea {...props} {...(props as TextareaProps)} />;
                }
                case 'password': {
                    return <PasswordInput {...props} {...(input.props as PasswordInputProps)} />;
                }
                case 'boolean': {
                    if (!input?.data) throw new Error('The data prop is required');

                    return (
                        <Radio.Group {...props}>
                            {input?.styleShow === 'vertical' ? (
                                <Stack>
                                    {input.data.map((item) => {
                                        return <Radio size="xs" key={item} value={item} label={upperFirst(item)} {...(input.props as RadioProps)} />;
                                    })}
                                </Stack>
                            ) : (
                                <Group mt="xs">
                                    {input.data.map((item) => {
                                        return <Radio size="xs" key={item} value={item} label={upperFirst(item)} {...(input.props as RadioProps)} />;
                                    })}
                                </Group>
                            )}
                        </Radio.Group>
                    );
                }
                case 'checkbox': {
                    if (!input?.data) throw new Error('The data prop is required');

                    return (
                        <Checkbox.Group {...props}>
                            {input?.styleShow === 'vertical' ? (
                                <Stack>
                                    {input.data.map((item) => {
                                        return <Checkbox size="xs" key={item} value={item} label={upperFirst(item)} {...(input.props as CheckboxProps)} />;
                                    })}
                                </Stack>
                            ) : (
                                <Group mt="xs">
                                    {input.data.map((item) => {
                                        return <Checkbox size="xs" key={item} value={item} label={upperFirst(item)} {...(input.props as CheckboxProps)} />;
                                    })}
                                </Group>
                            )}
                        </Checkbox.Group>
                    );
                }

                default:
                    return <TextInput {...props} />;
            }
        },
        [form, layout],
    );

    const generateInitData = useCallback(() => {
        if (!initData) return null;
        return inputs.reduce((prev, cur) => {
            (prev as any)[cur.key as keyof R] = cur?.generateValue ? cur.generateValue({ ...cur, value: initData[cur.key] }) : initData[cur.key] || '';

            return prev;
        }, {} as R);
    }, [initData]);

    useEffect(() => {
        const newInitData = generateInitData();

        if (!newInitData) return;

        form.setValues(newInitData);
    }, [generateInitData]);

    useImperativeHandle(
        formRef,
        () => {
            return {
                reset: form.reset,
            };
        },
        [form.reset],
    );

    return (
        <>
            <form
                onSubmit={form.onSubmit((values) => {
                    const trimmedValues = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])) as R;

                    onSubmit(trimmedValues);
                })}
                {...props}
            >
                <div
                    className={renderClassReponsive(layout)}
                    // className="grid grid-cols-2 gap-2"
                >
                    {inputs.map((input) => {
                        return <Fragment key={input.key}>{renderInput(input)}</Fragment>;
                    })}
                </div>

                {submitButton && typeof submitButton === 'function' ? (
                    submitButton()
                ) : (
                    <div className="mt-4">
                        <Button type={'submit'} className="w-full" {...submitButton.props}>
                            {submitButton.title || 'Submit'}
                        </Button>
                    </div>
                )}
            </form>
        </>
    );
}
