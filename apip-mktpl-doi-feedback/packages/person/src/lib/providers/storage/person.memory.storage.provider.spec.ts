import { match } from 'ts-pattern';
import {
    DefaultRequestContext,
    parseUuid,
} from '@cvshealth/apip-api-types';
import {
    testPersonsData,
    testUpdatePersonData,
    testPersonData,
    testNewPersonData,
    formatString,
} from '../../utils';
import { PersonMemoryStorageProvider } from './person.memory.storage.provider';
import { Person } from '../../models/person';
import { Constants } from '../../models/constants';

let testStorageProvider: PersonMemoryStorageProvider;
const testPersons: Person[] = testPersonsData;
const testUpdatePerson: Person = testUpdatePersonData;
const testPerson: Person = testPersonData;
const testNewPerson: Person = testNewPersonData;

beforeEach(async () => {
    testStorageProvider = new PersonMemoryStorageProvider(testPersons);
});

describe('all function test', () => {
    it('the all function should return all persons in the repo', async () => {
        const result = await testStorageProvider.all(
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
    it.each`
        testName                         | id
        ${'ok when id does exist'}       | ${parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7')}
        ${'fail when id does not exist'} | ${parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3aba')}
    `('$testName', async ({ id }) => {
        const result = await testStorageProvider.findById(
            id,
            new DefaultRequestContext()
        );

        match(result)
            .with({ type: 'ok' }, (result) => {
                expect(result.data.value).toStrictEqual(testPerson);
            })
            .with({ type: 'error' }, (result) => {
                expect(result.data.reason).toEqual(
                    formatString(Constants.errors.notFound.person.MESSAGE, id)
                );
            })
            .exhaustive();
    });
});

describe('create function test', () => {
    it('create should add a person object to the repo', async () => {
        const person = await testStorageProvider.create(
            testNewPerson,
            new DefaultRequestContext()
        );

        match(person)
            .with({ type: 'ok' }, () => {
                // ok
            })
            .with({ type: 'error' }, () => {
                expect(false).toBe(true);
            })
            .exhaustive();

        const result = await testStorageProvider.all(
            new DefaultRequestContext()
        );
        match(result)
            .with({ type: 'ok' }, (result) => {
                expect(result.data.value).toContainEqual(testNewPerson);
            })
            .with({ type: 'error' }, () => {
                expect(false).toBe(true);
            })
            .exhaustive();
    });
});

describe('save function test', () => {
    it('saving a person object should return an updated person', async () => {
        const result = await testStorageProvider.save(
            parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
            testUpdatePerson,
            new DefaultRequestContext()
        );
        match(result)
            .with({ type: 'ok' }, (result) => {
                expect(result.data.value).toBe(testUpdatePerson);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });

    it("should fail if it can't match id", async () => {
        const id = parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b8');
        const result = await testStorageProvider.save(
            id,
            testUpdatePerson,
            new DefaultRequestContext()
        );
        match(result)
            .with({ type: 'error' }, (result) => {
                expect(result.data.reason).toEqual(
                    formatString(Constants.errors.notFound.person.MESSAGE, id)
                );
            })
            .with({ type: 'ok' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('delete function test', () => {
    it.each`
        testName                         | id
        ${'ok when id does exist'}       | ${parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7')}
        ${'fail when id does not exist'} | ${parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab8')}
    `('$testName', async ({ id }) => {
        const result1 = await testStorageProvider.delete(
            id,
            new DefaultRequestContext()
        );
        match(result1)
            .with({ type: 'ok' }, () => {
                // ok
            })
            .with({ type: 'error' }, (result) => {
                expect(result.data.reason).toEqual(
                    formatString(Constants.errors.notFound.person.MESSAGE, id)
                );
            });

        const result2 = await testStorageProvider.delete(
            id,
            new DefaultRequestContext()
        );
        match(result2)
            .with({ type: 'error' }, (result) => {
                expect(result.data.reason).toEqual(
                    formatString(Constants.errors.notFound.person.MESSAGE, id)
                );
            })
            .with({ type: 'ok' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});
