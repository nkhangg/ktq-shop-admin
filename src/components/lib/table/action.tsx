import { Box, Button, ComboboxItem, Dialog, Group, Modal, Select, SelectProps, Text, TextInput, TextInputProps } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconSearch, IconX } from '@tabler/icons-react';
import { ReactNode, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { IActionData, ITableFilter, TRefTableActionFn } from './type';
import { searchKey } from './ultils';
import { useDisclosure } from '@mantine/hooks';

export interface ITableActionsProps<R extends Record<string, string | number>> {
    actions?: IActionData[];
    showSearch?: boolean;
    loading?: boolean;
    showAction?: boolean;
    initFillter?: ITableFilter<R>[];
    searchOptions?: {
        props?: TextInputProps;
        render?: () => ReactNode;
    };
    refAction?: TRefTableActionFn;
    selectProps?: SelectProps;
    onSearch?: (data: ITableFilter<R>[]) => void;
    renderComfirm?: (data: IActionData) => ReactNode;
    onCloseComfirm?: () => void;
}

export default function TableActions<R extends Record<string, string | number>>({
    showSearch = true,
    showAction = true,
    loading,
    searchOptions,
    initFillter,
    selectProps,
    actions,
    refAction,
    onSearch,
    renderComfirm,
    onCloseComfirm,
}: ITableActionsProps<R>) {
    const [opened, { toggle, close }] = useDisclosure(false);

    const [action, setAction] = useState<IActionData | null>(null);

    const [isLoading, setIsLoading] = useState(loading || false);

    const [selectValue, setSelectValue] = useState<string | null>(null);

    const form = useForm<{ [searchKey]: string }>({
        initialValues: {
            [searchKey]: '',
        },
    });

    const handleSubmit = (data: { [searchKey]: string }) => {
        const filter = { type: data[searchKey].trim(), key: searchKey } as ITableFilter<R>;

        if (onSearch) {
            onSearch(data[searchKey]?.length ? [filter] : []);
        }

        form.reset();
    };

    const handleClear = () => {
        form.reset();

        if (onSearch) {
            onSearch([]);
        }
    };

    const handleChangeAction = (value: string | null, option: ComboboxItem) => {
        setSelectValue(value);

        if (!actions) return;

        const action = actions.find((action) => String(action.key) === value);

        if (!action) return;

        setAction(action);

        if (action.comfirmAction) {
            toggle();
        } else {
            handleCallBack(action.callback);
        }
    };

    const handleCallBack = async (callback: Function) => {
        if (callback.constructor.name === 'AsyncFunction') {
            try {
                setIsLoading(true);
                await callback();
            } finally {
                setIsLoading(false);
            }
        } else {
            callback();
        }

        handleClose();
    };

    const actionDataMemo = useMemo(() => {
        return actions?.reduce((prev, cur) => {
            prev.push({ value: String(cur.key), label: cur.title, disabled: !!cur?.disabled });
            return prev;
        }, [] as { value: string; label: string; disabled: boolean }[]);
    }, [actions]);

    const handleClose = () => {
        close();
        setAction(null);
        setSelectValue(null);

        if (onCloseComfirm) {
            onCloseComfirm();
        }
    };

    const handleClearAction = () => {
        setAction(null);
        setSelectValue(null);
    };

    const comfirmViewMemo = useMemo(() => {
        if (!action || !action.comfirmAction) return;

        return renderComfirm ? (
            renderComfirm(action)
        ) : (
            <Dialog opened={opened} withCloseButton onClose={handleClose} size="lg" radius="md">
                <Text size="sm" mb="xs" fw={500}>
                    {action?.comfirmOption && action?.comfirmOption(action)?.title ? action.comfirmOption(action).title : 'Are you sure to execute this action'}
                </Text>
                <div className="flex items-center justify-end w-full gap-3">
                    <Button size="xs" disabled={isLoading} onClick={() => handleCallBack(action.callback)}>
                        Ok
                    </Button>
                    <Button size="xs" disabled={isLoading} color="red" onClick={handleClose}>
                        Close
                    </Button>
                </div>
            </Dialog>
        );
    }, [action, opened, close, renderComfirm]);

    useEffect(() => {
        if (!initFillter) return;

        const params = initFillter.reduce((prev, cur) => {
            if (cur.key === searchKey) {
                prev[cur.key] = cur.type;
            }
            return prev;
        }, {} as Record<string, string | number>);

        form.setValues(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initFillter]);

    useEffect(() => {
        setIsLoading(!!loading);
    }, [loading]);

    useImperativeHandle(
        refAction,
        () => {
            return {
                setAction,
                clearAction: handleClearAction,
            };
        },
        [],
    );

    return (
        <Box className="flex justify-between items-center">
            {showSearch && searchOptions?.render ? (
                searchOptions.render()
            ) : (
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput
                        {...form.getInputProps(searchKey)}
                        className="min-w-[260px]"
                        leftSection={<IconSearch size={'14px'} />}
                        rightSection={
                            form.getValues()[searchKey].length ? <IconX onClick={handleClear} className="cursor-pointer hover:text-red-400 select-none" size={'14px'} /> : undefined
                        }
                        placeholder="Search by keyword"
                        size="xs"
                        label={'Search'}
                        {...searchOptions?.props}
                    />
                </form>
            )}
            {showAction && (
                <Select
                    size="xs"
                    value={selectValue}
                    onChange={handleChangeAction}
                    label="Actions"
                    placeholder="Pick value"
                    defaultChecked={false}
                    data={actionDataMemo}
                    {...selectProps}
                />
            )}

            {comfirmViewMemo}
        </Box>
    );
}
