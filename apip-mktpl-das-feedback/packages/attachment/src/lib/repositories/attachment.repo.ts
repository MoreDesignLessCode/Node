import {
    Uuid,
    Result,
    IRepository,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';
import { StorageProviderUndefinedError } from '../errors';
import { Constants } from '../models';
import { Attachments } from '../models/attachment';

export class AttachmentRepository implements IRepository<Attachments> {
    storage: IStorageProvider<Attachments>;

    constructor(storageProvider: IStorageProvider<Attachments> | undefined) {
        if (!storageProvider) {
            throw new StorageProviderUndefinedError(
                Constants.errors.repo.attachment.storageProvider.undefined.CODE
            )
                .withTitle(
                    Constants.errors.repo.attachment.storageProvider.undefined.TITLE
                )
                .withReason(
                    Constants.errors.repo.attachment.storageProvider.undefined
                        .MESSAGE
                )
                .toJson();
        }
        this.storage = storageProvider;
    }

    update = (
        id: Uuid,
        resource: Attachments,
        context: IContext
    ): Promise<Result<Attachments>> => this.storage.save(id, resource, context);

    delete = (id: Uuid, context: IContext): Promise<Result<Attachments>> =>
        this.storage.delete(id, context);

    all = (context: IContext): Promise<Result<Attachments>> =>
        this.storage.all(context);

    find = (id: Uuid, context: IContext): Promise<Result<Attachments>> =>
        this.storage.findById(id, context);

    create = (resource: Attachments, context: IContext): Promise<Result<Attachments>> =>
        this.storage.create(resource, context);

}
