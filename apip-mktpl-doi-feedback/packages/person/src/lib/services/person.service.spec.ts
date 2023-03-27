import {
    Uuid,
    IContext,
    DefaultRequestContext,
    Result,
} from '@cvshealth/apip-api-types';
import { match } from 'ts-pattern';
import { GeneralAPIError } from '../errors/general.api.error';
import { Constants } from '../models/constants';
import { Person } from '../models/person';
import { PersonRepository } from '../repositories/person.repo';
import { PersonService } from './person.service';

const repositoryMock = jest.genMockFromModule<PersonRepository>(
    '../repositories/person.repo'
);
let fixture: PersonService;
const person: Person = {
    id: Uuid(),
    name: {
        display: 'Joe Developer',
        given: 'Joe',
        middle: '',
        family: 'Developer',
    },
};

const context: IContext = new DefaultRequestContext();
context.set<string>('authorization:token:sub', person.id);

beforeEach(async () => {
    jest.clearAllMocks();
    fixture = new PersonService(repositoryMock);
});

describe('PersonService all tests', () => {
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

describe('PersonService getById tests', () => {
    it.each`
        testName  | person    | mockResolvedValue
        ${'ok'}   | ${person} | ${{ type: 'ok', data: { type: 'resource', value: person } }}
        ${'fail'} | ${person} | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}
    `('$testName', async ({ person, mockResolvedValue }) => {
        repositoryMock.find = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.getById(person.id, context);
        matchOkOrErrorWithMockFn(result, person, repositoryMock.find);
    });
});

describe('PersonService add tests', () => {
    it.each`
        testName  | person    | mockResolvedValue
        ${'ok'}   | ${person} | ${{ type: 'ok', data: { type: 'resource', value: person } }}
        ${'fail'} | ${person} | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}
    `('$testName', async ({ person, mockResolvedValue }) => {
        repositoryMock.create = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.create(
            person,
            new DefaultRequestContext()
        );
        matchOkOrErrorWithMockFn(result, person, repositoryMock.create);
    });
});

describe('PersonService update tests', () => {
    it.each`
        testName  | person    | mockResolvedValue
        ${'ok'}   | ${person} | ${{ type: 'ok', data: { type: 'resource', value: person } }}
        ${'fail'} | ${person} | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}
    `('$testName', async ({ person, mockResolvedValue }) => {
        repositoryMock.update = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.update(person.id, person, context);
        matchOkOrErrorWithMockFn(result, person, repositoryMock.update);
    });
});

describe('PersonService delete tests', () => {
    it.each`
        testName  | person    | mockResolvedValue
        ${'ok'}   | ${person} | ${{ type: 'ok', data: { type: 'resource', value: person } }}
        ${'fail'} | ${person} | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}
    `('$testName', async ({ person, mockResolvedValue }) => {
        repositoryMock.delete = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.delete(person.id, context);
        matchOkOrErrorWithMockFn(result, person, repositoryMock.delete);
    });
});

const matchOkOrErrorWithMockFn = (
    result: Result<Person>,
    person: unknown,
    mockFn: unknown
) => {
    match(result)
        .with({ type: 'ok' }, (res) => {
            expect(mockFn).toHaveBeenCalled();
            expect(res.data.value).toEqual(person);
        })
        .with({ type: 'error' }, (res) => {
            expect(res.data.code).toEqual(Constants.errors.generalError.CODE);
        })
        .exhaustive();
};
