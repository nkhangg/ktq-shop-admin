import { IColumn, IDataFilter, ITableFilter, ITableShort, TShort } from '../type';

export const defaultPrefixShort = 'order_by_';
export const defaultPathToData = 'data';
export const flowShort: TShort[] = ['desc', 'asc'];
export const defaultKeyPerpage = 'per_page';
export const defaultKeyPage = 'page';
export const searchKey = 'search_key';

export const defaultStyleHightlight = { color: 'red', backgroundColor: 'yellow' } as React.CSSProperties;

export const defaultPerpageValue = '10';

export const getParamsData = <R extends Record<string, string | number>>(options: { prefixShort?: string; columns: IColumn<R>[] }) => {
    const paramsUrl = new URLSearchParams(window.location.search);

    if (!paramsUrl.size) return {};

    const prefixShort = options?.prefixShort || defaultPrefixShort;

    const paramObject: { [key: string]: string | number } = {};
    paramsUrl.forEach((value, key) => {
        paramObject[key] = value;
    });

    const pramsKeys = Object.keys(paramObject);

    if (pramsKeys.length <= 0)
        return {
            shortParamsData: {},
            searchParamsData: {},
            filterParamsData: [],
            params: {},
        };

    const shortParamsData = pramsKeys
        .filter((item) => item.includes(prefixShort) && options.columns.map((col) => col.key).includes(item.replace(prefixShort, '') as IColumn<R>['key']))
        .map((i) => {
            return { key: i.replace(prefixShort, ''), type: flowShort.includes(paramObject[i] as TShort) ? paramObject[i] : 'asc' } as ITableShort<R>;
        });

    const filterParamsData = pramsKeys
        // .filter((item) => options.columns.map((col) => col.key).includes(item as IColumn<R>['key']))
        .map((item) => ({ key: item, type: paramObject[item] } as ITableFilter<R>));

    const shortObject = shortParamsData[0] ? { [`${prefixShort}${shortParamsData[0].key}`]: String(shortParamsData[0].type) } : {};

    const pramsData: IDataFilter[] = [...(filterParamsData ? (filterParamsData as IDataFilter[]) : [])];

    let params = convertToParams(pramsData as unknown as Record<string, string | number>[]);

    if (shortParamsData.length) {
        params = {
            ...params,
            ...shortObject,
        };
    }
    return { shortParamsData: shortParamsData[0] || {}, filterParamsData, params };
};

export const convertToParams = (filter: Record<string, string | number>[]) => {
    const params = filter.reduce((prev, cur) => {
        prev[cur.key] = cur.type;

        return prev;
    }, {} as Record<string, string | number>);

    return params;
};

export const removeFalsy = (data: { [key: string]: string | number }) => {
    return Object.keys(data).reduce((prev, cur) => {
        if (data[cur]) {
            prev[cur] = data[cur];
        }
        return prev;
    }, {} as { [key: string]: string | number });
};
