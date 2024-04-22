import bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import request from 'supertest';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';

describe('POST /auth/login', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        //* Clear the database before each test
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });
    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should logout the user', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: 'lovishduggal121@gmail.com',
                password: 'password',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            const user = await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            const accessToken = jwks.token({
                sub: String(user.id),
                role: user.role,
            });

            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });

            let refreshToken = null;
            const cookies =
                (response.headers['set-cookie'] as unknown as string[]) || [];
            cookies.forEach((cookie) => {
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });

            //* Act:
            const logoutResponse = await request(app)
                .post('/auth/logout')
                .set(
                    'Cookie',
                    `accessToken=${accessToken}; refreshToken=${refreshToken}`,
                )
                .send();

            let accessTokenLogoutResponse = null;
            let refreshTokenLogoutResponse = null;
            const logoutResponseCookies =
                (logoutResponse.headers['set-cookie'] as unknown as string[]) ||
                [];
            logoutResponseCookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessTokenLogoutResponse = cookie
                        .split(';')[0]
                        .split('=')[1];
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshTokenLogoutResponse = cookie
                        .split(';')[0]
                        .split('=')[1];
                }
            });

            //*Assert:
            expect(logoutResponse.statusCode).toBe(200);
            expect(accessTokenLogoutResponse).toBe('');
            expect(refreshTokenLogoutResponse).toBe('');
        });
    });
});
