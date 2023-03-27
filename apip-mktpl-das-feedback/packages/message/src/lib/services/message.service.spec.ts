import {
    Uuid,
    IContext,
    DefaultRequestContext,
    Result,
} from '@cvshealth/apip-api-types';
import { match } from 'ts-pattern';
import { GeneralAPIError } from '../errors/general.api.error';
import { Constants } from '../models/constants';
import { Messages } from '../models/message';
import { MessageRepository } from '../repositories/message.repo';
import { MessageService } from './message.service';

const repositoryMock = jest.genMockFromModule<MessageRepository>(
    '../repositories/message.repo'
);
let fixture: MessageService;
const message: Messages = {
    id: Uuid(),
    summary:"summary",
    description:'desc',
    status:"NEW"
};

const context: IContext = new DefaultRequestContext();
context.set<string>('authorization:token:sub', message.id);

beforeEach(() => {
    jest.clearAllMocks();
    fixture = new MessageService(repositoryMock);
});

describe('MessageService all tests', () => {
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

describe('MessageService getById tests', () => {
    it.each`
        testName  | message    | mockResolvedValue
        ${'ok'}   | ${message} | ${{ type: 'ok', data: { type: 'resource', value: message } }}
        ${'fail'} | ${message} | ${{ type: 'error', data: Error('Service Error') }}
    `('$testName', async ({ message, mockResolvedValue }) => {
        repositoryMock.find = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.getById(message.id, context);

        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(repositoryMock.find).toHaveBeenCalled();
                expect(res.data.value).toEqual(message);
            })
            .with({ type: 'error' }, (res) => {
                expect(res.data.reason === 'Service Error');
            })
            .exhaustive();
    });
});

describe('MessageService add tests', () => {
    it.each`
        testName  | message    | mockResolvedValue
        ${'ok'}   | ${message} | ${{ type: 'ok', data: { type: 'resource', value: message } }}
        ${'fail'} | ${message} | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}
    `('$testName', async ({ message, mockResolvedValue }) => {
        repositoryMock.create = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.create(
            message,
            new DefaultRequestContext()
        );
        matchOkOrError(repositoryMock.create, result, message);
    });
});

describe('MessageService update tests', () => {
    it.each`
        testName  | message    | mockResolvedValue
        ${'ok'}   | ${message} | ${{ type: 'ok', data: { type: 'resource', value: message } }}
        ${'fail'} | ${message} | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}
    `('$testName', async ({ message, mockResolvedValue }) => {
        repositoryMock.update = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.update(message.id, message, context);
        matchOkOrError(repositoryMock.update, result, message);
    });
});

describe('MessageService delete tests', () => {
    it.each`
        testName  | message    | mockResolvedValue
        ${'ok'}   | ${message} | ${{ type: 'ok', data: { type: 'resource', value: message } }}
        ${'fail'} | ${message} | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}
    `('$testName', async ({ message, mockResolvedValue }) => {
        repositoryMock.delete = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.delete(message.id, context);
        matchOkOrError(repositoryMock.delete, result, message);
    });
});

const matchOkOrError = (
    mockFunction: unknown,
    result: Result<Messages>,
    message: unknown
): void => {
    match(result)
        .with({ type: 'ok' }, (res) => {
            expect(mockFunction).toHaveBeenCalled();
            expect(res.data.value).toEqual(message);
        })
        .with({ type: 'error' }, (res) => {
            expect(res.data.code).toEqual(Constants.errors.generalError.CODE);
        })
        .exhaustive();
};
