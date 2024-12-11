// container.ts
'use client';
import { ApiAuthentication, ApiBlackList, ApiCustomerGroup, ApiCustomers, ApiLocations, ApiRoles, ApiSessions, ApiUsers } from '@/api';
import ApiAddress from '@/api/addresses';
import { Container } from 'inversify';

const container = new Container();

container.bind(ApiAuthentication).toSelf();
container.bind(ApiCustomers).toSelf();
container.bind(ApiBlackList).toSelf();
container.bind(ApiSessions).toSelf();
container.bind(ApiLocations).toSelf();
container.bind(ApiCustomerGroup).toSelf();
container.bind(ApiUsers).toSelf();
container.bind(ApiAddress).toSelf();
container.bind(ApiRoles).toSelf();

export { container };
