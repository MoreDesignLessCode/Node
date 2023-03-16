import {
    Constants,
    GeneralAPIError,
    Contact,
    ContactRepository,
    ContactService,
} from '../index';
import {
    Uuid,
    IContext,
    DefaultRequestContext,
} from '@procter-gamble/apip-api-types';
import { match } from 'ts-pattern';

const repositoryMock = jest.genMockFromModule<ContactRepository>(
    '../repositories/contact.repo'
);
let fixture: ContactService;
const contact: Contact = {
    id: Uuid(),
    personId: Uuid(),
    type: 'urn:mailto',
    value: 'developer.jd@pg.com',
};

const context: IContext = new DefaultRequestContext();
context.set<string>('authorization:token:sub', contact.id);

beforeEach(() => {
    jest.clearAllMocks();
    fixture = new ContactService(repositoryMock);
});

describe('ContactService all tests', () => {
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

describe('ContactService getById tests', () => {
    it.each`
        testName  | contact    | mockResolvedValue
        ${'ok'}   | ${contact} | ${{ type: 'ok', data: { type: 'resource', value: contact } }}
        ${'fail'} | ${contact} | ${{ type: 'error', data: Error('Service Error') }}
    `('$testName', async ({ contact, mockResolvedValue }) => {
        repositoryMock.find = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.getById(contact.id, context);

        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(repositoryMock.find).toHaveBeenCalled();
                expect(res.data.value).toEqual(contact);
            })
            .with({ type: 'error' }, (res) => {
                expect(res.data.reason === 'Service Error');
            })
            .exhaustive();
    });
});

describe('ContactService add tests', () => {
    it.each`
        testName  | contact    | mockResolvedValue
        ${'ok'}   | ${contact} | ${{ type: 'ok', data: { type: 'resource', value: contact } }}
        ${'fail'} | ${contact} | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}
    `('$testName', async ({ contact, mockResolvedValue }) => {
        repositoryMock.create = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.create(
            contact,
            new DefaultRequestContext()
        );
        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(repositoryMock.create).toHaveBeenCalled();
                expect(res.data.value).toEqual(contact);
            })
            .with({ type: 'error' }, (res) => {
                expect(res.data.code).toEqual(
                    Constants.errors.generalError.CODE
                );
            })
            .exhaustive();
    });
});

describe('ContactService update tests', () => {
    it.each`
        testName  | contact    | mockResolvedValue
        ${'ok'}   | ${contact} | ${{ type: 'ok', data: { type: 'resource', value: contact } }}
        ${'fail'} | ${contact} | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}
    `('$testName', async ({ contact, mockResolvedValue }) => {
        repositoryMock.update = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.update(contact.id, contact, context);
        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(repositoryMock.update).toHaveBeenCalled();
                expect(res.data.value).toEqual(contact);
            })
            .with({ type: 'error' }, (res) => {
                expect(res.data.code).toEqual(
                    Constants.errors.generalError.CODE
                );
            })
            .exhaustive();
    });
});

describe('ContactService delete tests', () => {
    it.each`
        testName  | contact    | mockResolvedValue
        ${'ok'}   | ${contact} | ${{ type: 'ok', data: { type: 'resource', value: contact } }}
        ${'fail'} | ${contact} | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}
    `('$testName', async ({ contact, mockResolvedValue }) => {
        repositoryMock.delete = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.delete(contact.id, context);
        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(repositoryMock.delete).toHaveBeenCalled();
                expect(res.data.value).toEqual(contact);
            })
            .with({ type: 'error' }, (res) => {
                expect(res.data.code).toEqual(
                    Constants.errors.generalError.CODE
                );
            })
            .exhaustive();
    });
});
