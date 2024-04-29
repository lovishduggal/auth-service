import { Response } from 'express';
import { TenantService } from '../services/TenantService';
import { ICreateTenantRequest } from '../types';
import { NextFunction } from 'express-serve-static-core';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: ICreateTenantRequest, res: Response, next: NextFunction) {
        //* Validation:
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

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

    async getAll(req: ICreateTenantRequest, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenantService.getAll();
            this.logger.info(`Tenant list has been fetched`, {
                count: tenants.length,
            });
            return res.status(200).json(tenants);
        } catch (err) {
            return next(err);
        }
    }
}
