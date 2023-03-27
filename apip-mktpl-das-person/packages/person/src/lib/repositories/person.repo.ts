import {
    Uuid,
    Result,
    IRepository,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';
import { StorageProviderUndefinedError } from '../errors';
import { Constants } from '../models';
import { Person } from '../models/person';

export class PersonRepository implements IRepository<Person> {
    storage: IStorageProvider<Person>;

    constructor(storageProvider: IStorageProvider<Person> | undefined) {
        if (!storageProvider) {
            throw new StorageProviderUndefinedError(
                Constants.errors.repo.person.storageProvider.undefined.CODE
            )
                .withTitle(
                    Constants.errors.repo.person.storageProvider.undefined.TITLE
                )
                .withReason(
                    Constants.errors.repo.person.storageProvider.undefined
                        .MESSAGE
                )
                .toJson();
        }
        this.storage = storageProvider;
    }

    update = (
        id: Uuid,
        resource: Person,
        context: IContext
    ): Promise<Result<Person>> => this.storage.save(id, resource, context);

    delete = (id: Uuid, context: IContext): Promise<Result<Person>> =>
        this.storage.delete(id, context);

    all = (context: IContext): Promise<Result<Person>> =>
        this.storage.all(context);

    find = (id: Uuid, context: IContext): Promise<Result<Person>> =>
        this.storage.findById(id, context);

    create = (resource: Person, context: IContext): Promise<Result<Person>> =>
        this.storage.create(resource, context);
}
