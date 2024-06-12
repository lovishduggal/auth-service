import { Brackets, Repository } from 'typeorm';
import { User } from '../entity/User';
import { LimitedUserData, UserData, UserQueryParams } from '../types';
import createHttpError from 'http-errors';
import bcrypt from 'bcryptjs';

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
        const user = await this.userRepository.findOne({
            where: { email: email },
        });
        if (user) {
            const err = createHttpError(400, 'Email already exists');
            throw err;
        }

        //* Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role,
                tenant: tenantId ? { id: Number(tenantId) } : undefined,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store data in the database',
            );
            throw error;
        }
    }

    async findByEmail(email: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            select: [
                'id',
                'firstName',
                'lastName',
                'email',
                'role',
                'password',
            ],
        });
        return user;
    }

    async findById(id: number) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: {
                tenant: true,
            },
        });
        return user;
    }

    async getAll(validatedQuery: UserQueryParams) {
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        const searchTerm = validatedQuery.q;
        const role = validatedQuery.role;

        if (searchTerm) {
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "CONCAT(user.firstName, ' ', user.lastName) ILIKE :q",
                        { q: `%${searchTerm}%` },
                    ).orWhere('user.email ILIKE :q', {
                        q: `%${searchTerm}%`,
                    });
                }),
            );
        }

        if (role) {
            queryBuilder.andWhere('user.role= :role', { role: role });
        }

        const result = await queryBuilder
            .leftJoinAndSelect('user.tenant', 'tenant')
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy('user.id', 'DESC')
            .getManyAndCount();
        return result;
    }

    async update(
        userId: number,
        { firstName, lastName, role, tenantId }: LimitedUserData,
    ) {
        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
                tenant: tenantId ? { id: Number(tenantId) } : undefined,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to update the user in the database',
            );
            throw error;
        }
    }

    async deleteById(userId: number) {
        return await this.userRepository.delete(userId);
    }
}
