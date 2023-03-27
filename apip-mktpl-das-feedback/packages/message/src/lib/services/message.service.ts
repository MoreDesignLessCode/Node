import {
    Uuid,
    IRepository,
    Result,
    IService,
    IContext,
} from '@cvshealth/apip-api-types';
import { Messages } from '../models/message';

export class MessageService implements IService<Messages> {
    repository: IRepository<Messages>;

    constructor(repository: IRepository<Messages>) {
        this.repository = repository;
    }

    // The service should only hold business logic, and not worry about shapes of the returns
    getById = (id: Uuid, context: IContext): Promise<Result<Messages>> =>
    {
        return this.repository.find(id, context);
    }
    getCollection = (context: IContext): Promise<Result<Messages>> =>
        this.repository.all(context);

    create = (entity: Messages, context: IContext): Promise<Result<Messages>> =>
        this.repository.create(entity, context);

    update = (
        id: Uuid,
        entity: Messages,
        context: IContext
    ): Promise<Result<Messages>> => this.repository.update(id, entity, context);

    delete = (id: Uuid, context: IContext): Promise<Result<Messages>> =>
        this.repository.delete(id, context);
}
