import bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import request from 'supertest';
import app from '../../src/app';
import { isJWT } from '../utils/index';

describe('POST /auth/refresh', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        //* Clear the database before each test
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });
    describe('Given all fields', () => {
        it('should return access token if refresh token is valid', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: 'lovishduggal121@gmail.com',
                password: 'password',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            //* Simulate login to get refresh token
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });

            let refreshToken = null;
            const cookiesOfLoginResponse =
                (loginResponse.headers['set-cookie'] as unknown as string[]) ||
                [];

            cookiesOfLoginResponse.forEach((cookie) => {
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });

            //* Act:
            const response = await request(app)
                .get('/auth/refresh')
                .set('Cookie', `refreshToken=${refreshToken}`);

            let accessToken = null;
            const cookies =
                (response.headers['set-cookie'] as unknown as string[]) || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }
            });

            //* Assert:
            expect(response.statusCode).toBe(200);
            expect(accessToken).not.toBeNull();
            expect(isJWT(accessToken)).toBeTruthy();
        });
    });
});
