'use client';
import { Box, Button, MantineSize, MantineStyleProp, NumberInput, Pagination, Select, TextInput } from '@mantine/core';
import { DateInput, DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconFilterExclamation, IconFilterSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { IColumn, IDataFilter, IFilterItemProps, IOptions, ITableFilter } from './type';
import { defaultKeyPage, defaultKeyPerpage, defaultPerpageValue, defaultPrefixShort, removeFalsy, searchKey } from './ultils';

export interface IFilterProps<R extends Record<string, string | number>> {
    columns: IColumn<R>[];
    loading?: boolean;
    initFillter?: ITableFilter<R>[];
    optionsTable?: IOptions<R>;
    persistFilter?: IDataFilter[];
    onSumit?: (filter: ITableFilter<R>[], options?: IDataFilter[]) => void;
}

export default function Filter<R extends Record<string, string | number>>({
    columns,
    initFillter,
    loading,
    perpage = { show: true },
    pagination = { show: true },
    optionsTable,
    persistFilter,
    onSumit,
    ...props
}: IFilterProps<R> & IFilterItemProps<R>) {
    const defaultPerpage = optionsTable?.perPage ? optionsTable.perPage : defaultPerpageValue;
    const defaultPage = optionsTable?.currentPage ? optionsTable.currentPage : 1;

    // Initialize form with empty strings to maintain controlled state
    const form = useForm<Record<string, string | number>>({
        initialValues: {
            ...columns.reduce((acc, column) => {
                acc[column.key] = '';
                return acc;
            }, {} as Record<string, string | number>),
            ...{
                [perpage?.key || defaultKeyPerpage]: defaultPerpage,
            },
            ...{
                [pagination?.key || defaultKeyPage]: defaultPage,
            },
        },
    });

    const [open, setOpen] = useState(false);

    const [filter, setFilter] = useState<ITableFilter<R>[]>(initFillter ?? []);

    const handleSubmitFilter = form.onSubmit((data) => {
        const validData = removeFalsy(data);

        const tableFilterData = Object.keys(validData).map((item) => {
            return {
                key: item,
                type: item === (pagination.key || defaultKeyPage) ? 1 : validData[item],
            } as ITableFilter<R>;
        });

        // setFilter(tableFilterData);

        // form.setValues({
        //     [pagination?.key || defaultKeyPage]: 1,
        // });

        if (onSumit) onSumit(tableFilterData);
    });

    const handleSubmitOption = form.onSubmit((data) => {
        const validData = removeFalsy(data);

        const tableFilterData = Object.keys(validData).map((item) => {
            return {
                key: item,
                type: validData[item],
            } as ITableFilter<R>;
        });

        // setFilter(tableFilterData);

        if (onSumit) onSumit(tableFilterData);
    });

    const handleClear = () => {
        const validData = removeFalsy(form.getValues());

        const params: { [key: string]: string | number } = {};

        const tableFilterData = Object.keys(validData)
            .filter((i) => ingorKeys.includes(i))
            .map((item) => {
                params[item] = validData[item];
                return {
                    key: item,
                    type: validData[item],
                } as ITableFilter<R>;
            });

        if (persistFilter && persistFilter?.length) {
            persistFilter.reduce((prev, cur) => {
                prev[cur.key] = cur.type;
                return prev;
            }, params);
        }

        form.reset();
        form.setValues(params);

        // setFilter(tableFilterData);

        if (onSumit) onSumit(tableFilterData);
    };

    const ingorKeys = useMemo(() => {
        const persistKeys = persistFilter && persistFilter.length ? persistFilter.map((i) => i.key) : [];

        return [perpage?.key || defaultKeyPerpage, pagination?.key || defaultKeyPage, ...persistKeys];
    }, [perpage?.key, pagination.key, persistFilter]);

    useEffect(() => {
        if (!initFillter) return;

        const params = initFillter.reduce((prev, cur) => {
            prev[cur.key] = cur.type;
            return prev;
        }, {} as Record<string, string | number>);

        form.setValues(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initFillter, optionsTable]);

    useEffect(() => {
        if (!optionsTable?.perPage) return;

        form.setFieldValue(perpage?.key || defaultKeyPerpage, String(optionsTable.perPage));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [optionsTable?.perPage]);

    const defaultStyleInput = {
        size: 'xs' as MantineSize,
        style: { display: 'flex', alignItems: 'start', flexDirection: 'column', gap: '4px' } as MantineStyleProp,
        styles: {
            input: {
                minWidth: '240px',
            },
        },
    };

    const showCautionFillterIcon = useMemo(() => {
        return (
            Object.keys(removeFalsy(form.getValues())).filter((i) => {
                return !ingorKeys.includes(i) && !i.includes(optionsTable?.prefixShort || defaultPrefixShort);
            }).length > 0
        );
    }, [form, ingorKeys, optionsTable?.prefixShort]);

    const paginationMemo = useMemo(() => {
        return (
            <Pagination
                value={Number(form.getValues()[pagination.key || defaultKeyPage]) || 1}
                total={optionsTable?.lastPage || 1}
                onChange={(value) => {
                    form.setFieldValue(pagination.key || defaultKeyPage, value);

                    handleSubmitOption();
                }}
                size={'sm'}
            />
        );
    }, [pagination, optionsTable]);

    return (
        <Box>
            {open && (
                <form onSubmit={handleSubmitFilter} className="border mb-5 p-10 rounded-md ">
                    <Box className="flex rounded-md gap-4 flex-wrap">
                        {columns.map((column) => {
                            if (typeof column.typeFilter === 'object') {
                                switch (column.typeFilter.type) {
                                    case 'select':
                                        return (
                                            <Select
                                                key={column.key}
                                                {...form.getInputProps(column.key)}
                                                label={column.title}
                                                maxDropdownHeight={200}
                                                searchable
                                                data={column.typeFilter.data}
                                                size={defaultStyleInput.size}
                                                style={defaultStyleInput.style}
                                                styles={defaultStyleInput.styles}
                                                {...props.select}
                                            />
                                        );

                                    default:
                                        return (
                                            <Select
                                                key={column.key}
                                                {...form.getInputProps(column.key)}
                                                label={column.title}
                                                maxDropdownHeight={200}
                                                searchable
                                                data={column.typeFilter.data}
                                                size={defaultStyleInput.size}
                                                style={defaultStyleInput.style}
                                                styles={defaultStyleInput.styles}
                                                {...props.select}
                                            />
                                        );
                                }
                            } else {
                                switch (column.typeFilter) {
                                    case 'text':
                                        return (
                                            <TextInput
                                                key={column.key}
                                                {...form.getInputProps(column.key)}
                                                label={column.title}
                                                size={defaultStyleInput.size}
                                                style={defaultStyleInput.style}
                                                styles={defaultStyleInput.styles}
                                                {...props.text}
                                            />
                                        );

                                    case 'number':
                                        return (
                                            <NumberInput
                                                key={column.key}
                                                {...form.getInputProps(column.key)}
                                                label={column.title}
                                                size={defaultStyleInput.size}
                                                style={defaultStyleInput.style}
                                                styles={defaultStyleInput.styles}
                                                {...props.number}
                                            />
                                        );

                                    case 'date':
                                        return (
                                            <DateInput
                                                key={column.key}
                                                valueFormat="DD/MM/YYYY HH:mm:ss"
                                                {...form.getInputProps(column.key)}
                                                value={form.getValues()[column.key] ? new Date(Number(form.getValues()[column.key])) : undefined}
                                                onChange={(value) => {
                                                    form.setFieldValue(column.key as string, value?.getTime() || '');
                                                }}
                                                label={column.title}
                                                size={defaultStyleInput.size}
                                                style={defaultStyleInput.style}
                                                styles={defaultStyleInput.styles}
                                                {...props.date}
                                            />
                                        );
                                    case 'datetime':
                                        return (
                                            <DateTimePicker
                                                key={column.key}
                                                {...form.getInputProps(column.key)}
                                                value={form.getValues()[column.key] ? new Date(Number(form.getValues()[column.key])) : undefined}
                                                onChange={(value) => {
                                                    form.setFieldValue(column.key as string, value?.getTime() || '');
                                                }}
                                                label={column.title}
                                                size={defaultStyleInput.size}
                                                style={defaultStyleInput.style}
                                                styles={defaultStyleInput.styles}
                                                {...props.datatime}
                                            />
                                        );
                                    default:
                                        return (
                                            <TextInput
                                                key={column.key}
                                                {...form.getInputProps(column.key)}
                                                label={column.title}
                                                size={defaultStyleInput.size}
                                                style={defaultStyleInput.style}
                                                styles={defaultStyleInput.styles}
                                                {...props.text}
                                            />
                                        );
                                }
                            }
                        })}
                    </Box>

                    <Box className="flex items-center justify-end gap-2 mt-5">
                        <Button size="xs" onClick={handleClear}>
                            Clear
                        </Button>
                        <Button disabled={loading} type="submit" size="xs">
                            Filter
                        </Button>
                    </Box>
                </form>
            )}

            <div className="w-full flex items-end justify-between">
                <div onClick={() => setOpen((prev) => !prev)} className="w-fit cursor-pointer flex items-start justify-end  flex-col">
                    {showCautionFillterIcon ? <IconFilterExclamation color="red" size={20} /> : <IconFilterSearch size={20} />}

                    <span className="text-sm font-medium text-[#81838a] mt-2 italic">
                        {(optionsTable && props.description && props.description(optionsTable)) ||
                            `Show ${optionsTable?.from || 0} to ${optionsTable?.to || 0} of ${optionsTable?.total || 0} entries`}
                    </span>
                </div>

                <div className="flex items-end gap-4">
                    {paginationMemo}
                    {perpage?.show && (
                        <Select
                            {...form.getInputProps(perpage?.key || defaultKeyPerpage)}
                            onChange={(value) => {
                                form.setFieldValue(perpage?.key || defaultKeyPerpage, value || defaultPerpage);

                                handleSubmitOption();
                            }}
                            size="xs"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'start',
                                gap: '4px',
                            }}
                            label="Per page"
                            data={['5', '10', '15', '20']}
                            {...perpage.perpageProps}
                        />
                    )}
                </div>
            </div>
        </Box>
    );
}
