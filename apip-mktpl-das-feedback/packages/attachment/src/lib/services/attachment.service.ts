import {
    Uuid,
    IRepository,
    Result,
    IService,
    IContext,
} from '@cvshealth/apip-api-types';
import { Attachments } from '../models/attachment';

export class AttachmentService implements IService<Attachments> {
    repository: IRepository<Attachments>;

    constructor(repository: IRepository<Attachments>) {
        this.repository = repository;
    }

    // The service should only hold business logic, and not worry about shapes of the returns
    getById = (id: Uuid, context: IContext): Promise<Result<Attachments>> =>
        this.repository.find(id, context);

    getCollection = (context: IContext): Promise<Result<Attachments>> =>
        this.repository.all(context);

    create = (entity: Attachments, context: IContext): Promise<Result<Attachments>> =>
        this.repository.create(entity, context);

    update = (
        id: Uuid,
        entity: Attachments,
        context: IContext
    ): Promise<Result<Attachments>> => this.repository.update(id, entity, context);

    delete = (id: Uuid, context: IContext): Promise<Result<Attachments>> =>
        this.repository.delete(id, context);

        
}
