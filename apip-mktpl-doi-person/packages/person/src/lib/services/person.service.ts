import {
    Uuid,
    IRepository,
    Result,
    IService,
    IContext,
} from '@cvshealth/apip-api-types';
import { Person } from '../models/person';

export class PersonService implements IService<Person> {
    repository: IRepository<Person>;

    constructor(repository: IRepository<Person>) {
        this.repository = repository;
    }

    // The service should only hold business logic, and not worry about shapes of the returns
    getById = (id: Uuid, context: IContext): Promise<Result<Person>> =>
        this.repository.find(id, context);

    getCollection = (context: IContext): Promise<Result<Person>> =>
        this.repository.all(context);

    create = (entity: Person, context: IContext): Promise<Result<Person>> =>
        this.repository.create(entity, context);

    update = (
        id: Uuid,
        entity: Person,
        context: IContext
    ): Promise<Result<Person>> => this.repository.update(id, entity, context);

    delete = (id: Uuid, context: IContext): Promise<Result<Person>> =>
        this.repository.delete(id, context);
}
