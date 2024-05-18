import bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import request from 'supertest';
import app from '../../src/app';
import { isJWT } from '../utils/index';

describe('POST /api/auth/login', () => {
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
        it('should login the user', async () => {
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
            //* Act:
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: userData.email, password: userData.password });

            let accessToken: null | string = null;
            let refreshToken: null | string = null;
            const cookies =
                (response.headers['set-cookie'] as unknown as string[]) || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJWT(accessToken)).toBeTruthy();
            expect(isJWT(refreshToken)).toBeTruthy();
        });

        it('should return the 400 if email or password is wrong', async () => {
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
            //* Act:
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: userData.email, password: 'wrongPassword' });

            expect(response.statusCode).toBe(400);
        });
    });
});
