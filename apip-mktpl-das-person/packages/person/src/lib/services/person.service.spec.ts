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

beforeEach(() => {
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
        ${'fail'} | ${person} | ${{ type: 'error', data: Error('Service Error') }}
    `('$testName', async ({ person, mockResolvedValue }) => {
        repositoryMock.find = jest.fn().mockResolvedValue(mockResolvedValue);
        const result = await fixture.getById(person.id, context);

        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(repositoryMock.find).toHaveBeenCalled();
                expect(res.data.value).toEqual(person);
            })
            .with({ type: 'error' }, (res) => {
                expect(res.data.reason === 'Service Error');
            })
            .exhaustive();
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
        matchOkOrError(repositoryMock.create, result, person);
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
        matchOkOrError(repositoryMock.update, result, person);
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
        matchOkOrError(repositoryMock.delete, result, person);
    });
});

const matchOkOrError = (
    mockFunction: unknown,
    result: Result<Person>,
    person: unknown
): void => {
    match(result)
        .with({ type: 'ok' }, (res) => {
            expect(mockFunction).toHaveBeenCalled();
            expect(res.data.value).toEqual(person);
        })
        .with({ type: 'error' }, (res) => {
            expect(res.data.code).toEqual(Constants.errors.generalError.CODE);
        })
        .exhaustive();
};
