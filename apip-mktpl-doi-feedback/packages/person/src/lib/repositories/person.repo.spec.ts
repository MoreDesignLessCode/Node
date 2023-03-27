import {
    parseUuid,
    DefaultRequestContext,
    IContext,
} from '@cvshealth/apip-api-types';
import { GeneralAPIError } from '../errors';
import { PersonRepository } from './person.repo';
import { match } from 'ts-pattern';
import { Person, Constants } from '../models';
import { PersonMemoryStorageProvider } from '../providers';
import {
    testPersonsData,
    testUpdatePersonData,
    testPersonData,
    testNewPersonData,
} from '../utils';

let testPersonRepository: PersonRepository;
let testPersons: Person[] = testPersonsData;
const testUpdatePerson: Person = testUpdatePersonData;
const testPerson: Person = testPersonData;
const testNewPerson: Person = testNewPersonData;
let testRequestContext: IContext;

const storageMock = jest.genMockFromModule<PersonMemoryStorageProvider>(
    '../providers/storage/person.memory.storage.provider'
);

beforeEach(() => {
    jest.clearAllMocks();

    testPersonRepository = new PersonRepository(storageMock);
});

describe('all function test', () => {
    it('the all function should return all persons in the repo', async () => {
        storageMock.all = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'collection', value: testPersons },
        });
        const result = await testPersonRepository.all(
            new DefaultRequestContext()
        );
        match(result)
            .with({ type: 'ok' }, (result) => {
                expect(result.data.value).toStrictEqual(testPersons);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('find function test', () => {
    it('the find function should return a person with the associated ID', async () => {
        storageMock.findById = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'resource', value: testPerson },
        });
        const result = await testPersonRepository.find(
            parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
            new DefaultRequestContext()
        );

        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(res.data.value).toStrictEqual(testPerson);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('create function test', () => {
    it('create should add a person object to the repo', async () => {
        storageMock.create = jest.fn(() => {
            return new Promise((resolve) => {
                testPersons.push(testNewPerson);
                resolve({
                    type: 'ok',
                    data: { type: 'resource', value: testNewPerson },
                });
            });
        });
        storageMock.all = jest.fn().mockResolvedValue({
            type: 'ok',
            data: { type: 'resourceCollection', value: testPersons },
        });

        const repoSize = testPersons.length;
        await testPersonRepository.create(
            testNewPerson,
            new DefaultRequestContext()
        );

        const result = await testPersonRepository.all(
            new DefaultRequestContext()
        );
        match(result).with(
            { type: 'ok', data: { type: 'collection' } },
            (res) => {
                testPersons = res.data.value;
                let newRepoSize = testPersons.length;
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
            data: { type: 'resource', value: testUpdatePerson },
        });
        const result = await testPersonRepository.update(
            parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
            testUpdatePerson,
            testRequestContext
        );

        match(result)
            .with({ type: 'ok' }, (res) => {
                expect(res.data.value).toBe(testUpdatePerson);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('delete function test', () => {
    it('deleting a person by id should remove person at found index', async () => {
        storageMock.delete = jest.fn((id: string) => {
            return new Promise((resolve) => {
                const result = testPersons.find((person: Person) => {
                    return person.id === id;
                });
                if (result != undefined) {
                    const index = testPersons.indexOf(result, 0);
                    if (index > -1) {
                        testPersons.splice(index, 1);
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
        await testPersonRepository.delete(
            parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
            testRequestContext
        );

        const result = await testPersonRepository.delete(
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
            testPersonRepository = new PersonRepository(undefined);
        } catch (error) {
            thrownError = error;
        }

        expect(thrownError).toHaveProperty(
            'reason',
            Constants.errors.repository.person.storageProvider.undefined.MESSAGE
        );
        expect(thrownError).toHaveProperty(
            'code',
            Constants.errors.repository.person.storageProvider.undefined.CODE
        );
        expect(thrownError).toHaveProperty('instance');
        expect(thrownError).toHaveProperty('pointer', '');
        expect(thrownError).toHaveProperty(
            'title',
            Constants.errors.repository.person.storageProvider.undefined.TITLE
        );
    });
});
