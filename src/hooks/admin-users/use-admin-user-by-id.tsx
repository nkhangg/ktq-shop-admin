import { ApiAdminUsers } from '@/api';
import { container } from '@/di/container';
import { IAdminUser } from '@/types';
import { useQuery } from '@tanstack/react-query';

export default function useAdminUserById(id: IAdminUser['id']) {
    const adminUsersApi = container.get(ApiAdminUsers);

    const query = useQuery({
        queryKey: ['admin-users/[id]/[GET]', id],
        queryFn: () => adminUsersApi.getById(id),
    });

    return query;
}
