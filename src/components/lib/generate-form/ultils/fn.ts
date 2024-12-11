import classNames from 'classnames';
import clsx from 'clsx';
import constants from './constants';
import { ILayoutFormItem } from '../type';

export const tsw = (...args: classNames.ArgumentArray) => {
    return clsx(classNames(args));
};

export function isNumber(value: any): boolean {
    return !Number.isNaN(value);
}

export const renderClassReponsive = (layout?: Record<string, ILayoutFormItem>) => {
    // Nếu không có layout hoặc layout trống, trả về class mặc định
    if (!layout || Object.keys(layout).length <= 0) {
        return `grid grid-cols-${constants.col} gap-[${constants.gap}px]`;
    }

    // Hàm xử lý cho từng breakpoint
    const appendClass = (breakpoint: string, item: ILayoutFormItem, prefix = true) => {
        const cols = item?.col ?? constants.col; // Nếu không có col, dùng giá trị mặc định
        const gap = item?.gap ?? constants.gap; // Nếu không có gap, dùng giá trị mặc định

        // if (typeof gap === 'string' && gap.includes('px') && item?.gap) {
        //     gap = `[${gap}]`;
        // }

        if (!prefix) {
            return `grid-cols-${cols} gap-${gap}`;
        }

        return `${breakpoint}:grid-cols-${cols} ${breakpoint}:gap-${gap}`;
    };

    // Duyệt qua tất cả các key trong layout và áp dụng class tương ứng

    const keys = Object.keys(layout);

    const responsiveClasses = keys.map((breakpoint) => {
        if (breakpoint === keys[keys.length - 1]) {
            const item = layout[breakpoint];
            return appendClass(breakpoint, item, false);
        }

        const item = layout[breakpoint];
        return appendClass(breakpoint, item);
    });

    // Nối các class lại với nhau, loại bỏ giá trị falsy và trả về chuỗi class hợp lệ
    return ['grid', ...responsiveClasses].filter(Boolean).join(' ').trim();
};
