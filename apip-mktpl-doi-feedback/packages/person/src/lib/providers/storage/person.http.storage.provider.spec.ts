import { match } from 'ts-pattern';
import {
    APIError,
    DefaultRequestContext,
    IContext,
    parseUuid,
    Result,
    Uuid,
} from '@cvshealth/apip-api-types';
import * as dotenv from 'dotenv';
import { PersonHttpStorageProvider } from './person.http.storage.provider';
import { Person } from '../../models/person';
import { formatString } from '../../utils/format.string';
import { Constants } from '../../models/constants';
import { ResourceNotFoundError } from '../../errors/resource.not.found.error';
import { createSigner } from 'fast-jwt';

dotenv.config();

let testStorageProvider: PersonHttpStorageProvider;
let testPerson: Person;
let testNewPerson: Person;
let context: IContext;
let testId: Uuid;
const baseUrl = process.env.PERSON_DAS_BASE_URL;

/*
    TODO: update to spin up a simple fastify instance that listens 
    on these urls and spits back dummy data to enable unit testing 
    of the code without full integration.

    These existing full integration tests will remain, and be 
    controlled by the environment variable, but the new tests against 
    a dummy DAS server can run every time. 
*/
beforeAll(async () => {
    testStorageProvider = new PersonHttpStorageProvider();
    const secret =
        'e98256815795d097dc84594fe5bcf6c55d90d11f04b25e814c7a4bff90667bfb';
    const claims = {
        sub: '9d5e2642-f1c6-4c36-9f81-b6ed9ae14829',
        name: 'A Person',
        aud: 'app-1',
    };

    const validSigner = createSigner({ key: secret, expiresIn: 300000 });
    const token = validSigner(claims);
    context = new DefaultRequestContext();
    context.set(
        'auth:claims',
        JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    );
    context.set('auth:token', token);
});

beforeEach(async () => {
    jest.clearAllMocks();

    testId = Uuid();
    testPerson = {
        id: testId,
        name: {
            display: 'AUTOMATED TEST',
            given: 'AUTOMATED',
            middle: '',
            family: 'TEST',
        },
    };
    testNewPerson = {
        id: Uuid(),
        name: {
            display: 'AUTOMATED TEST',
            given: 'AUTOMATED',
            middle: '',
            family: 'TEST',
        },
    };

    await addTestPerson(baseUrl, testPerson);
});

afterEach(async () => {
    await deleteTestPerson(baseUrl, testPerson);
    await deleteTestPerson(baseUrl, testNewPerson);
});

const maybe =
    process.env.PERSON_DOI_JEST_ALLOW_INTEGRATION === 'true'
        ? describe
        : describe.skip;

maybe('Integration Tests', () => {
    describe('all function test', () => {
        it('the all function should return all persons in the repo', async () => {
            const result = await testStorageProvider.all(context);
            match(result)
                .with({ type: 'ok' }, (res) => {
                    expect(res.data.value).toContainEqual(testPerson);
                })
                .with({ type: 'error' }, () => {
                    expect(false).toBe(true);
                })
                .exhaustive();
        });
    });

    describe('find function test', () => {
        it.each`
            testName                         | id
            ${'ok when id does exist'}       | ${'testId'}
            ${'fail when id does not exist'} | ${parseUuid('57f10413-e9de-4f6d-ac11-4f4bc6ee40da')}
        `('$testName', async ({ id }) => {
            if (id === 'testId') {
                id = testId;
            }
            const result = await testStorageProvider.findById(id, context);
            matchOkOrError(result, id);
        });
    });

    describe('create function test', () => {
        it('create should add a person object to the repo', async () => {
            const person = await testStorageProvider.create(
                testNewPerson,
                context
            );

            match(person)
                .with({ type: 'ok' }, () => {
                    // ok
                })
                .with({ type: 'error' }, () => {
                    expect(false).toBe(true);
                })
                .exhaustive();

            const result = await testStorageProvider.all(context);
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
            testPerson.name.middle = 'UPDATE';

            const result = await testStorageProvider.save(
                testId,
                testPerson,
                context
            );
            match(result)
                .with({ type: 'ok', data: { type: 'resource' } }, (result) => {
                    expect(result.data.value.name.middle).toBe('UPDATE');
                })
                .with({ type: 'ok', data: { type: 'collection' } }, () =>
                    expect(false).toBe(true)
                )
                .with({ type: 'error' }, () => expect(false).toBe(true))
                .exhaustive();
        });

        it('should fail if it cant match id', async () => {
            const id = parseUuid('57f10413-e9de-4f6d-ac11-4f4bc6ee40da');
            const result = await testStorageProvider.save(
                id,
                testPerson,
                context
            );
            match(result)
                .with({ type: 'error' }, (result) => {
                    expect(result.data.reason).toEqual(
                        formatString(
                            Constants.errors.notFound.person.MESSAGE,
                            id
                        )
                    );
                })
                .with({ type: 'ok' }, () => expect(false).toBe(true))
                .exhaustive();
        });
    });

    describe('delete function test', () => {
        it.each`
            testName                         | id
            ${'ok when id does exist'}       | ${'testId'}
            ${'fail when id does not exist'} | ${parseUuid('57f10413-e9de-4f6d-ac11-4f4bc6ee40da')}
        `('$testName', async ({ id }) => {
            if (id === 'testId') {
                id = testId;
            }
            const result1 = await testStorageProvider.delete(id, context);
            match(result1)
                .with({ type: 'ok' }, () => {
                    // ok
                })
                .with({ type: 'error' }, (res) => {
                    expect(res.data).toBeInstanceOf(ResourceNotFoundError);
                });

            const result2 = await testStorageProvider.delete(id, context);
            match(result2)
                .with({ type: 'error' }, (res) => {
                    expect(res.data).toBeInstanceOf(ResourceNotFoundError);
                })
                .with({ type: 'ok' }, () => {
                    expect(false).toBe(true);
                })
                .exhaustive();
        });
    });
});

const addTestPerson = async (baseUrl: string, testPerson: Person) => {
    const token = context.get('auth:token');
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    await fetch(`${baseUrl}/persons`, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPerson),
    });
};

const deleteTestPerson = async (baseUrl: string, testPerson: Person) => {
    const token = context.get('auth:token');

    const headers = { Authorization: `Bearer ${token}` };
    await fetch(`${baseUrl}/persons/${testPerson.id}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify(testPerson),
    });
};

const matchOkOrError = (result: Result<Person>, id: Uuid) => {
    match(result)
        .with({ type: 'ok' }, (res) => {
            expect(res.data.value).toEqual([testPerson]);
        })
        .with({ type: 'error' }, () => {
            expect((result.data as APIError).reason).toEqual(
                formatString(Constants.errors.notFound.person.MESSAGE, id)
            );
        })
        .exhaustive();
};
