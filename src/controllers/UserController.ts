import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserRequest } from '../types';
import { Roles } from '../constants';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { Logger } from 'winston';

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()));
        }

        const { firstName, lastName, email, password } = req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.MANAGER,
            });
            res.status(201).json({ id: user.id });
        } catch (err) {
            return next(err);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getAll();
            this.logger.info('All users have been fetched');
            return res.status(200).json(users);
        } catch (err) {
            return next(err);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        try {
            const user = await this.userService.findById(Number(userId));
            this.logger.info('User have been fetched');
            return res.status(200).json(user);
        } catch (err) {
            return next(err);
        }
    }
}
