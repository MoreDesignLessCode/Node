import {
    parseUuid,
    DefaultRequestContext,
    IContext,
} from '@procter-gamble/apip-api-types';
import { GeneralAPIError } from '../errors';
import { ContactRepository } from './contact.repo';
import { match } from 'ts-pattern';
import { Contact, Constants } from '../models';
import { ContactMemoryStorageProvider } from '../providers';

let testContactRepository: ContactRepository;
let testContacts: Contact[];
let testUpdateContact: Contact;
let testContact: Contact;
let testNewContact: Contact;
let testRequestContext: IContext;

const storageMock = jest.genMockFromModule<ContactMemoryStorageProvider>(
    '../providers/storage/contact.memory.storage.provider'
);

beforeEach(() => {
    jest.clearAllMocks();

    testContactRepository = new ContactRepository(storageMock);
    testContacts = [
        {
            id: parseUuid('778f1ecf-3287-41bc-9778-61b809827b85'),
            personId: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
            type: 'urn:mailto',
            value: 'developer.jd@pg.com',
        },
        {
            id: parseUuid('91da57f9-f772-4dde-8ea5-1b9bf0818108'),
            personId: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
            type: 'urn:mobile',
            value: '513-867-5309',
        },
        {
            id: parseUuid('df4da5ef-db03-49ca-aea4-3238fcdf96cb'),
            personId: parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
            type: 'urn:mailto',
            value: 'example@address.edu',
        },
        {
            id: parseUuid('6c49bf49-d902-4128-8146-6adf6f657d6e'),
            personId: parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
            type: 'urn:fax',
            value: 'thefactsmachine@example.gov',
        },
    ];
    testUpdateContact = {
        id: parseUuid('778f1ecf-3287-41bc-9778-61b809827b85'),
        personId: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
        type: 'urn:mailto',
        value: 'seniordeveloper.jd@pg.com',
    };
    testContact = {
        id: parseUuid('df4da5ef-db03-49ca-aea4-3238fcdf96cb'),
        personId: parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
        type: 'urn:mailto',
        value: 'example@address.edu',
    };
    testNewContact = {
        id: parseUuid('b3c77a22-d78a-4e60-b798-6e90492391e1'),
        personId: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
        type: 'urn:fax',
        value: 'developerfaxmachine@pg.com',
    };
});

describe('all function test', () => {
    it('the all function should return all contacts in the repo', async () => {
        storageMock.all = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'collection', value: testContacts },
        });
        const result = await testContactRepository.all(
            new DefaultRequestContext()
        );
        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(res.data.value).toStrictEqual(testContacts);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('find function test', () => {
    it('the find function should return a contact with the associated ID', async () => {
        storageMock.findById = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'resource', value: testContact },
        });
        const result = await testContactRepository.find(
            parseUuid('778f1ecf-3287-41bc-9778-61b809827b85'),
            new DefaultRequestContext()
        );

        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(res.data.value).toStrictEqual(testContact);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('create function test', () => {
    it('create should add a contact object to the repo', async () => {
        storageMock.create = jest.fn(() => {
            return new Promise((resolve) => {
                testContacts.push(testNewContact);
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: testNewContact },
                });
            });
        });
        storageMock.all = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'resourceCollection', value: testContacts },
        });

        const repoSize = testContacts.length;
        await testContactRepository.create(
            testNewContact,
            new DefaultRequestContext()
        );

        const result = await testContactRepository.all(
            new DefaultRequestContext()
        );
        match(result).with(
            { type: 'ok', data: { type: 'collection' } },
            (res) => {
                testContacts = res.data.value;
                let newRepoSize = testContacts.length;
                newRepoSize--;
                expect(newRepoSize).toBe(repoSize);
            }
        );
    });
});

describe('update function test', () => {
    it('saving a contact object should return an updated contact', async () => {
        storageMock.save = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'resource', value: testUpdateContact },
        });
        const result = await testContactRepository.update(
            parseUuid('778f1ecf-3287-41bc-9778-61b809827b85'),
            testUpdateContact,
            testRequestContext
        );

        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(res.data.value).toBe(testUpdateContact);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('delete function test', () => {
    it('deleting a contact by id should remove contact at found index', async () => {
        storageMock.delete = jest.fn((id: string) => {
            return new Promise((resolve) => {
                const result = testContacts.find((contact: Contact) => {
                    return contact.id === id;
                });
                if (result != undefined) {
                    const index = testContacts.indexOf(result, 0);
                    if (index > -1) {
                        testContacts.splice(index, 1);
                        resolve({
                            type: 'ok',
                            data: { type: 'resource', value: result },
                        });
                    } else {
                        const error = new GeneralAPIError(
                            Constants.errors.generalError.CODE
                        );
                        resolve({
                            type: 'error',
                            data: error,
                        });
                    }
                } else {
                    const error = new GeneralAPIError(
                        Constants.errors.generalError.CODE
                    );
                    resolve({
                        type: 'error',
                        data: error,
                    });
                }
            });
        });
        await testContactRepository.delete(
            parseUuid('91da57f9-f772-4dde-8ea5-1b9bf0818108'),
            testRequestContext
        );

        const result = await testContactRepository.delete(
            parseUuid('91da57f9-f772-4dde-8ea5-1b9bf0818108'),
            testRequestContext
        );

        match(result)
            .with({ type: 'error' }, (res) => {
                expect(res.data).toBeInstanceOf(GeneralAPIError);
            })
            .with({ type: 'ok' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('test undefined storageProvider', () => {
    it('should throw StorageProviderUndefinedException when storage provider not defined', () => {
        let thrownError;

        try {
            testContactRepository = new ContactRepository(undefined);
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError).toHaveProperty(
            'reason',
            Constants.errors.repository.contact.storageProvider.undefined
                .MESSAGE
        );
        expect(thrownError).toHaveProperty(
            'code',
            Constants.errors.repository.contact.storageProvider.undefined.CODE
        );
        expect(thrownError).toHaveProperty('instance');
        expect(thrownError).toHaveProperty('pointer', '');
        expect(thrownError).toHaveProperty(
            'title',
            Constants.errors.repository.contact.storageProvider.undefined.TITLE
        );
    });
});
