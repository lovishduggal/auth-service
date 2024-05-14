import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { ensureAdminUser } from '../../src/utils';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import { Config } from '../../src/config';

describe('Admin creation', () => {
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
        it('should create the admin', async () => {
            await ensureAdminUser();

            const userRepository = connection.getRepository(User);
            const adminExists = await userRepository.find();

            expect(adminExists).toHaveLength(1);
            expect(adminExists[0].role).toBe(Roles.ADMIN);
            expect(adminExists[0].email).toBe(Config.ADMIN_EMAIL);
        });
    });
});
