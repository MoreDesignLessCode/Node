import {
    Constants,
    formatString,
    Messages,
    ResourceNotFoundError,

} from '../../index';
import {
    parseUuid,
    Uuid,
    Result,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';




export class MessagessMemoryStorageProvider implements IStorageProvider<Messages> {


    messageSample: any = {
        id: parseUuid('11e62cea-eedd-40e5-8b68-26efe3c47d37'),
        summary: "hello",
        status: "new",
        createdBy: parseUuid('11e62cea-eedd-40e5-8b68-26efe3c47d37'),
        description: "hey",
    }

    save = (
        id: Uuid,
        entity: Messages,
        context: IContext
    ): Promise<Result<Messages>> => {
        return new Promise((resolve) => {
            const result = this.messageSample.find((message: Messages) => {
                return message.id === id;
            });

            if (result != undefined) {
                const index = this.messageSample.indexOf(result, 0);
                this.messageSample[index] = entity;
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: entity },
                });
            } else {
                const error = new ResourceNotFoundError(
                    Constants.errors.notFound.message.CODE
                )
                    .withTitle(Constants.errors.notFound.message.TITLE)
                    .withReason(
                        formatString(
                            Constants.errors.notFound.message.MESSAGE,
                            id
                        )
                    );

                resolve({ type: 'error', data: error });
            }
        });
    };

    delete = (id: Uuid, context: IContext): Promise<Result<Messages>> => {
        return new Promise((resolve) => {
            const result = this.messageSample.find((message: Messages) => {
                return message.id === id;
            });
            if (result != undefined) {
                const index = this.messageSample.indexOf(result, 0);
                this.messageSample.splice(index, 1);
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: result },
                });
            } else {
                const error = new ResourceNotFoundError(
                    Constants.errors.notFound.message.CODE
                )
                    .withTitle(Constants.errors.notFound.message.TITLE)
                    .withReason(
                        formatString(
                            Constants.errors.notFound.message.MESSAGE,
                            id
                        )
                    );
                resolve({ type: 'error', data: error });
            }
        });
    };

    all = (): Promise<Result<Messages>> => {
        return new Promise((resolve) => {
            resolve({
                type: 'ok',
                data: { type: 'collection', value: this.messageSample },
            });
        });
    };

    findById = (id: Uuid, context: IContext): Promise<Result<Messages>> => {
        return new Promise((resolve) => {
            const result = this.messageSample.find((message: Messages) => {
                return message.id === id;
            });

            if (result) {
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: result },
                });
            }

            const error = new ResourceNotFoundError(
                Constants.errors.notFound.message.CODE
            )
                .withTitle(Constants.errors.notFound.message.TITLE)
                .withReason(
                    formatString(Constants.errors.notFound.message.MESSAGE, id)
                );
            resolve({
                type: 'error',
                data: error,
            });
        });
    };

    create = (object: Messages, context: IContext): Promise<Result<Messages>> => {
        return new Promise((resolve) => {
            this.messageSample.push(object);
            resolve({
                type: 'ok',
                data: { type: 'resource', value: object },
            });
        });
    };
}
