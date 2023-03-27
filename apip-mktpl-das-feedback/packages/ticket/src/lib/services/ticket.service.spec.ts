import {
    Uuid,
    IContext,
    DefaultRequestContext,
    Result,
} from '@cvshealth/apip-api-types';
import { match } from 'ts-pattern';
import { GeneralAPIError } from '../errors/general.api.error';
import { Tickets } from '../models';
import { Constants } from '../models/constants';
import { TicketRepository } from '../repositories/ticket.repo';
import { TicketService } from './ticket.service';


const repositoryMock = jest.genMockFromModule<TicketRepository>(
    '../repositories/ticket.repo'
);
let fixture: TicketService;
let msgId=Uuid()
let participantId=Uuid()
let createdBy=Uuid()
const tickets: Tickets = {
    id: Uuid(),
    createdBy:createdBy,
    status:"NEW",
    summary:"Summary of the message",
    description:"Description of the message",
    messageIds:[msgId],
    participantIds:[participantId],
    messages:[{
        id:msgId,
        summary:"Summary of the message",
        description:"Description of the message",
        status:"NEW",
        createdBy:createdBy
    }],
    participants:[{
        id:participantId,
        createdBy:createdBy,
        status:"RESPONSIBLE"
    }]
    
   
};

const context: IContext = new DefaultRequestContext();
context.set<string>('authorization:token:sub', tickets.id);

beforeEach(() => {
    jest.clearAllMocks();
    fixture = new TicketService(repositoryMock);
});

describe('TicketService all tests', () => {
    it.each`
        testName  | mockResolvedValue
        ${'ok'}   | ${{ type: 'ok', data: { type: 'collection', value: [] } }}
        ${'fail'} | ${{ type: 'error', data: Error('Service Error') }}
    `('$testName', async ({ mockResolvedValue }) => {
        repositoryMock.all = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.getCollection(context);

        match(result)
            .with({ type: 'ok' }, () => {
                expect(repositoryMock.all).toHaveBeenCalled();
            })
            .with({ type: 'error' }, (res) => {
                expect(res.data.reason === 'Service Error');
            })
            .exhaustive();
    });
});

describe('TicketService getById tests', () => {
    it.each`
        testName  | tickets    | mockResolvedValue
        ${'ok'}   | ${tickets} | ${{ type: 'ok', data: { type: 'resource', value: tickets } }}
        ${'fail'} | ${tickets} | ${{ type: 'error', data: Error('Service Error') }}
    `('$testName', async ({ tickets, mockResolvedValue }) => {
        repositoryMock.find = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.getById(tickets.id, context);

        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(repositoryMock.find).toHaveBeenCalled();
                expect(res.data.value).toEqual(tickets);
            })
            .with({ type: 'error' }, (res) => {
                expect(res.data.reason === 'Service Error');
            })
            .exhaustive();
    });
});

describe('TicketService add tests', () => {
    it.each`
        testName  | tickets    | mockResolvedValue
        ${'ok'}   | ${tickets} | ${{ type: 'ok', data: { type: 'resource', value: tickets } }}
        ${'fail'} | ${tickets} | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}
    `('$testName', async ({ tickets, mockResolvedValue }) => {
        repositoryMock.create = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.create(
            tickets,
            new DefaultRequestContext()
        );
        matchOkOrError(repositoryMock.create, result, tickets);
    });
});

describe('TicketService update tests', () => {
    it.each`
        testName  | tickets    | mockResolvedValue
        ${'ok'}   | ${tickets} | ${{ type: 'ok', data: { type: 'resource', value: tickets } }}
        ${'fail'} | ${tickets} | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}
    `('$testName', async ({ tickets, mockResolvedValue }) => {
        repositoryMock.update = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.update(tickets.id, tickets, context);
        matchOkOrError(repositoryMock.update, result, tickets);
    });
});

describe('TicketService delete tests', () => {
    it.each`
        testName  | tickets    | mockResolvedValue
        ${'ok'}   | ${tickets} | ${{ type: 'ok', data: { type: 'resource', value: tickets } }}
        ${'fail'} | ${tickets} | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}
    `('$testName', async ({ tickets, mockResolvedValue }) => {
        repositoryMock.delete = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.delete(tickets.id, context);
        matchOkOrError(repositoryMock.delete, result, tickets);
    });
});

const matchOkOrError = (
    mockFunction: unknown,
    result: Result<Tickets>,
    tickets: unknown
): void => {
    match(result)
        .with({ type: 'ok' }, (res) => {
            expect(mockFunction).toHaveBeenCalled();
            expect(res.data.value).toEqual(tickets);
        })
        .with({ type: 'error' }, (res) => {
            expect(res.data.code).toEqual(Constants.errors.generalError.CODE);
        })
        .exhaustive();
};
