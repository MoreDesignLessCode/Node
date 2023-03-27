import {
    Uuid,
    Result,
    IRepository,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';
import { StorageProviderUndefinedError } from '../errors';
import { Constants } from '../models';
import { Contact } from '../models/contact';

export class ContactRepository implements IRepository<Contact> {
    storage: IStorageProvider<Contact>;

    constructor(storageProvider: IStorageProvider<Contact> | undefined) {
        if (!storageProvider) {
            throw new StorageProviderUndefinedError(
                Constants.errors.repository.contact.storageProvider.undefined.CODE
            )
                .withTitle(
                    Constants.errors.repository.contact.storageProvider
                        .undefined.TITLE
                )
                .withReason(
                    Constants.errors.repository.contact.storageProvider
                        .undefined.MESSAGE
                )
                .toJson();
        }
        this.storage = storageProvider;
    }

    update = (
        id: Uuid,
        resource: Contact,
        context: IContext
    ): Promise<Result<Contact>> => this.storage.save(id, resource, context);

    delete = (id: Uuid, context: IContext): Promise<Result<Contact>> =>
        this.storage.delete(id, context);

    all = (context: IContext): Promise<Result<Contact>> =>
        this.storage.all(context);

    find = (id: Uuid, context: IContext): Promise<Result<Contact>> =>
        this.storage.findById(id, context);

    create = (resource: Contact, context: IContext): Promise<Result<Contact>> =>
        this.storage.create(resource, context);
}
