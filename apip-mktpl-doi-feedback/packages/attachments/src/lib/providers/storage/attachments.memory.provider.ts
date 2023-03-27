import {
    Constants,
    formatString,
    ResourceNotFoundError,
} from '../../index';

import {
    parseUuid,
    Uuid,
    Result,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';
import { Attachments } from '../../models/attachment';


export class AttachmentsMemoryStorageProvider implements IStorageProvider<Attachments> {


    attachments: Attachments[] = [
        {
            id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
            file_name:"test",
            url:"google.com",
        },
        {
            id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab0'),
            file_name:"test",
            url:"google.com",
        },
    ];

    save = (
        id: Uuid,
        entity: Attachments,
        context: IContext
    ): Promise<Result<Attachments>> => {
        return new Promise((resolve) => {
            const result = this.attachments.find((attachment: Attachments) => {
                return attachment.id === id;
            });

            if (result != undefined) {
                const index = this.attachments.indexOf(result, 0);
                this.attachments[index] = entity;
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: entity },
                });
            } else {
                const error = new ResourceNotFoundError(
                    Constants.errors.notFound.attachment.CODE
                )
                    .withTitle(Constants.errors.notFound.attachment.TITLE)
                    .withReason(
                        formatString(
                            Constants.errors.notFound.attachment.MESSAGE,
                            id
                        )
                    );

                resolve({ type: 'error', data: error });
            }
        });
    };

    delete = (id: Uuid, context: IContext): Promise<Result<Attachments>> => {
        return new Promise((resolve) => {
            const result = this.attachments.find((attachment: Attachments) => {
                return attachment.id === id;
            });
            if (result != undefined) {
                const index = this.attachments.indexOf(result, 0);
                this.attachments.splice(index, 1);
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: result },
                });
            } else {
                const error = new ResourceNotFoundError(
                    Constants.errors.notFound.attachment.CODE
                )
                    .withTitle(Constants.errors.notFound.attachment.TITLE)
                    .withReason(
                        formatString(
                            Constants.errors.notFound.attachment.MESSAGE,
                            id
                        )
                    );
                resolve({ type: 'error', data: error });
            }
        });
    };

    all = (): Promise<Result<Attachments>> => {
        return new Promise((resolve) => {
            resolve({
                type: 'ok',
                data: { type: 'collection', value: this.attachments },
            });
        });
    };

    findById = (id: Uuid, context: IContext): Promise<Result<Attachments>> => {
        return new Promise((resolve) => {
            const result = this.attachments.find((attachment: Attachments) => {
                return attachment.id === id;
            });

            if (result) {
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: result },
                });
            }

            const error = new ResourceNotFoundError(
                Constants.errors.notFound.attachment.CODE
            )
                .withTitle(Constants.errors.notFound.attachment.TITLE)
                .withReason(
                    formatString(Constants.errors.notFound.attachment.MESSAGE, id)
                );
            resolve({
                type: 'error',
                data: error,
            });
        });
    };

    create = (object: Attachments, context: IContext): Promise<Result<Attachments>> => {
        return new Promise((resolve) => {
            this.attachments.push(object);
            resolve({
                type: 'ok',
                data: { type: 'resource', value: object },
            });
        });
    };
}



