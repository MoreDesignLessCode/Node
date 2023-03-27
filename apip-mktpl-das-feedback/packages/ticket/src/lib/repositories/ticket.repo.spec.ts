import {
    parseUuid,
    DefaultRequestContext,
    IContext,
} from '@cvshealth/apip-api-types';
import { GeneralAPIError } from '../errors';
import { TicketRepository } from './ticket.repo';
import { match } from 'ts-pattern';
import { Tickets, Constants } from '../models';
import { TicketPgStorageProvider } from '../providers/storage/ticket.pg.storage.provider';


let testTicketRepository: TicketRepository;
let testTickets: Tickets[];

let testTicket: Tickets;

let testRequestContext: IContext;
let testNewTicket:Tickets
let testUpdateTicket:Tickets

const storageMock = jest.genMockFromModule<TicketPgStorageProvider>(
    '../providers/storage/ticket.pg.storage.provider'
);

beforeEach(() => {
    jest.clearAllMocks();

    testTicketRepository = new TicketRepository(storageMock);
    testTickets = [
        {
            id: parseUuid('5f922298-6219-4488-857a-e0d7bd711baf'),
            createdBy: parseUuid('618c128c-d0a7-46d7-a7c3-4fe978a10258'),
            status: "NEW",
            summary: "Summary of the message",
            description: "Description of the message",
            messageIds: [parseUuid('0bb2c4a6-8ad8-4134-a37a-49721981aa58')],
            participantIds: [parseUuid('5da51500-fd74-41c7-a255-7448fa3d2e4f')],
            messages: [{
                id: parseUuid('0bb2c4a6-8ad8-4134-a37a-49721981aa58'),
                summary: "Summary of the message",
                description: "Description of the message",
                status: "NEW",
                createdBy: parseUuid('618c128c-d0a7-46d7-a7c3-4fe978a10258')
            }],
            participants: [{
                id: parseUuid('5da51500-fd74-41c7-a255-7448fa3d2e4f'),
                createdBy: parseUuid('618c128c-d0a7-46d7-a7c3-4fe978a10258'),
                status: "RESPONSIBLE"
            }]


        },
        {
            id: parseUuid('c0ab8245-ed2a-417d-8479-61baff15dff2'),
            createdBy: parseUuid('a14f5360-e8e3-4a1a-9f1c-f63ad2957484'),
            status: "NEW",
            summary: "Summary of the message1",
            description: "Description of the message2",
            messageIds: [parseUuid('8f393fba-f94b-4bd7-814d-2a12f97470f5')],
            participantIds: [parseUuid('102de9f2-b7fd-4639-b66e-21aaaf88a5ed')],
            messages: [{
                id: parseUuid('8f393fba-f94b-4bd7-814d-2a12f97470f5'),
                summary: "Summary of the message",
                description: "Description of the message",
                status: "NEW",
                createdBy: parseUuid('a14f5360-e8e3-4a1a-9f1c-f63ad2957484')
            }],
            participants: [{
                id: parseUuid('102de9f2-b7fd-4639-b66e-21aaaf88a5ed'),
                createdBy: parseUuid('a14f5360-e8e3-4a1a-9f1c-f63ad2957484'),
                status: "RESPONSIBLE"
            }]


        }
    ];
    testTicket ={
        id: parseUuid('5f922298-6219-4488-857a-e0d7bd711baf'),
        createdBy: parseUuid('618c128c-d0a7-46d7-a7c3-4fe978a10258'),
        status: "NEW",
        summary: "Summary of the message",
        description: "Description of the message",
        messageIds: [parseUuid('0bb2c4a6-8ad8-4134-a37a-49721981aa58')],
        participantIds: [parseUuid('5da51500-fd74-41c7-a255-7448fa3d2e4f')],
        messages: [{
            id: parseUuid('0bb2c4a6-8ad8-4134-a37a-49721981aa58'),
            summary: "Summary of the message",
            description: "Description of the message",
            status: "NEW",
            createdBy: parseUuid('618c128c-d0a7-46d7-a7c3-4fe978a10258')
        }],
        participants: [{
            id: parseUuid('5da51500-fd74-41c7-a255-7448fa3d2e4f'),
            createdBy: parseUuid('618c128c-d0a7-46d7-a7c3-4fe978a10258'),
            status: "RESPONSIBLE"
        }]
 }

 testUpdateTicket={
    id: parseUuid('c0ab8245-ed2a-417d-8479-61baff15dff2'),
    createdBy: parseUuid('a14f5360-e8e3-4a1a-9f1c-f63ad2957484'),
    status: "NEW",
    summary: "Summary of the message1",
    description: "Description of the message2",
    messageIds: [parseUuid('8f393fba-f94b-4bd7-814d-2a12f97470f5')],
    participantIds: [parseUuid('102de9f2-b7fd-4639-b66e-21aaaf88a5ed')],
    messages: [{
        id: parseUuid('8f393fba-f94b-4bd7-814d-2a12f97470f5'),
        summary: "Summary of the message",
        description: "Description of the message",
        status: "NEW",
        createdBy: parseUuid('a14f5360-e8e3-4a1a-9f1c-f63ad2957484')
    }],
    participants: [{
        id: parseUuid('102de9f2-b7fd-4639-b66e-21aaaf88a5ed'),
        createdBy: parseUuid('a14f5360-e8e3-4a1a-9f1c-f63ad2957484'),
        status: "RESPONSIBLE"
    }]


}

testNewTicket={
    id: parseUuid('a262023a-0bcd-40a2-9725-01727d163782'),
    createdBy: parseUuid('0f996867-84d2-46be-a083-f6b509c89f82'),
    status: "NEW",
    summary: "Summary of the message2",
    description: "Description of the message3",
    messageIds: [parseUuid('c320fd96-e63c-4a36-a873-1a94c25be467')],
    participantIds: [parseUuid('23c90175-d16f-4d99-85ac-cc5d8b5fc89b')],
    messages: [{
        id: parseUuid('c320fd96-e63c-4a36-a873-1a94c25be467'),
        summary: "Summary of the message",
        description: "Description of the message",
        status: "NEW",
        createdBy: parseUuid('0f996867-84d2-46be-a083-f6b509c89f82')
    }],
    participants: [{
        id: parseUuid('23c90175-d16f-4d99-85ac-cc5d8b5fc89b'),
        createdBy: parseUuid('0f996867-84d2-46be-a083-f6b509c89f82'),
        status: "RESPONSIBLE"
    }]


}

});

describe('all function test', () => {
    it('the all function should return all persons in the repo', async () => {
        storageMock.all = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'collection', value: testTickets },
        });
        const result = await testTicketRepository.all(
            new DefaultRequestContext()
        );
        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(res.data.value).toStrictEqual(testTickets);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('find function test', () => {
    it('the find function should return a person with the associated ID', async () => {
        storageMock.findById = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'resource', value: testTicket },
        });
        const result = await testTicketRepository.find(
            parseUuid('5f922298-6219-4488-857a-e0d7bd711baf'),
            new DefaultRequestContext()
        );

        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(res.data.value).toStrictEqual(testTicket);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('create function test', () => {
    it('create should add a person object to the repo', async () => {
        storageMock.create = jest.fn(() => {
            return new Promise((resolve) => {
                testTickets.push(testNewTicket);
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: testNewTicket },
                });
            });
        });
        storageMock.all = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'resourceCollection', value: testTickets },
        });

        const repoSize = testTickets.length;
        await testTicketRepository.create(
            testNewTicket,
            new DefaultRequestContext()
        );

        const result = await testTicketRepository.all(
            new DefaultRequestContext()
        );
        match(result).with(
            { type: 'ok', data: { type: 'collection' } },
            (res) => {
                testTickets = res.data.value;
                let newRepoSize = testTickets.length;
                newRepoSize--;
                expect(newRepoSize).toBe(repoSize);
            }
        );
    });
});

describe('update function test', () => {
    it('saving a person object should return an updated person', async () => {
        storageMock.save = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'resource', value: testUpdateTicket },
        });
        const result = await testTicketRepository.update(
            parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
            testUpdateTicket,
            testRequestContext
        );

        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(res.data.value).toBe(testUpdateTicket);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('delete function test', () => {
    it('deleting a person by id should remove person at found index', async () => {
        storageMock.delete = jest.fn((id: string) => {
            return new Promise((resolve) => {
                const result = testTickets.find((ticket: Tickets) => {
                    return ticket.id === id;
                });
                if (result != undefined) {
                    const index = testTickets.indexOf(result, 0);
                    if (index > -1) {
                        testTickets.splice(index, 1);
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
        await testTicketRepository.delete(
            parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
            testRequestContext
        );

        const result = await testTicketRepository.delete(
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
            testTicketRepository = new TicketRepository(undefined);
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError).toHaveProperty(
            'reason',
            Constants.errors.repository.ticket.storageProvider.undefined.MESSAGE
        );
        expect(thrownError).toHaveProperty(
            'code',
            Constants.errors.repository.ticket.storageProvider.undefined.CODE
        );
        expect(thrownError).toHaveProperty('instance');
        expect(thrownError).toHaveProperty('pointer', '');
        expect(thrownError).toHaveProperty(
            'title',
            Constants.errors.repository.ticket.storageProvider.undefined.TITLE
        );
    });
});
