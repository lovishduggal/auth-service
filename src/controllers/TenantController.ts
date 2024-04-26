import { Response } from 'express';
import { TenantService } from '../services/TenantService';
import { ICreateTenantRequest } from '../types';
import { NextFunction } from 'express-serve-static-core';
import { Logger } from 'winston';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: ICreateTenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;
        this.logger.debug(`Creating tenant`, req.body);
        try {
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info(`Tenant has been created`, { id: tenant.id });
            return res.status(201).json({ id: tenant.id });
        } catch (err) {
            return next(err);
        }
    }
}
