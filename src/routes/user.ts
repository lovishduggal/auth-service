import { UserService } from './../services/UserService';
import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import { AppDataSource } from '../config/data-source';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../constants';
import { UserController } from '../controllers/UserController';
import { User } from '../entity/User';
import createUserValidator from '../validators/create-user-validator';
import logger from '../config/logger';
import { UpdateUserRequest } from '../types';
import listUsersValidator from '../validators/list-users-validator';
import updateUserValidator from '../validators/update-user-validator';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);
router.post(
    '/',
    [authenticate, canAccess([Roles.ADMIN])],
    createUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next) as unknown as RequestHandler,
);

router.get(
    '/',
    [authenticate, canAccess([Roles.ADMIN])],
    listUsersValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next) as unknown as RequestHandler,
);

router.get(
    '/:id',
    [authenticate, canAccess([Roles.ADMIN])],
    (req: Request, res: Response, next: NextFunction) =>
        userController.getOne(req, res, next) as unknown as RequestHandler,
);

router.patch(
    '/:id',
    [authenticate, canAccess([Roles.ADMIN])],
    updateUserValidator,
    (req: UpdateUserRequest, res: Response, next: NextFunction) =>
        userController.update(req, res, next) as unknown as RequestHandler,
);

router.delete(
    '/:id',
    [authenticate, canAccess([Roles.ADMIN])],
    (req: Request, res: Response, next: NextFunction) =>
        userController.destroy(req, res, next) as unknown as RequestHandler,
);
export default router;
