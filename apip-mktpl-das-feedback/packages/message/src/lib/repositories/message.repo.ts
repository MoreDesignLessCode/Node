import {
    Uuid,
    Result,
    IRepository,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';
import { StorageProviderUndefinedError } from '../errors';
import { Constants } from '../models';
import { Messages } from '../models/message';

export class MessageRepository implements IRepository<Messages> {
    storage: IStorageProvider<Messages>;

    constructor(storageProvider: IStorageProvider<Messages> | undefined) {
        if (!storageProvider) {
            throw new StorageProviderUndefinedError(
                Constants.errors.repo.message.storageProvider.undefined.CODE
            )
                .withTitle(
                    Constants.errors.repo.message.storageProvider.undefined.TITLE
                )
                .withReason(
                    Constants.errors.repo.message.storageProvider.undefined
                        .MESSAGE
                )
                .toJson();
        }
        this.storage = storageProvider;
    }

    update = (
        id: Uuid,
        resource: Messages,
        context: IContext
    ): Promise<Result<Messages>> => this.storage.save(id, resource, context);

    delete = (id: Uuid, context: IContext): Promise<Result<Messages>> =>
        this.storage.delete(id, context);

    all = (context: IContext): Promise<Result<Messages>> =>
        this.storage.all(context);

    find = (id: Uuid, context: IContext): Promise<Result<Messages>> =>
        this.storage.findById(id, context);

    create = (resource: Messages, context: IContext): Promise<Result<Messages>> =>
        this.storage.create(resource, context);
}
