import {
    Uuid,
    Result,
    IStorageProvider,
    IContext,
} from '@cvshealth/apip-api-types';
import { ResourceNotFoundError } from '../../errors';
import { Contact, Constants } from '../../models';
import { formatString } from '../../utils';

export class ContactMemoryStorageProvider implements IStorageProvider<Contact> {
    contacts: Contact[];

    constructor(testData: Contact[]) {
        this.contacts = testData;
    }

    save = (
        id: Uuid,
        entity: Contact,
        _context: IContext
    ): Promise<Result<Contact>> => {
        return new Promise((resolve) => {
            const result = this.contacts.find((contact: Contact) => {
                return contact.id === id;
            });

            if (result != undefined) {
                const index = this.contacts.indexOf(result, 0);
                this.contacts[index] = entity;
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: entity },
                });
            } else {
                const error = new ResourceNotFoundError(
                    Constants.errors.notFound.contact.CODE
                )
                    .withTitle(Constants.errors.notFound.contact.TITLE)
                    .withReason(
                        formatString(
                            Constants.errors.notFound.contact.MESSAGE,
                            id
                        )
                    );

                resolve({ type: 'error', data: error });
            }
        });
    };

    delete = (id: Uuid, _context: IContext): Promise<Result<Contact>> => {
        return new Promise((resolve) => {
            const result = this.contacts.find((contact: Contact) => {
                return contact.id === id;
            });
            if (result != undefined) {
                const index = this.contacts.indexOf(result, 0);
                this.contacts.splice(index, 1);
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: result },
                });
            } else {
                const error = new ResourceNotFoundError(
                    Constants.errors.notFound.contact.CODE
                )
                    .withTitle(Constants.errors.notFound.contact.TITLE)
                    .withReason(
                        formatString(
                            Constants.errors.notFound.contact.MESSAGE,
                            id
                        )
                    );
                resolve({ type: 'error', data: error });
            }
        });
    };

    all = (): Promise<Result<Contact>> => {
        return new Promise((resolve) => {
            resolve({
                type: 'ok',
                data: { type: 'collection', value: this.contacts },
            });
        });
    };

    findById = (id: Uuid, _context: IContext): Promise<Result<Contact>> => {
        return new Promise((resolve) => {
            const result = this.contacts.find((contact: Contact) => {
                return contact.id === id;
            });

            if (result) {
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: result },
                });
            }

            const error = new ResourceNotFoundError(
                Constants.errors.notFound.contact.CODE
            )
                .withTitle(Constants.errors.notFound.contact.TITLE)
                .withReason(
                    formatString(Constants.errors.notFound.contact.MESSAGE, id)
                );
            resolve({
                type: 'error',
                data: error,
            });
        });
    };

    create = (
        object: Contact,
        _context: IContext
    ): Promise<Result<Contact>> => {
        return new Promise((resolve) => {
            this.contacts.push(object);
            resolve({
                type: 'ok',
                data: { type: 'resource', value: object },
            });
        });
    };
}
