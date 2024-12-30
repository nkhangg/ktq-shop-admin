import { IAddress, IPermission, IResource, IRole } from '@/types';
import { DefaultMantineColor } from '@mantine/core';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const joinUrl = (url: string) => {
    const join = (value: string) => {
        return `${url}/${value}`;
    };

    return join;
};

export function cn(...args: ClassValue[]) {
    return twMerge(clsx(args));
}

// Use when want to keep value is none
export function cleanObject(obj: Record<string, any>) {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([_, value]) => value)
            .map(([key, value]) => [key, value === 'none' ? null : value]),
    );
}

// Use when want to clear all falsy values on object
export function removeFalsyValues(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(Object.entries(obj).filter(([key, value]) => Boolean(value)));
}

export function clearData<M extends Record<string, any>>(obj: M, removeKeys: (keyof M)[], mappingsKeys?: Record<string, any | { key: string; type: 'number' | 'string' }>[]) {
    const newObj = Object.keys(obj).reduce((prev, cur) => {
        if (!removeKeys.includes(cur as keyof M)) {
            prev[cur as keyof M] = obj[cur as keyof M];
        }

        return prev;
    }, {} as Partial<M>);

    if (mappingsKeys) {
        mappingsKeys.forEach((mapping) => {
            for (const [sourceKey, targetKeyInfo] of Object.entries(mapping)) {
                if (newObj[sourceKey as keyof M] !== undefined) {
                    const value = newObj[sourceKey as keyof M];
                    if (typeof targetKeyInfo === 'string') {
                        newObj[targetKeyInfo as keyof M] = value;
                    } else if (typeof targetKeyInfo === 'object' && targetKeyInfo.key) {
                        const rawValue: unknown = targetKeyInfo.type === 'number' ? Number(value) : String(value);

                        if (typeof rawValue === 'string' || typeof rawValue === 'number') {
                            newObj[targetKeyInfo.key as keyof M] = rawValue as M[keyof M];
                        }
                    }
                    delete newObj[sourceKey as keyof M];
                }
            }
        });
    }

    return removeFalsyValues(newObj) as Partial<M>;
}

export function base64ToFile(base64String: string, fileName: string): File {
    const [header, base64Content] = base64String.split(',');

    const mimeTypeMatch = header.match(/:(.*?);/);
    if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
        throw new Error('Invalid base64 string');
    }
    const mimeType = mimeTypeMatch[1];

    const binaryString = atob(base64Content);

    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
    }

    return new File([byteArray], fileName, { type: mimeType });
}

export function showAddress(address: IAddress): string {
    const { address_line, ward, district, city, postal_code, state, country, region } = address;

    let fullAddress = '';

    if (address_line) fullAddress += `${address_line}, `;
    if (ward) fullAddress += `${ward}, `;
    if (district) fullAddress += `${district}, `;
    if (city) fullAddress += `${city}, `;
    if (state) fullAddress += `${state}, `;
    if (postal_code) fullAddress += `${postal_code}, `;
    if (country && country.country_name) fullAddress += `${country.country_name}`;

    if (region) fullAddress += `, ${region}`;

    return fullAddress.replace(/, $/, '');
}

export function buildColorWithPermission(permission: IPermission) {
    switch (permission.permission_code) {
        case 'read': {
            return 'green' as DefaultMantineColor;
        }
        case 'create': {
            return 'cyan' as DefaultMantineColor;
        }
        case 'update': {
            return 'yellow' as DefaultMantineColor;
        }
        case 'delete': {
            return 'red' as DefaultMantineColor;
        }
    }
}

export function buildColorWithMethod(permission: IResource) {
    switch (permission.resource_method) {
        case 'GET': {
            return 'green' as DefaultMantineColor;
        }
        case 'POST': {
            return 'cyan' as DefaultMantineColor;
        }
        case 'PATCH':
        case 'PUT': {
            return 'yellow' as DefaultMantineColor;
        }
        case 'DELETE': {
            return 'red' as DefaultMantineColor;
        }
    }
}

export function toSnakeCase(input: string): string {
    return input.trim().toLowerCase().replace(/\s+/g, '_');
}
