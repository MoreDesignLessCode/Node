import { match } from 'ts-pattern';
import {
    APIError,
    DefaultRequestContext,
    IContext,
    parseUuid,
} from '@cvshealth/apip-api-types';
import * as dotenv from 'dotenv';
import * as Pg from 'pg';
import { PersonPgStorageProvider } from './person.pg.storage.provider';
import { Person } from '../../models/person';
import { formatString } from '../../utils/format.string';
import { Constants } from '../../models/constants';
import { ResourceNotFoundError } from '../../errors/resource.not.found.error';

dotenv.config();

let testStorageProvider: PersonPgStorageProvider;
let testPerson: Person;
let testNewPerson: Person;
let context: IContext;

beforeAll(async () => {
    testStorageProvider = new PersonPgStorageProvider();
    const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ZDVlMjY0Mi1mMWM2LTRjMzYtOWY4MS1iNmVkOWFlMTQ4MjkiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.J7Wu0q_ROzCTTjkFfd_2PxOX9w-YPJKFYZ_yb3fGTjA';
    context = new DefaultRequestContext();
    context.set(
        'auth:claims',
        JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    );
    context.set('auth:token', token);
});

afterAll(async () => {
    await testStorageProvider.client.end();
});

afterEach(async () => {
    // clear test data from DB
    const client: Pg.Client = connectToDatabase();
    await client.query(
        "DELETE FROM mktpl.person WHERE id='728cb5aa-9eb1-4d61-a81d-9ef3026c3ab8';"
    );
    await client.query(
        "DELETE FROM mktpl.person WHERE id='57f10413-e9de-4f6d-ac11-4f4bc6ee40d3';"
    );

    client.end();
});

beforeEach(async () => {
    jest.clearAllMocks();

    const client: Pg.Client = connectToDatabase();
    await client.query(
        "INSERT INTO mktpl.person (id, given_name, middle_name, family_name, created_at, created_by) VALUES('57f10413-e9de-4f6d-ac11-4f4bc6ee40d3', 'DO NOT', '', 'DELETE', NOW(), '57f10413-e9de-4f6d-ac11-4f4bc6ee40d3');"
    );
    client.end();

    testPerson = {
        id: parseUuid('57f10413-e9de-4f6d-ac11-4f4bc6ee40d3'),
        name: {
            display: 'DO NOT DELETE',
            given: 'DO NOT',
            middle: '',
            family: 'DELETE',
        },
    };
    testNewPerson = {
        id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab8'),
        name: {
            display: 'Joe Schmoe',
            given: 'Joe',
            middle: '',
            family: 'Schmoe',
        },
    };
});

const maybe = process.env.PERSON_DAS_JEST_ALLOW_INTEG
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
            ${'ok when id does exist'}       | ${parseUuid('57f10413-e9de-4f6d-ac11-4f4bc6ee40d3')}
            ${'fail when id does not exist'} | ${parseUuid('57f10413-e9de-4f6d-ac11-4f4bc6ee40da')}
        `('$testName', async ({ id }) => {
            const result = await testStorageProvider.findById(id, context);
            match(result)
                .with({ type: 'ok' }, (res) => {
                    expect(res.data.value).toEqual(testPerson);
                })
                .with({ type: 'error' }, () => {
                    expect((result.data as APIError).reason).toEqual(
                        formatString(
                            Constants.errors.notFound.person.MESSAGE,
                            id
                        )
                    );
                })
                .exhaustive();
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
            testPerson.name.family = 'UPDATE';

            const result = await testStorageProvider.save(
                parseUuid('57f10413-e9de-4f6d-ac11-4f4bc6ee40d3'),
                testPerson,
                context
            );
            match(result)
                .with({ type: 'ok', data: { type: 'resource' } }, (result) => {
                    expect(result.data.value.name.family).toBe('UPDATE');
                })
                .with({ type: 'ok', data: { type: 'collection' } }, () =>
                    expect(false).toBe(true)
                )
                .with({ type: 'error' }, () => expect(false).toBe(true))
                .exhaustive();
        });

        it("should fail if it can't match id", async () => {
            const id = parseUuid('57f10413-e9de-4f6d-ac11-4f4bc6ee40da');
            match(await testStorageProvider.save(id, testPerson, context))
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
            ${'ok when id does exist'}       | ${parseUuid('57f10413-e9de-4f6d-ac11-4f4bc6ee40d3')}
            ${'fail when id does not exist'} | ${parseUuid('57f10413-e9de-4f6d-ac11-4f4bc6ee40da')}
        `('$testName', async ({ id }) => {
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

const connectToDatabase = (): Pg.Client => {
    const connString = `postgresql://${process.env.PERSON_DAS_DB_USER}:${process.env.PERSON_DAS_DB_PASSWORD}@${process.env.PERSON_DAS_DB_HOST}:${process.env.PERSON_DAS_DB_PORT}/${process.env.PERSON_DAS_DB_NAME}`;

    const client: Pg.Client = new Pg.Client({
        connectionString: connString,
    });
    client.connect();
    return client;
};
