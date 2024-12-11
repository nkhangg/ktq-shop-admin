import { ICustomerView } from '@/api/customers';
import { create } from 'zustand';

interface CustomerStore {
    data: ICustomerView | null;
    setData: (newData: ICustomerView | null) => void;
}

const useCustomerStore = create<CustomerStore>((set) => ({
    data: null,
    setData: (newData) => set({ data: newData }),
}));

export default useCustomerStore;
