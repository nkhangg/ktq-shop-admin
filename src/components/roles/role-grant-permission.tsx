import { ApiPermissions } from '@/api';
import { Api, ApiError } from '@/api/api';
import { container } from '@/di/container';
import { usePermissionSelectData } from '@/hooks/permissions';
import { addComfirm } from '@/store/slices/comfirm-slice';
import { IPermission, IRole } from '@/types';
import { buildColorWithPermission } from '@/utils/app';
import { Box, Button, ComboboxItem, Modal, Select, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

export interface IRoleGrantPermissionProps {
    role_id: IRole['id'];
    close: () => void;
    opened: boolean;
    open: () => void;
}

export default function RoleGrantPermission({ role_id, close, opened, open }: IRoleGrantPermissionProps) {
    const permissionApi = container.get(ApiPermissions);

    const [permissionValue, setPermissionValue] = useState<string | null>(null);

    const { permissionsDataSelect } = usePermissionSelectData();

    const dispatch = useDispatch();

    const { data, refetch } = useQuery({
        queryKey: ['permissions/roles[GET]', role_id],
        queryFn: () => permissionApi.getByRole(role_id),
    });

    const permissionsSelect = useMemo(() => {
        if (!data?.data) return [];

        return permissionsDataSelect.filter((permission) => {
            return !(data.data || []).find((item) => item.id === Number((permission as ComboboxItem).value));
        });
    }, [data]);

    const handleClose = () => {
        close();
        setPermissionValue(null);
    };

    const addPermissionMutation = useMutation({
        mutationFn: (permission_id: IPermission['id']) => permissionApi.addPermissionForRole(role_id, permission_id),
        mutationKey: ['permission/roles[POST]'],
        onSuccess(data) {
            Api.handle_response(data);
            refetch();
            setPermissionValue(null);
        },
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
    });

    const deletePermissionMutation = useMutation({
        mutationFn: (permission_id: IPermission['id']) => permissionApi.removePermissionForRole(role_id, permission_id),
        mutationKey: ['permission/roles[DELETE]'],
        onSuccess(data) {
            Api.handle_response(data);
            refetch();
            setPermissionValue(null);
        },
        onError: (error) => {
            Api.response_form_error(error as ApiError);
        },
    });

    return (
        <Modal opened={opened} onClose={handleClose} title={`Permission of this role`} centered>
            <Box className="flex items-center gap-3 mb-5">
                {data?.data
                    ? data.data.map((item) => {
                          return (
                              <Tooltip key={item.id} label={'Click to remove this permission'}>
                                  <Button
                                      onClick={() => {
                                          dispatch(
                                              addComfirm({
                                                  callback: () => {
                                                      deletePermissionMutation.mutate(item.id);
                                                  },
                                                  title: 'Delete this permission',
                                                  acceptLabel: 'Delete',
                                                  buttonProps: {
                                                      color: 'red',
                                                  },
                                              }),
                                          );
                                      }}
                                      className="capitalize"
                                      color={buildColorWithPermission(item)}
                                  >
                                      {item.permission_code}
                                  </Button>
                              </Tooltip>
                          );
                      })
                    : 'This role has not been authorized yet'}
            </Box>

            {permissionsSelect?.length ? (
                <Select
                    value={permissionValue}
                    onChange={(e) => {
                        setPermissionValue(e);

                        dispatch(
                            addComfirm({
                                callback: () => {
                                    addPermissionMutation.mutate(Number(e));
                                },
                                title: 'Add this permission for role',
                                acceptLabel: 'Sure',
                                buttonProps: {
                                    color: 'blue',
                                },
                            }),
                        );
                    }}
                    data={permissionsSelect}
                    label={'Permissions'}
                />
            ) : (
                ''
            )}
        </Modal>
    );
}
