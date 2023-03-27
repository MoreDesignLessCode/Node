import {
    Uuid,
    IRepository,
    Result,
    IService,
    IContext,
} from '@cvshealth/apip-api-types';
import { Contact } from '../models/contact';

export class ContactService implements IService<Contact> {
    repository: IRepository<Contact>;

    constructor(repository: IRepository<Contact>) {
        this.repository = repository;
    }

    // The service should only hold business logic, and not worry about shapes of the returns
    getById = (id: Uuid, context: IContext): Promise<Result<Contact>> =>
        this.repository.find(id, context);

    getCollection = (context: IContext): Promise<Result<Contact>> =>
        this.repository.all(context);

    create = (entity: Contact, context: IContext): Promise<Result<Contact>> =>
        this.repository.create(entity, context);

    update = (
        id: Uuid,
        entity: Contact,
        context: IContext
    ): Promise<Result<Contact>> => this.repository.update(id, entity, context);

    delete = (id: Uuid, context: IContext): Promise<Result<Contact>> =>
        this.repository.delete(id, context);
}
