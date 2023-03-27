import {
    FastifyHttpProvider,
    parseUuid,
    Uuid,
} from '@cvshealth/apip-api-types';
import { validate as uuidValidate } from 'uuid';
import { Response } from 'light-my-request';
import { fastifyRequestContextMiddleware } from '@cvshealth/apip-context-middleware';
import { JwtMiddleware, JwtOptions } from '@cvshealth/apip-jwt-middleware';
import { createSigner } from 'fast-jwt';
import { MessageService } from '../services/message.service';
import { MessageRouter } from './message.router';
import { MessageHandler } from './message.handler';
import { ResourceNotFoundError } from '../errors/resource.not.found.error';
import { GeneralAPIError } from '../errors/general.api.error';
import { Constants } from '../models/constants';
import { formatString } from '../utils/format.string';

const serviceMock = jest.genMockFromModule<MessageService>(
    '../services/message.service'
);

const message = {
    id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
    summary:"summary",
    description:'desc',
    status:"NEW"
};

const invalidMessage = {
    id: '5',
    summary:"summary",
    description:'desc',
    status:"NEW"
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

    new MessageRouter(Runtime, new MessageHandler(serviceMock));

    await Runtime.instance.ready();
});

describe('MessageHandler get tests', () => {
    it.each`
        testName                        | message                  | expectedStatusCode | serviceMockReturn                                                                                                                                                                                                                                         | expectedError                                                                                                                                                                   | token
        ${'401 without Jwt'}            | ${[message]}             | ${401}             | ${{ type: 'ok', data: { type: 'resource', value: message } }}                                                                                                                                                                                              | ${{ unauthorized: 'you' }}                                                                                                                                                      | ${null}
        ${'200 with Jwt'}               | ${[message]}             | ${200}             | ${{ type: 'ok', data: { type: 'resource', value: message } }}                                                                                                                                                                                              | ${null}                                                                                                                                                                         | ${validSigner(claims)}
        ${'200 when no objects return'} | ${[]}                   | ${200}             | ${{ type: 'error', data: new ResourceNotFoundError(Constants.errors.notFound.message.CODE).withTitle(Constants.errors.notFound.message.TITLE).withReason(formatString(Constants.errors.notFound.message.MESSAGE, '728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7')) }} | ${null}                                                                                                                                                                         | ${validSigner(claims)}
        ${'400 with invalidId'}         | ${[{ id: 'not-uuid' }]} | ${400}             | ${null}                                                                                                                                                                                                                                                   | ${null}                                                                                                                                                                         | ${validSigner(claims)}
        ${'400 when service error'}     | ${[]}                   | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}                                                                                                                                                                       | ${{ reason: 'GENERAL API ERROR', code: Constants.errors.generalError.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }} | ${validSigner(claims)}
    `(
        '$testName',
        async ({
            message,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
            token,
        }) => {
            serviceMock.getById = jest
                .fn()
                .mockResolvedValue(serviceMockReturn);
            let id = message[0]?.id;
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
                    url: `/persons/${message.id}`,
                });
            }

            expect(response.statusCode).toEqual(expectedStatusCode);
            const payload = JSON.parse(response.payload);
            if (expectedStatusCode == 200) {
                expect(payload).toEqual(message);
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

describe('MessageHandler getCollection tests', () => {
    it.each`
        testName                     | message      | expectedStatusCode | serviceMockReturn                                                                                                                                                                                                                              | expectedError
        ${'200 with value'}          | ${[message]} | ${200}             | ${{ type: 'ok', data: { type: 'collection', value: [message] } }}                                                                                                                                                                               | ${null}
        ${'200 with no value'}       | ${[]}       | ${200}             | ${{ type: 'ok', data: { type: 'collection', value: [] } }}                                                                                                                                                                                     | ${null}
        ${'400 when service errors'} | ${[]}       | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.repo.message.storageProvider.undefined.CODE, '', Constants.errors.repo.message.storageProvider.undefined.TITLE, Constants.errors.repo.message.storageProvider.undefined.MESSAGE) }} | ${{ reason: 'GENERAL API ERROR', code: Constants.errors.repo.message.storageProvider.undefined.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }}
    `(
        '$testName',
        async ({
            message,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
        }) => {
            serviceMock.getCollection = jest
                .fn()
                .mockResolvedValue(serviceMockReturn);
            const response = await Runtime.instance.inject({
                method: 'GET',
                url: '/messages',
                headers: {
                    authorization: `Bearer ${validSigner(claims)}`,
                },
            });
            easyChecks(response, expectedStatusCode, message, expectedError);
        }
    );
});

describe('MessageHandler post tests', () => {
    it.each`
        testName                     | message           | expectedStatusCode | serviceMockReturn                                                                                                                                                                    | expectedError
        ${'201 with Valid message'}   | ${message}        | ${201}             | ${{ type: 'ok', data: { type: 'resource', value: message } }}                                                                                                                         | ${null}
        ${'400 with Invalid message'} | ${invalidMessage} | ${400}             | ${{ type: 'ok', data: { type: 'resource', value: message } }}                                                                                                                         | ${{ reason: Constants.errors.validation.message.create.MESSAGE, code: Constants.errors.validation.message.create.CODE, instance: 'exists', pointer: '', title: Constants.errors.validation.message.create.TITLE, rootCauses: 'exists' }}
        ${'400 with service error'}  | ${message}        | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE).withReason(Constants.errors.generalError.MESSAGE).withTitle(Constants.errors.generalError.TITLE) }} | ${{ reason: Constants.errors.generalError.MESSAGE, code: Constants.errors.generalError.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }}
    `(
        '$testName',
        async ({
            message,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
        }) => {
            serviceMock.create = jest.fn().mockResolvedValue(serviceMockReturn);
            const response = await Runtime.instance.inject({
                method: 'POST',
                url: '/messages',
                headers: {
                    authorization: `Bearer ${validSigner(claims)}`,
                },
                payload: message,
            });
            expect(response.statusCode).toEqual(expectedStatusCode);
            const payload = JSON.parse(response.payload);
            if (expectedStatusCode == 201) {
                expect(payload).toEqual(message);
            } else {
                checkProperties(expectedError, payload);
            }
        }
    );
});

describe('MessageHandler update tests', () => {
    it.each`
        testName                       | message                | expectedStatusCode | serviceMockReturn                                                                                                                                                                    | expectedError
        ${'200 with Valid message'}     | ${message}             | ${200}             | ${{ type: 'ok', data: { type: 'resource', value: message } }}                                                                                                                         | ${null}
        ${'400 with Invalid message'}   | ${invalidMessage}      | ${400}             | ${{ type: 'ok', data: { type: 'resource', value: message } }}                                                                                                                         | ${{ reason: Constants.errors.validation.message.update.MESSAGE, code: Constants.errors.validation.message.update.CODE, instance: 'exists', pointer: '', title: Constants.errors.validation.message.update.TITLE, rootCauses: 'exists' }}
        ${'400 with invalid personId'} | ${{ id: 'not-uuid' }} | ${400}             | ${{ type: 'ok', data: { type: 'resource', value: message } }}                                                                                                                         | ${{ reason: Constants.errors.handler.message.update.MESSAGE, code: Constants.errors.handler.message.update.CODE, instance: 'exists', pointer: '', title: Constants.errors.handler.message.update.TITLE, rootCauses: 'exists' }}
        ${'400 with service error'}    | ${message}             | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE).withReason(Constants.errors.generalError.MESSAGE).withTitle(Constants.errors.generalError.TITLE) }} | ${{ reason: Constants.errors.generalError.MESSAGE, code: Constants.errors.generalError.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }}
    `(
        '$testName',
        async ({
            message,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
        }) => {
            let id = message.id;
            if (id !== 'not-uuid' && !uuidValidate(id)) {
                id = Uuid();
            }
            serviceMock.update = jest.fn().mockResolvedValue(serviceMockReturn);
            const response = await Runtime.instance.inject({
                method: 'PUT',
                url: `/messages/${id}`,
                headers: {
                    authorization: `Bearer ${validSigner(claims)}`,
                },
                payload: message,
            });
            easyChecks(response, expectedStatusCode, message, expectedError);
        }
    );
});

describe('MessageHandler delete tests', () => {
    it.each`
        testName                       | message                | expectedStatusCode | serviceMockReturn                                                                                                                                                                    | expectedError
        ${'204 with Valid message'}     | ${message}             | ${204}             | ${{ type: 'ok', data: { type: 'resource', value: message } }}                                                                                                                         | ${null}
        ${'400 with invalid personId'} | ${{ id: 'not-uuid' }} | ${400}             | ${{ type: 'ok', data: { type: 'resource', value: message } }}                                                                                                                         | ${{ reason: Constants.errors.handler.message.delete.MESSAGE, code: Constants.errors.handler.message.delete.CODE, instance: 'exists', pointer: '', title: Constants.errors.handler.message.delete.TITLE, rootCauses: 'exists' }}
        ${'400 with service error'}    | ${message}             | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE).withReason(Constants.errors.generalError.MESSAGE).withTitle(Constants.errors.generalError.TITLE) }} | ${{ reason: Constants.errors.generalError.MESSAGE, code: Constants.errors.generalError.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }}
    `(
        '$testName',
        async ({
            message,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
        }) => {
            serviceMock.delete = jest.fn().mockResolvedValue(serviceMockReturn);
            const response = await Runtime.instance.inject({
                method: 'DELETE',
                url: `/messages/${message.id}`,
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
    message: unknown,
    expectedError: unknown
) => {
    expect(response.statusCode).toEqual(expectedStatusCode);
    const payload = JSON.parse(response.payload);
    if (expectedStatusCode == 200) {
        expect(payload).toEqual(message);
    } else {
        checkProperties(expectedError, payload);
    }
};
