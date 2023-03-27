import {
    Uuid,
    IRepository,
    Result,
    IService,
    IContext,
} from '@cvshealth/apip-api-types';
import { Tickets } from '../models/ticket';

export class TicketService implements IService<Tickets> {
    repository: IRepository<Tickets>;

    constructor(repository: IRepository<Tickets>) {
        this.repository = repository;
    }

    // The service should only hold business logic, and not worry about shapes of the returns
    getById = (id: Uuid, context: IContext): Promise<Result<Tickets>> =>
        this.repository.find(id, context);

    getCollection = (context: IContext): Promise<Result<Tickets>> =>
        this.repository.all(context);

    create = (entity: Tickets, context: IContext): Promise<Result<Tickets>> =>
        this.repository.create(entity, context);

    update = (
        id: Uuid,
        entity: Tickets,
        context: IContext
    ): Promise<Result<Tickets>> => this.repository.update(id, entity, context);

    delete = (id: Uuid, context: IContext): Promise<Result<Tickets>> =>
        this.repository.delete(id, context);
}
