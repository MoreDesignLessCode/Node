import {
    Uuid,
    IRepository,
    Result,
    IService,
    IContext,
} from '@cvshealth/apip-api-types';
import { Ratings } from '../models/rating';

export class RatingService implements IService<Ratings> {
    repository: IRepository<Ratings>;

    constructor(repository: IRepository<Ratings>) {
        this.repository = repository;
    }

    // The service should only hold business logic, and not worry about shapes of the returns
    getById = (id: Uuid, context: IContext): Promise<Result<Ratings>> =>
        this.repository.find(id, context);

    getCollection = (context: IContext): Promise<Result<Ratings>> =>
        this.repository.all(context);

    create = (entity: Ratings, context: IContext): Promise<Result<Ratings>> =>
        this.repository.create(entity, context);

    update = (
        id: Uuid,
        entity: Ratings,
        context: IContext
    ): Promise<Result<Ratings>> => this.repository.update(id, entity, context);

    delete = (id: Uuid, context: IContext): Promise<Result<Ratings>> =>
        this.repository.delete(id, context);
}
