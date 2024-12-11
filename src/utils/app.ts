import { IAddress } from '@/types';
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

export function cleanObject(obj: Record<string, any>) {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([_, value]) => value)
            .map(([key, value]) => [key, value === 'none' ? null : value]),
    );
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
