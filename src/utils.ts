import bcrypt from 'bcryptjs';
import { Config } from './config';
import { AppDataSource } from './config/data-source';
import { User } from './entity/User';
import logger from './config/logger';
import { Roles } from './constants';

export async function ensureAdminUser() {
    const adminEmail = Config.ADMIN_EMAIL;
    const adminPassword = await bcrypt.hash(Config.ADMIN_PASSWORD!, 10);

    const userRepository = AppDataSource.getRepository(User);
    const adminExists = await userRepository.findOneBy({
        email: adminEmail,
    });
    if (!adminExists) {
        const adminUser = {
            firstName: Config.FIRST_NAME,
            lastName: Config.LAST_NAME,
            email: adminEmail,
            password: adminPassword,
            role: Roles.ADMIN,
        };
        await userRepository.save(adminUser);
        logger.info('Admin user created successfully');
    } else {
        logger.info('Admin user already exists');
    }
}
