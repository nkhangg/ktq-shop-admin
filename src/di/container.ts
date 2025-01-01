// container.ts
'use client';
import {
    ApiAddresses,
    ApiAdminUsers,
    ApiAuthentication,
    ApiBlackList,
    ApiCacheService,
    ApiConfigs,
    ApiCustomerGroup,
    ApiCustomers,
    ApiLocations,
    ApiPermissions,
    ApiResources,
    ApiRoles,
    ApiSessions,
} from '@/api';
import ApiResourcePermissions from '@/api/resource-permissions';
import { Container } from 'inversify';

const container = new Container();

container.bind(ApiAuthentication).toSelf();
container.bind(ApiCustomers).toSelf();
container.bind(ApiBlackList).toSelf();
container.bind(ApiSessions).toSelf();
container.bind(ApiLocations).toSelf();
container.bind(ApiCustomerGroup).toSelf();
container.bind(ApiAdminUsers).toSelf();
container.bind(ApiAddresses).toSelf();
container.bind(ApiRoles).toSelf();
container.bind(ApiResources).toSelf();
container.bind(ApiPermissions).toSelf();
container.bind(ApiResourcePermissions).toSelf();
container.bind(ApiCacheService).toSelf();
container.bind(ApiConfigs).toSelf();

export { container };
