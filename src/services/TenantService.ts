import { Brackets, Repository } from 'typeorm';
import { ITenant, TenantQueryParams } from '../types';
import { Tenant } from '../entity/Tenant';

export class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}
    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData);
    }

    async getAll(validatedQuery: TenantQueryParams) {
        const queryBuilder = this.tenantRepository.createQueryBuilder('tenant');
        const searchTerm = validatedQuery.q;

        if (searchTerm) {
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "CONCAT(tenant.name, ' ', tenant.address) ILIKE :q",
                        {
                            q: `%${searchTerm}%`,
                        },
                    );
                }),
            );
        }
        const result = await queryBuilder
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy('tenant.id', 'DESC')
            .getManyAndCount();
        return result;
    }

    async getById(tenantId: number) {
        return await this.tenantRepository.findOne({ where: { id: tenantId } });
    }

    async update(tenantId: number, tenantData: ITenant) {
        return await this.tenantRepository.update(tenantId, tenantData);
    }

    async deleteById(tenantId: number) {
        return await this.tenantRepository.delete(tenantId);
    }
}
