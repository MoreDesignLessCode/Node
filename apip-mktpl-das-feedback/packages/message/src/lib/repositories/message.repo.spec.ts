import {
    parseUuid,
    DefaultRequestContext,
    IContext,
} from '@cvshealth/apip-api-types';
import { GeneralAPIError } from '../errors';
import { MessageRepository } from './message.repo';
import { match } from 'ts-pattern';
import { Messages, Constants } from '../models';
import { MessagePgStorageProvider } from '../providers';

let testMessageRepository: MessageRepository;
let testMessages: Messages[];
let testUpdateMessage: Messages;
let testMessage: Messages;
let testNewMessage: Messages;
let testRequestContext: IContext;

const storageMock = jest.genMockFromModule<MessagePgStorageProvider>(
    '../providers/storage/message.pg.storage.provider'
);

beforeEach(() => {
    jest.clearAllMocks();

    testMessageRepository = new MessageRepository(storageMock);
    testMessages = [
        {
            id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
            summary:"summary",
            description:'desc',
            status:"NEW"
        },
        {
            id: parseUuid('cef35b6e-056d-43b9-b707-3fe568c3ab65'),
            summary:"summary",
            description:'desc',
            status:"NEW"
            
        },
        {
            id: parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
            summary:"summary",
            description:'desc',
            status:"NEW"
        },
    ];
    testUpdateMessage = {
        id: parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
        summary:"summary",
        description:'desc',
        status:"NEW"
    };
    testMessage = {
        id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
        summary:"summary",
            description:'desc',
            status:"NEW"
    };
    testNewMessage = {
        id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab8'),
        summary:"summary",
            description:'desc',
            status:"NEW"
    };
});

describe('all function test', () => {
    it('the all function should return all messages in the repo', async () => {
        storageMock.all = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'collection', value: testMessages },
        });
        const result = await testMessageRepository.all(
            new DefaultRequestContext()
        );
        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(res.data.value).toStrictEqual(testMessages);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('find function test', () => {
    it('the find function should return a message with the associated ID', async () => {
        storageMock.findById = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'resource', value: testMessage },
        });
        const result = await testMessageRepository.find(
            parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
            new DefaultRequestContext()
        );

        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(res.data.value).toStrictEqual(testMessage);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('create function test', () => {
    it('create should add a message object to the repo', async () => {
        storageMock.create = jest.fn(() => {
            return new Promise((resolve) => {
                testMessages.push(testNewMessage);
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: testNewMessage },
                });
            });
        });
        storageMock.all = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'resourceCollection', value: testMessages },
        });

        const repoSize = testMessages.length;
        await testMessageRepository.create(
            testNewMessage,
            new DefaultRequestContext()
        );

        const result = await testMessageRepository.all(
            new DefaultRequestContext()
        );
        match(result).with(
            { type: 'ok', data: { type: 'collection' } },
            (res) => {
                testMessages = res.data.value;
                let newRepoSize = testMessages.length;
                newRepoSize--;
                expect(newRepoSize).toBe(repoSize);
            }
        );
    });
});

describe('update function test', () => {
    it('saving a message object should return an updated message', async () => {
        storageMock.save = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'resource', value: testUpdateMessage },
        });
        const result = await testMessageRepository.update(
            parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
            testUpdateMessage,
            testRequestContext
        );

        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(res.data.value).toBe(testUpdateMessage);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('delete function test', () => {
    it('deleting a message by id should remove message at found index', async () => {
        storageMock.delete = jest.fn((id: string) => {
            return new Promise((resolve) => {
                const result = testMessages.find((message: Messages) => {
                    return message.id === id;
                });
                if (result != undefined) {
                    const index = testMessages.indexOf(result, 0);
                    if (index > -1) {
                        testMessages.splice(index, 1);
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
        await testMessageRepository.delete(
            parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
            testRequestContext
        );

        const result = await testMessageRepository.delete(
            parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
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
            testMessageRepository = new MessageRepository(undefined);
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError).toHaveProperty(
            'reason',
            Constants.errors.repo.message.storageProvider.undefined.MESSAGE
        );
        expect(thrownError).toHaveProperty(
            'code',
            Constants.errors.repo.message.storageProvider.undefined.CODE
        );
        expect(thrownError).toHaveProperty('instance');
        expect(thrownError).toHaveProperty('pointer', '');
        expect(thrownError).toHaveProperty(
            'title',
            Constants.errors.repo.message.storageProvider.undefined.TITLE
        );
    });
});
