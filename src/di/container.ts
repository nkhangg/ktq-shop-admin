// container.ts
'use client';
import {
    ApiAuthentication,
    ApiBlackList,
    ApiCustomerGroup,
    ApiCustomers,
    ApiLocations,
    ApiRoles,
    ApiSessions,
    ApiAdminUsers,
    ApiResources,
    ApiPermissions,
    ApiCacheService,
} from '@/api';
import ApiAddress from '@/api/addresses';
import ApiResourcePermissions from '@/api/resource-permissions';
import { ExpiredUseTimePasswordSSE } from '@/api/sse';
import { Container } from 'inversify';

const container = new Container();

container.bind(ApiAuthentication).toSelf();
container.bind(ApiCustomers).toSelf();
container.bind(ApiBlackList).toSelf();
container.bind(ApiSessions).toSelf();
container.bind(ApiLocations).toSelf();
container.bind(ApiCustomerGroup).toSelf();
container.bind(ApiAdminUsers).toSelf();
container.bind(ApiAddress).toSelf();
container.bind(ApiRoles).toSelf();
container.bind(ApiResources).toSelf();
container.bind(ApiPermissions).toSelf();
container.bind(ApiResourcePermissions).toSelf();
container.bind(ApiCacheService).toSelf();

export { container };
