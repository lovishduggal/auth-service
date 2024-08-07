import { Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import {
    ICreateTenantRequest,
    TenantQueryParams,
    UserQueryParams,
} from '../types';
import { NextFunction } from 'express-serve-static-core';
import { Logger } from 'winston';
import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: ICreateTenantRequest, res: Response, next: NextFunction) {
        //* Validation:
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, 'Invalid fields'));
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

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });
        try {
            const [tenants, count] = await this.tenantService.getAll(
                validatedQuery as TenantQueryParams,
            );
            this.logger.info(`Tenant list has been fetched`, {
                count: tenants.length,
            });
            return res.status(200).json({
                total: count,
                currentPage: validatedQuery.currentPage as UserQueryParams,
                perPage: validatedQuery.perPage as UserQueryParams,
                data: tenants,
            });
        } catch (err) {
            return next(err);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param'));
            return;
        }

        try {
            const tenant = await this.tenantService.getById(Number(tenantId));

            if (!tenant) {
                next(createHttpError(400, 'Tenant does not exist.'));
                return;
            }

            this.logger.info(`Tenant has been fetched`, { id: tenant.id });
            return res.status(200).json(tenant);
        } catch (err) {
            return next(err);
        }
    }

    async update(req: ICreateTenantRequest, res: Response, next: NextFunction) {
        //* Validation:
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, 'Invalid fields'));
        }

        const { name, address } = req.body;

        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param'));
            return;
        }

        this.logger.debug(`Request for updating a tenant`, req.body);

        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });

            this.logger.info(`Tenant has been updated`, { id: tenantId });

            return res.status(200).json({ id: Number(tenantId) });
        } catch (err) {
            return next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param'));
            return;
        }

        this.logger.debug(`deleting tenant`, req.body);

        try {
            await this.tenantService.deleteById(Number(tenantId));

            this.logger.info(`Tenant has been deleted`, { id: tenantId });

            return res.status(200).json({ id: Number(tenantId) });
        } catch (err) {
            return next(err);
        }
    }
}
