import {
    Uuid,
    Result,
    IRepository,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';
import { StorageProviderUndefinedError } from '../errors';
import { Constants } from '../models';
import { Tickets } from '../models/ticket';

export class TicketRepository implements IRepository<Tickets> {
    storage: IStorageProvider<Tickets>;

    constructor(storageProvider: IStorageProvider<Tickets> | undefined) {
        if (!storageProvider) {
            throw new StorageProviderUndefinedError(
                Constants.errors.repository.ticket.storageProvider.undefined.CODE
            )
                .withTitle(
                    Constants.errors.repository.ticket.storageProvider.undefined.TITLE
                )
                .withReason(
                    Constants.errors.repository.ticket.storageProvider.undefined
                        .MESSAGE
                )
                .toJson();
        }
        this.storage = storageProvider;
    }

    update = (
        id: Uuid,
        resource: Tickets,
        context: IContext
    ): Promise<Result<Tickets>> => this.storage.save(id, resource, context);

    delete = (id: Uuid, context: IContext): Promise<Result<Tickets>> =>
        this.storage.delete(id, context);

    all = (context: IContext): Promise<Result<Tickets>> =>
        this.storage.all(context);

    find = (id: Uuid, context: IContext): Promise<Result<Tickets>> =>
        this.storage.findById(id, context);

    create = (resource: Tickets, context: IContext): Promise<Result<Tickets>> =>
        this.storage.create(resource, context);
}
