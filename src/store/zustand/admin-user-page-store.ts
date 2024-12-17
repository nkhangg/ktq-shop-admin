import { IAdminUser, TComfirmPassword } from '@/types';
import { create } from 'zustand';

interface AdminUserStore {
    useTimePassword: { use_time: boolean };
    data: IAdminUser | null;
    callback: null | ((data: TComfirmPassword) => void | Promise<void>);
    setData: (data: IAdminUser | null) => void;
    setUseTimePassword: (data: { use_time: boolean }) => void;
    setCallback: (callback: null | ((data: TComfirmPassword) => void)) => void;
}

const useAdminUserStore = create<AdminUserStore>((set) => ({
    data: null,
    useTimePassword: { use_time: false },
    callback: null,
    setData: (data) => set({ data }),
    setUseTimePassword: (useTimePassword) => set({ useTimePassword }),
    setCallback: (callback) => set({ callback: callback }),
}));

export default useAdminUserStore;
