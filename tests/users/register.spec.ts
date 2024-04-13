import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import { isJWT } from '../utils';
import { RefreshToken } from '../../src/entity/RefreshToken';
describe('POST /auth/register', () => {
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
        it('should return the 201 status code', async () => {
            //* We can follow a formula for writing any test that is AAA
            //* Arrange -> Act -> Assert
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: 'lovishduggal11@gmail.com',
                password: 'password',
            };
            //* Act:
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //* Assert:
            expect(response.statusCode).toBe(201);
        });

        it('should return valid json response', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: 'lovishduggal11@gmail.com',
                password: 'password',
            };
            //* Act:
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //* Assert:
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });

        it('should persist the user in the database', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: 'lovishduggal11@gmail.com',
                password: 'password',
            };
            //* Act:
            await request(app).post('/auth/register').send(userData);

            //* Assert:
            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();
            expect(user).toHaveLength(1);
            expect(user[0].firstName).toBe(userData.firstName);
            expect(user[0].lastName).toBe(userData.lastName);
            expect(user[0].email).toBe(userData.email);
        });

        it('should return an id of the created user', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: 'lovishduggal11@gmail.com',
                password: 'password',
            };
            //* Act:
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //* Assert:
            expect(response.body).toHaveProperty('id');
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            );
        });

        it('should assign a customer role', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: 'lovishduggal11@gmail.com',
                password: 'password',
            };
            //* Act:
            await request(app).post('/auth/register').send(userData);
            //* Assert:
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it('should store the hashed password in the database', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: 'lovishduggal11@gmail.com',
                password: 'password',
            };
            //* Act:
            await request(app).post('/auth/register').send(userData);
            //* Assert:
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it('should return 400 status code if email is already exits', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: 'lovishduggal11@gmail.com',
                password: 'password',
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.CUSTOMER });
            //* Act:
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const users = await userRepository.find();
            //* Assert:
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });

        it('should return the access token and refresh token inside a cookie', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: 'lovishduggal121@gmail.com',
                password: 'password',
            };
            //* Act:
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //* Assert:
            let accessToken = null;
            let refreshToken = null;
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

        it('should store the refresh token in the database', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: 'lovishduggal121@gmail.com',
                password: 'password',
            };
            //* Act:
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //* Assert:
            const refreshTokenRepo = connection.getRepository(RefreshToken);

            const tokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);
        });
    });
    describe('Fields are missing', () => {
        it('should return 400 status code if email field is missing', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: '',
                password: 'password',
            };
            //* Act:
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //* Assert:
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if firstName field is missing', async () => {
            //* Arrange:
            const userData = {
                firstName: '',
                lastName: 'Duggal',
                email: 'lovishduggal11@gmail.com',
                password: 'password',
            };
            //* Act:
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //* Assert:
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if lastName field is missing', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: '',
                email: 'lovishduggal11@gmail.com',
                password: 'password',
            };
            //* Act:
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //* Assert:
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if password field is missing', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: 'lovishduggal11@gmail.com',
                password: '',
            };
            //* Act:
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //* Assert:
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it('should return 400 status code if password length is less than 8 characters', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: 'lovishduggal11@gmail.com',
                password: '1234567',
            };
            //* Act:
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //* Assert:
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });
    describe('Fields are not in proper format', () => {
        it('should trim the email field', async () => {
            //* Arrange:
            const userData = {
                firstName: 'Lovish',
                lastName: 'Duggal',
                email: ' lovishduggal11@gmail.com ',
                password: 'password',
            };
            //* Act:
            await request(app).post('/auth/register').send(userData);
            //* Assert:
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe('lovishduggal11@gmail.com');
        });
    });
});
