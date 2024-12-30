import { IAdminUser, IPermission, TComfirmPassword } from '@/types';
import { create } from 'zustand';

interface AdminUserRoleStore {
    isOpen: boolean;
    refreshFns: (() => void)[];
    setOpen: (open: boolean) => void;
    setRefreshFns: (fn: () => void) => void;
    callback: null | ((data: IPermission['id'][]) => void | Promise<void>);
    setCallback: (callback: null | ((data: IPermission['id'][]) => void | Promise<void>)) => void;
}

const useAdminUserRoleStore = create<AdminUserRoleStore>((set, get) => ({
    isOpen: false,
    callback: null,
    refreshFns: [],
    setOpen: (open) => set({ isOpen: open }),
    setRefreshFns: (fn) => set({ refreshFns: [...get().refreshFns, fn] }),
    setCallback: (callback) => set({ callback, isOpen: true }),
}));

export default useAdminUserRoleStore;
