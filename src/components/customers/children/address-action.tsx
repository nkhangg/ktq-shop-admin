import { ApiLocations } from '@/api';
import ApiAddress, { AddressData } from '@/api/addresses';
import { Api, ApiError } from '@/api/api';
import { container } from '@/di/container';
import { IAddress, ICustomer } from '@/types';
import { Autocomplete, Box, Button, ComboboxData, ComboboxItem, Select, TextInput } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { IconX } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import * as yup from 'yup';
export interface ICAddressActionProps {
    customerId: ICustomer['id'];
    addressData?: IAddress;
    onSuccess?: () => void;
    refForm?: CAddressActionRef;
}

export type CAddressActionRef = React.MutableRefObject<{
    reset?: () => void;
}>;

const CAddressAction = forwardRef<HTMLFormElement, ICAddressActionProps>(({ customerId, addressData, refForm, onSuccess }, ref) => {
    const addressSchema = yup.object().shape({
        country_id: yup.number().required('Country is required'),
        province: yup.string().required('Province is required'),
        district: yup.string().nullable().required('District is required when province is selected'),
        ward: yup.string().nullable().required('Ward is required when district is selected'),
        address_line: yup.string().required('Address is required').min(5, 'Address must be at least 5 characters long').max(255, 'Address cannot exceed 255 characters'),
        postal_code: yup.number().required('Postal code is required'),
    });

    const [fetchState, setFetchState] = useState(false);

    const form = useForm<AddressData>({
        mode: 'controlled',
        onValuesChange: (values, previous) => {
            if (!values.province || !values.province.length || !fetchState) return;

            if (values.province !== previous.province) {
                if (!provincesSelect.length) {
                    form.setFieldValue('district', '');
                    districtsMutation.mutate(values.province);
                } else {
                    if (provincesSelect.find((item) => (item as ComboboxItem).value === values.province)) {
                        form.setFieldValue('district', '');
                        districtsMutation.mutate(values.province);
                    }
                }
            }

            if (!values.district || !values.district.length) return;

            if (values.district !== previous.district) {
                if (!districtsSelect.length) {
                    form.setFieldValue('ward', '');
                    wardsMutation.mutate({ district_name: values.district, province_name: values.province });
                } else {
                    if (districtsSelect.find((item) => (item as ComboboxItem).value === values.district)) {
                        form.setFieldValue('ward', '');
                        wardsMutation.mutate({ district_name: values.district, province_name: values.province });
                    }
                }
            }
        },
        validate: yupResolver(addressSchema),
    });

    const locationApi = container.get(ApiLocations);
    const addressApi = container.get(ApiAddress);

    const countriesQuery = useQuery({
        queryFn: () => locationApi.countries(),
        queryKey: ['location/countries[GET]'],
    });

    const provincesQuery = useQuery({
        queryFn: () => locationApi.provinces(),
        queryKey: ['location/provinces[GET]'],
    });

    const districtsMutation = useMutation({
        mutationFn: (province_name: string) => locationApi.districts({ province_name }),
        mutationKey: ['location/districts[GET]'],
    });

    const wardsMutation = useMutation({
        mutationFn: (params: { province_name: string; district_name: string }) => locationApi.wards(params),
        mutationKey: ['location/wards[GET]'],
    });

    const createAddressMutation = useMutation({
        mutationFn: (data: AddressData) => addressApi.createByCustomer(customerId, data),
        mutationKey: ['customer/address/[POST]'],
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);

            form.reset();

            if (onSuccess) {
                onSuccess();
            }
        },
    });

    const updateAddressMutation = useMutation({
        mutationFn: ({ address_id, data }: { address_id: IAddress['id']; data: AddressData }) => addressApi.updateByCustomer(customerId, address_id, data),
        mutationKey: ['customer/address/[PUT]'],
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
        onSuccess: (data) => {
            Api.handle_response(data);

            form.reset();

            if (onSuccess) {
                onSuccess();
            }
        },
    });

    const countriesSelect: ComboboxData = useMemo(() => {
        if (!countriesQuery.data?.data) return [];

        return countriesQuery.data.data.map((item) => {
            return {
                label: item.country_name,
                value: String(item.id),
            };
        }) as ComboboxData;
    }, [countriesQuery.data]);

    const provincesSelect: ComboboxData = useMemo(() => {
        if (!provincesQuery.data?.data) return [];

        return provincesQuery.data.data.map((item) => {
            return {
                label: item.name,
                value: item.name,
            };
        }) as ComboboxData;
    }, [provincesQuery.data]);

    const districtsSelect: ComboboxData = useMemo(() => {
        if (!districtsMutation.data?.data) return [];

        return districtsMutation.data.data.map((item) => {
            return {
                label: item.name,
                value: item.name,
            };
        }) as ComboboxData;
    }, [districtsMutation.data]);

    const wardsSelect: ComboboxData = useMemo(() => {
        if (!wardsMutation.data?.data) return [];

        return wardsMutation.data.data.map((item) => {
            return {
                label: item.name,
                value: item.name,
            };
        }) as ComboboxData;
    }, [wardsMutation.data]);

    const rightSection = (key: keyof AddressData) => {
        return form.getValues()[key] ? (
            <IconX
                className="cursor-pointer"
                onClick={() => {
                    form.setFieldValue(key, '');

                    if (key === 'province') {
                        form.setValues({
                            district: '',
                            province: '',
                            ward: '',
                        });
                    } else if (key === 'district') {
                        form.setValues({
                            district: '',
                            ward: '',
                        });
                    }
                }}
                size={'14px'}
            />
        ) : undefined;
    };

    useEffect(() => {
        if (!addressData) {
            setFetchState(true);
            form.reset();
            return;
        }

        form.setValues({
            address_line: addressData.address_line ?? null,
            country_id: String(addressData.country.id) ?? null,
            district: addressData.district ?? null,
            province: addressData.city ?? null,
            ward: addressData.ward ?? null,
            postal_code: addressData.postal_code ?? null,
        });

        districtsMutation.mutate(addressData.city);
        wardsMutation.mutate({ province_name: addressData.city, district_name: addressData.district });

        setFetchState(true);
    }, [addressData]);

    useImperativeHandle(
        refForm,
        () => ({
            reset: form.reset,
        }),
        [],
    );

    return (
        <form
            ref={ref}
            onSubmit={form.onSubmit((values) => {
                if (addressData) {
                    updateAddressMutation.mutate({ address_id: addressData.id, data: values });
                } else {
                    createAddressMutation.mutate(values);
                }
            })}
        >
            <Box className="grid grid-cols-2 gap-3 w-full mb-5">
                <Select styles={{ root: { width: ' 100%' } }} label="Country" placeholder="Việt Nam" data={countriesSelect} {...form.getInputProps('country_id')} />
                <Autocomplete
                    styles={{ root: { width: ' 100%' } }}
                    label="Province"
                    placeholder="Thành phố Hà Nội"
                    data={provincesSelect}
                    {...form.getInputProps('province')}
                    rightSection={rightSection('province')}
                />
                <Autocomplete
                    styles={{ root: { width: ' 100%' } }}
                    label="District"
                    placeholder="Quận Ba Đình"
                    data={districtsSelect}
                    {...form.getInputProps('district')}
                    rightSection={rightSection('district')}
                />
                <Autocomplete
                    styles={{ root: { width: ' 100%' } }}
                    label="Ward"
                    placeholder="Phường Phúc Xá"
                    data={wardsSelect}
                    {...form.getInputProps('ward')}
                    rightSection={rightSection('ward')}
                />
                <TextInput
                    styles={{ root: { width: ' 100%' } }}
                    classNames={{ root: 'col-span-2' }}
                    label="Address"
                    placeholder="hẻm abc"
                    {...form.getInputProps('address_line')}
                    rightSection={rightSection('address_line')}
                />
                <TextInput
                    styles={{ root: { width: ' 100%' } }}
                    classNames={{ root: 'col-span-2' }}
                    label="Postal code"
                    placeholder="12600"
                    {...form.getInputProps('postal_code')}
                    rightSection={rightSection('postal_code')}
                />
            </Box>

            <Box className="w-full mt-5 flex items-center">
                <Button fullWidth type="submit">
                    {addressData ? 'Update' : 'Save'}
                </Button>
            </Box>
        </form>
    );
});

export default CAddressAction;
