import { toast as react_toast, ToastContent, ToastOptions } from 'react-toastify';

export function toast_error(content: ToastContent<unknown>, options?: ToastOptions<unknown> | undefined) {
    const customOption: ToastOptions<unknown> = options || {};
    return react_toast.error(content, customOption);
}

export function toast_success(content: ToastContent<unknown>, options?: ToastOptions<unknown> | undefined) {
    const customOption: ToastOptions<unknown> = options || {};
    return react_toast.success(content, customOption);
}
