import Cookies from 'js-cookie';

export const TOKEN_KEY = 'token';
export const REFRESH_KEY = 'refresh_token';

export const setAccessToken = (token: string) => {
    Cookies.set(TOKEN_KEY, token, { expires: 1 / 24 });
};

export const setRefreshToken = (refresh_token: string) => {
    Cookies.set(REFRESH_KEY, refresh_token, { expires: 1 });
};

// Lấy token từ cookie
export const getAccessToken = () => Cookies.get(TOKEN_KEY);
export const getRefreshToken = () => Cookies.get(REFRESH_KEY);

export const clearAllToken = () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_KEY);
};
