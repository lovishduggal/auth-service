import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { truncateTables } from '../utils';
import { User } from '../../src/entity/User';
describe('POST /auth/register', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        //* Clear the database before each test
        await truncateTables(connection);
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
    });
    describe('Fields are missing', () => {});
});
