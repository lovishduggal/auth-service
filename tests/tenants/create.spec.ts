import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import request from 'supertest';
import { Tenant } from '../../src/entity/Tenant';
import createJWKSMock from 'mock-jwks';
import { Roles } from '../../src/constants';
describe('POST /tenants', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        //* Clear the database before each test
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
        adminToken = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        });
    });

    afterEach(() => {
        jwks.stop();
    });
    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should return a 201 status code', async () => {
            const tenantData = {
                name: 'tenat name',
                address: 'tenant address',
            };

            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            expect(response.status).toBe(201);
        });

        it('should create a tenant in the database', async () => {
            const tenantData = {
                name: 'tenant name',
                address: 'tenant address',
            };

            await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(tenantData);

            const tenant = (await connection
                .getRepository(Tenant)
                .findOneBy({ name: tenantData.name })) as unknown as Record<
                string,
                string
            >;

            expect(tenant).not.toBeNull();
            expect(tenant?.name).toBe(tenantData.name);
            expect(tenant?.address).toBe(tenantData.address);
        });

        it('should return 401 is user is not authenticated', async () => {
            const tenantData = {
                name: 'tenat name',
                address: 'tenant address',
            };

            const response = await request(app)
                .post('/tenants')
                .send(tenantData);

            const tenant = (await connection
                .getRepository(Tenant)
                .findOneBy({ name: tenantData.name })) as unknown as Record<
                string,
                string
            >;
            expect(response.status).toBe(401);
            expect(tenant).toBeNull();
        });
    });
});
