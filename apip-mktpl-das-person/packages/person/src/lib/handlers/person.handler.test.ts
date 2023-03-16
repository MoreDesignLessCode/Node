import {
    FastifyHttpProvider,
    parseUuid,
    Uuid,
} from '@procter-gamble/apip-api-types';
import { validate as uuidValidate } from 'uuid';
import { Response } from 'light-my-request';
import { fastifyRequestContextMiddleware } from '@procter-gamble/apip-context-middleware';
import { JwtMiddleware, JwtOptions } from '@procter-gamble/apip-jwt-middleware';
import { createSigner } from 'fast-jwt';
import { PersonService } from '../services/person.service';
import { PersonRouter } from './person.router';
import { PersonHandler } from './person.handler';
import { ResourceNotFoundError } from '../errors/resource.not.found.error';
import { GeneralAPIError } from '../errors/general.api.error';
import { Constants } from '../models/constants';
import { formatString } from '../utils/format.string';

const serviceMock = jest.genMockFromModule<PersonService>(
    '../services/person.service'
);

const person = {
    id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
    name: {
        display: 'Joe Developer',
        given: 'Joe',
        middle: '',
        family: 'Developer',
    },
};

const invalidPerson = {
    id: '5',
    name: {
        display: 'Joe Developer',
        given: 'Joe',
        middle: '',
        family: 'Developer',
    },
};
let Runtime: FastifyHttpProvider;
const secret =
    'e98256815795d097dc84594fe5bcf6c55d90d11f04b25e814c7a4bff90667bfb';
const claims = {
    sub: '9d5e2642-f1c6-4c36-9f81-b6ed9ae14829',
    name: 'A Person',
    aud: 'app-1',
};
const validSigner = createSigner({ key: secret, expiresIn: 300000 });

beforeEach(async () => {
    jest.clearAllMocks();
    Runtime = new FastifyHttpProvider({});

    await Runtime.instance.register(fastifyRequestContextMiddleware);
    await Runtime.instance.register(JwtMiddleware, {
        key: 'e98256815795d097dc84594fe5bcf6c55d90d11f04b25e814c7a4bff90667bfb',
        errorHandler: (err, reply) => {
            reply.log.error(err);
            reply.status(401).send({ unauthorized: 'you' });
        },
    } as JwtOptions);

    new PersonRouter(Runtime, new PersonHandler(serviceMock));

    await Runtime.instance.ready();
});

describe('PersonHandler get tests', () => {
    it.each`
        testName                        | person                  | expectedStatusCode | serviceMockReturn                                                                                                                                                                                                                                         | expectedError                                                                                                                                                                   | token
        ${'401 without Jwt'}            | ${[person]}             | ${401}             | ${{ type: 'ok', data: { type: 'resource', value: person } }}                                                                                                                                                                                              | ${{ unauthorized: 'you' }}                                                                                                                                                      | ${null}
        ${'200 with Jwt'}               | ${[person]}             | ${200}             | ${{ type: 'ok', data: { type: 'resource', value: person } }}                                                                                                                                                                                              | ${null}                                                                                                                                                                         | ${validSigner(claims)}
        ${'200 when no objects return'} | ${[]}                   | ${200}             | ${{ type: 'error', data: new ResourceNotFoundError(Constants.errors.notFound.person.CODE).withTitle(Constants.errors.notFound.person.TITLE).withReason(formatString(Constants.errors.notFound.person.MESSAGE, '728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7')) }} | ${null}                                                                                                                                                                         | ${validSigner(claims)}
        ${'400 with invalidId'}         | ${[{ id: 'not-uuid' }]} | ${400}             | ${null}                                                                                                                                                                                                                                                   | ${null}                                                                                                                                                                         | ${validSigner(claims)}
        ${'400 when service error'}     | ${[]}                   | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}                                                                                                                                                                       | ${{ reason: 'GENERAL API ERROR', code: Constants.errors.generalError.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }} | ${validSigner(claims)}
    `(
        '$testName',
        async ({
            person,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
            token,
        }) => {
            serviceMock.getById = jest
                .fn()
                .mockResolvedValue(serviceMockReturn);
            let id = person[0]?.id;
            if (id !== 'not-uuid' && !uuidValidate(id)) {
                id = Uuid();
            }
            let response: Response;
            if (token) {
                const headers = {
                    authorization: `Bearer ${token}`,
                };
                response = await Runtime.instance.inject({
                    method: 'GET',
                    url: `/persons/${id}`,
                    headers: headers,
                });
            } else {
                response = await Runtime.instance.inject({
                    method: 'GET',
                    url: `/persons/${person.id}`,
                });
            }

            expect(response.statusCode).toEqual(expectedStatusCode);
            const payload = JSON.parse(response.payload);
            if (expectedStatusCode == 200) {
                expect(payload).toEqual(person);
            } else if (expectedStatusCode == 401) {
                for (const [key, value] of Object.entries(expectedError)) {
                    if (key === 'rootCauses') {
                        for (const [key, value] of Object.entries(
                            expectedError.rootCauses[0]
                        )) {
                            if (value === 'exists') {
                                expect(payload).toHaveProperty(key);
                            } else {
                                expect(payload).toHaveProperty(key, value);
                            }
                        }
                    } else {
                        if (value === 'exists') {
                            expect(payload).toHaveProperty(key);
                        } else {
                            expect(payload).toHaveProperty(key, value);
                        }
                    }
                }
            } else {
                if (expectedError) {
                    checkProperties(expectedError, payload);
                }
            }
        }
    );
});

describe('PersonHandler getCollection tests', () => {
    it.each`
        testName                     | person      | expectedStatusCode | serviceMockReturn                                                                                                                                                                                                                              | expectedError
        ${'200 with value'}          | ${[person]} | ${200}             | ${{ type: 'ok', data: { type: 'collection', value: [person] } }}                                                                                                                                                                               | ${null}
        ${'200 with no value'}       | ${[]}       | ${200}             | ${{ type: 'ok', data: { type: 'collection', value: [] } }}                                                                                                                                                                                     | ${null}
        ${'400 when service errors'} | ${[]}       | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.repo.person.storageProvider.undefined.CODE, '', Constants.errors.repo.person.storageProvider.undefined.TITLE, Constants.errors.repo.person.storageProvider.undefined.MESSAGE) }} | ${{ reason: 'GENERAL API ERROR', code: Constants.errors.repo.person.storageProvider.undefined.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }}
    `(
        '$testName',
        async ({
            person,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
        }) => {
            serviceMock.getCollection = jest
                .fn()
                .mockResolvedValue(serviceMockReturn);
            const response = await Runtime.instance.inject({
                method: 'GET',
                url: '/persons',
                headers: {
                    authorization: `Bearer ${validSigner(claims)}`,
                },
            });
            easyChecks(response, expectedStatusCode, person, expectedError);
        }
    );
});

describe('PersonHandler post tests', () => {
    it.each`
        testName                     | person           | expectedStatusCode | serviceMockReturn                                                                                                                                                                    | expectedError
        ${'201 with Valid person'}   | ${person}        | ${201}             | ${{ type: 'ok', data: { type: 'resource', value: person } }}                                                                                                                         | ${null}
        ${'400 with Invalid person'} | ${invalidPerson} | ${400}             | ${{ type: 'ok', data: { type: 'resource', value: person } }}                                                                                                                         | ${{ reason: Constants.errors.validation.person.create.MESSAGE, code: Constants.errors.validation.person.create.CODE, instance: 'exists', pointer: '', title: Constants.errors.validation.person.create.TITLE, rootCauses: 'exists' }}
        ${'400 with service error'}  | ${person}        | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE).withReason(Constants.errors.generalError.MESSAGE).withTitle(Constants.errors.generalError.TITLE) }} | ${{ reason: Constants.errors.generalError.MESSAGE, code: Constants.errors.generalError.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }}
    `(
        '$testName',
        async ({
            person,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
        }) => {
            serviceMock.create = jest.fn().mockResolvedValue(serviceMockReturn);
            const response = await Runtime.instance.inject({
                method: 'POST',
                url: '/persons',
                headers: {
                    authorization: `Bearer ${validSigner(claims)}`,
                },
                payload: person,
            });
            expect(response.statusCode).toEqual(expectedStatusCode);
            const payload = JSON.parse(response.payload);
            if (expectedStatusCode == 201) {
                expect(payload).toEqual(person);
            } else {
                checkProperties(expectedError, payload);
            }
        }
    );
});

describe('PersonHandler update tests', () => {
    it.each`
        testName                       | person                | expectedStatusCode | serviceMockReturn                                                                                                                                                                    | expectedError
        ${'200 with Valid person'}     | ${person}             | ${200}             | ${{ type: 'ok', data: { type: 'resource', value: person } }}                                                                                                                         | ${null}
        ${'400 with Invalid person'}   | ${invalidPerson}      | ${400}             | ${{ type: 'ok', data: { type: 'resource', value: person } }}                                                                                                                         | ${{ reason: Constants.errors.validation.person.update.MESSAGE, code: Constants.errors.validation.person.update.CODE, instance: 'exists', pointer: '', title: Constants.errors.validation.person.update.TITLE, rootCauses: 'exists' }}
        ${'400 with invalid personId'} | ${{ id: 'not-uuid' }} | ${400}             | ${{ type: 'ok', data: { type: 'resource', value: person } }}                                                                                                                         | ${{ reason: Constants.errors.handler.person.update.MESSAGE, code: Constants.errors.handler.person.update.CODE, instance: 'exists', pointer: '', title: Constants.errors.handler.person.update.TITLE, rootCauses: 'exists' }}
        ${'400 with service error'}    | ${person}             | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE).withReason(Constants.errors.generalError.MESSAGE).withTitle(Constants.errors.generalError.TITLE) }} | ${{ reason: Constants.errors.generalError.MESSAGE, code: Constants.errors.generalError.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }}
    `(
        '$testName',
        async ({
            person,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
        }) => {
            let id = person.id;
            if (id !== 'not-uuid' && !uuidValidate(id)) {
                id = Uuid();
            }
            serviceMock.update = jest.fn().mockResolvedValue(serviceMockReturn);
            const response = await Runtime.instance.inject({
                method: 'PUT',
                url: `/persons/${id}`,
                headers: {
                    authorization: `Bearer ${validSigner(claims)}`,
                },
                payload: person,
            });
            easyChecks(response, expectedStatusCode, person, expectedError);
        }
    );
});

describe('PersonHandler delete tests', () => {
    it.each`
        testName                       | person                | expectedStatusCode | serviceMockReturn                                                                                                                                                                    | expectedError
        ${'204 with Valid person'}     | ${person}             | ${204}             | ${{ type: 'ok', data: { type: 'resource', value: person } }}                                                                                                                         | ${null}
        ${'400 with invalid personId'} | ${{ id: 'not-uuid' }} | ${400}             | ${{ type: 'ok', data: { type: 'resource', value: person } }}                                                                                                                         | ${{ reason: Constants.errors.handler.person.delete.MESSAGE, code: Constants.errors.handler.person.delete.CODE, instance: 'exists', pointer: '', title: Constants.errors.handler.person.delete.TITLE, rootCauses: 'exists' }}
        ${'400 with service error'}    | ${person}             | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE).withReason(Constants.errors.generalError.MESSAGE).withTitle(Constants.errors.generalError.TITLE) }} | ${{ reason: Constants.errors.generalError.MESSAGE, code: Constants.errors.generalError.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }}
    `(
        '$testName',
        async ({
            person,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
        }) => {
            serviceMock.delete = jest.fn().mockResolvedValue(serviceMockReturn);
            const response = await Runtime.instance.inject({
                method: 'DELETE',
                url: `/persons/${person.id}`,
                headers: {
                    authorization: `Bearer ${validSigner(claims)}`,
                },
            });
            expect(response.statusCode).toEqual(expectedStatusCode);
            if (expectedStatusCode != 204) {
                checkProperties(expectedError, JSON.parse(response.payload));
            }
        }
    );
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkProperties = (expectedError: any, payload: any) => {
    for (const [key, value] of Object.entries(expectedError)) {
        if (value === 'exists') {
            expect(payload).toHaveProperty(key);
        } else {
            expect(payload).toHaveProperty(key, value);
        }
    }
};

const easyChecks = (
    response: Response,
    expectedStatusCode: unknown,
    person: unknown,
    expectedError: unknown
) => {
    expect(response.statusCode).toEqual(expectedStatusCode);
    const payload = JSON.parse(response.payload);
    if (expectedStatusCode == 200) {
        expect(payload).toEqual(person);
    } else {
        checkProperties(expectedError, payload);
    }
};
