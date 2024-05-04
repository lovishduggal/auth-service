import express, { NextFunction, Request, Response } from 'express';
import { TenantController } from '../controllers/TenantController';
import { TenantService } from '../services/TenantService';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../constants';
import tenantValidator from '../validators/tenant-validator';

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
    '/',
    [authenticate, canAccess([Roles.ADMIN])],
    tenantValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next),
);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
    tenantController.getAll(req, res, next),
);

router.get(
    '/:id',
    [authenticate, canAccess([Roles.ADMIN])],
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getOne(req, res, next),
);

router.patch(
    '/:id',
    [authenticate, canAccess([Roles.ADMIN])],
    tenantValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next),
);

router.delete(
    '/:id',
    [authenticate, canAccess([Roles.ADMIN])],
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.delete(req, res, next),
);

export default router;
