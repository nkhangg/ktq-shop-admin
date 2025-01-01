import { upperFirst } from '@mantine/hooks';
import moment from 'moment';
import { isNumber } from './fn';
import { TInput } from '../type';

export default {
    email: <R extends Record<string, string | number>>(input: TInput<R>, value?: string) => {
        const { required = true, messages = {} } = input?.validate?.options || {};
        const defaultMessages = {
            required: 'Email is required',
            invalid: 'Invalid email format',
            ...messages,
        };

        // Bỏ qua kiểm tra nếu không bắt buộc và không có giá trị
        if (!required && (value === undefined || value === '')) return null;
        // Báo lỗi nếu bắt buộc mà không có giá trị
        if (required && (value === undefined || (typeof value === 'string' && value.trim() === ''))) return defaultMessages.required;
        // Kiểm tra định dạng email
        return /^\S+@\S+$/.test(value ?? '') ? null : defaultMessages.invalid;
    },

    text: <R extends Record<string, string | number>>(input: TInput<R>, value?: string) => {
        const { required = true, min, max, messages = {} } = input?.validate?.options || {};
        const defaultMessages = {
            required: `${input.title ? input.title : upperFirst(input.key)} is required`,
            min: `${input.title ? input.title : upperFirst(input.key)} is too short (minimum ${min} characters)`,
            max: `${input.title ? input.title : upperFirst(input.key)} is too long (maximum ${max} characters)`,
            ...messages,
        };

        // Bỏ qua kiểm tra nếu không bắt buộc và không có giá trị
        if (!required && (value === undefined || value === '')) return null;
        // Báo lỗi nếu bắt buộc mà không có giá trị
        if (required && (value === undefined || (typeof value === 'string' && value.trim() === ''))) return defaultMessages.required;

        const length = typeof value === 'string' ? value.trim().length : 0;

        if (!isNumber(min) || !isNumber(max)) return defaultMessages.invalid;

        if (min && length < (min as number)) return defaultMessages.min;
        if (max && length > (max as number)) return defaultMessages.max;
        return null;
    },

    number: <R extends Record<string, string | number>>(input: TInput<R>, value?: string) => {
        const { required = true, min, max, messages = {} } = input?.validate?.options || {};
        const defaultMessages = {
            required: `${input.title || input.key} is required`,
            invalid: `Invalid number format`,
            min: `${input.title || input.key} is too small (minimum ${min})`,
            max: `${input.title || input.key} is too large (maximum ${max})`,
            ...messages,
        };

        if (!required && (value === undefined || value === '')) return null;
        if (required && (value === undefined || (typeof value === 'string' && value.trim() === ''))) return defaultMessages.required;

        const numValue = Number(value ?? '');
        if (isNaN(numValue)) return defaultMessages.invalid;
        if (!isNumber(min) || !isNumber(max)) return defaultMessages.invalid;

        if (min && numValue < (min as number)) return defaultMessages.min;
        if (max && numValue > (max as number)) return defaultMessages.max;
        return null;
    },

    phone: <R extends Record<string, string | number>>(input: TInput<R>, value?: string) => {
        const { required = true, min, max, messages = {} } = input?.validate?.options || {};
        const defaultMessages = {
            required: 'Phone number is required',
            invalid: 'Invalid phone number format',
            min: `Phone number is too short (minimum ${min} digits)`,
            max: `Phone number is too long (maximum ${max} digits)`,
            ...messages,
        };

        if (!required && (value === undefined || value === '')) return null;
        if (required && (value === undefined || (typeof value === 'string' && value.trim() === ''))) return defaultMessages.required;

        const length = typeof value === 'string' ? value.replace(/\D/g, '').length : 0;

        if (min && length < (min as number)) return defaultMessages.min;
        if (max && length > (max as number)) return defaultMessages.max;
        return /^\+?\d{10,15}$/.test(value ?? '') ? null : defaultMessages.invalid;
    },
    json: <R extends Record<string, string | number>>(input: TInput<R>, value?: string) => {
        const { required = true, messages = {} } = input?.validate?.options || {};
        const defaultMessages = {
            required: `${input.title || input.key} is required`,
            invalid: 'Invalid JSON format',
            ...messages,
        };

        if (!required && (value === undefined || value === '')) return null;

        if (required && (value === undefined || (typeof value === 'string' && value.trim() === ''))) {
            return defaultMessages.required;
        }

        try {
            JSON.parse(value ?? '');
            return null;
        } catch (e) {
            return defaultMessages.invalid;
        }
    },
    url: <R extends Record<string, string | number>>(input: TInput<R>, value?: string) => {
        const { required = true, messages = {} } = input?.validate?.options || {};
        const defaultMessages = {
            required: 'URL is required',
            invalid: 'Invalid URL format',
            ...messages,
        };

        // Bỏ qua kiểm tra nếu không bắt buộc và không có giá trị
        if (!required && (value === undefined || value === '')) return null;
        // Báo lỗi nếu bắt buộc mà không có giá trị
        if (required && (value === undefined || (typeof value === 'string' && value.trim() === ''))) return defaultMessages.required;
        return /^(https?:\/\/)?([a-zA-Z0-9.-]+)?(\.[a-zA-Z]{2,})(:[0-9]{1,5})?(\/.*)?$/.test(value ?? '') ? null : defaultMessages.invalid;
    },
    date: <R extends Record<string, string | number>>(input: TInput<R>, value?: string) => {
        const { required = true, min, max, dateFormat = 'YYYY-MM-DD', messages = {} } = input?.validate?.options || {};
        const defaultMessages = {
            required: 'Date is required',
            invalid: `Invalid date format (expected ${dateFormat})`,
            min: `Date should not be earlier than ${min}`,
            max: `Date should not be later than ${max}`,
            ...messages,
        };

        if (!required && (value === undefined || value === '')) return null;
        if (required && (value === undefined || (typeof value === 'string' && value.trim() === ''))) return defaultMessages.required;

        try {
            // Parse và kiểm tra giá trị với định dạng người dùng truyền
            const parsedDate = moment(value, dateFormat, true); // true để kiểm tra strict format

            // Nếu không thể parse được, báo lỗi
            if (!parsedDate.isValid()) {
                console.error(`Error: Invalid date value "${value}" with format "${dateFormat}"`);
                return defaultMessages.invalid;
            }

            // Kiểm tra min/max
            if (min && moment(min).isAfter(parsedDate)) return defaultMessages.min;
            if (max && moment(max).isBefore(parsedDate)) return defaultMessages.max;

            return null;
        } catch (error) {
            console.error(`Error parsing date with format "${dateFormat}":`, error);
            return defaultMessages.invalid;
        }
    },

    datetime: <R extends Record<string, string | number>>(input: TInput<R>, value?: string) => {
        const { required = true, min, max, dateFormat = 'YYYY-MM-DDTHH:mm:ss', messages = {} } = input?.validate?.options || {};
        const defaultMessages = {
            required: 'Datetime is required',
            invalid: `Invalid datetime format (expected ${dateFormat})`,
            min: `Datetime should not be earlier than ${min}`,
            max: `Datetime should not be later than ${max}`,
            ...messages,
        };

        if (!required && (value === undefined || value === '')) return null;
        if (required && (value === undefined || (typeof value === 'string' && value.trim() === ''))) return defaultMessages.required;

        try {
            // Parse và kiểm tra giá trị với định dạng datetime
            const parsedDatetime = moment(value, dateFormat, true); // true để strict

            // Nếu không parse được, báo lỗi
            if (!parsedDatetime.isValid()) {
                console.error(`Error: Invalid datetime value "${value}" with format "${dateFormat}"`);
                return defaultMessages.invalid;
            }

            // Kiểm tra min/max
            if (min && moment(min).isAfter(parsedDatetime)) return defaultMessages.min;
            if (max && moment(max).isBefore(parsedDatetime)) return defaultMessages.max;

            return null;
        } catch (error) {
            console.error(`Error parsing datetime with format "${dateFormat}":`, error);
            return defaultMessages.invalid;
        }
    },
};
