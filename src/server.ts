import app from './app';
import bcrypt from 'bcryptjs';
import { Config } from './config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';
import { User } from './entity/User';
import { Roles } from './constants';

async function ensureAdminUser() {
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

const startServer = async () => {
    const PORT = Config.PORT;

    try {
        await AppDataSource.initialize();
        logger.info('Database connected successfully');
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });

        ensureAdminUser().catch((err: unknown) => {
            if (err instanceof Error) {
                logger.error(err.message);
                setTimeout(() => process.exit(1), 1000);
            }
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            setTimeout(() => process.exit(1), 1000);
        }
    }
};

void startServer();
