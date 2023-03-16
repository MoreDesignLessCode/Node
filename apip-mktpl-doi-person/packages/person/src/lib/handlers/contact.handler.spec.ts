import {
    ContactHandler,
    ContactRouter,
    ContactService,
    Constants,
    formatString,
    GeneralAPIError,
    ResourceNotFoundError,
} from '../index';
import {
    FastifyHttpProvider,
    parseUuid,
    Uuid,
} from '@procter-gamble/apip-api-types';
import { validate as uuidValidate } from 'uuid';
import { Response } from 'light-my-request';
import { fastifyRequestContextMiddleware } from '@procter-gamble/apip-context-middleware';

const serviceMock = jest.genMockFromModule<ContactService>(
    '../services/contact.service'
);

const contact = {
    id: parseUuid('778f1ecf-3287-41bc-9778-61b809827b85'),
    personId: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
    type: 'urn:mailto',
    value: 'developer.jd@pg.com',
};

const invalidContact = {
    id: '5',
    personId: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
    type: 'urn:mailto',
    value: 'developer.jd@pg.com',
};

let Runtime: FastifyHttpProvider;

beforeEach(async () => {
    jest.clearAllMocks();

    Runtime = new FastifyHttpProvider({});
    await Runtime.instance.register(fastifyRequestContextMiddleware);
    new ContactRouter(Runtime, new ContactHandler(serviceMock));
    await Runtime.instance.ready();
});

describe('ContactHandler get tests', () => {
    it.each`
        testName                        | contact                 | expectedStatusCode | serviceMockReturn                                                                                                                                                                                                                                            | expectedError
        ${'200 with Jwt'}               | ${[contact]}            | ${200}             | ${{ type: 'ok', data: { type: 'resource', value: contact } }}                                                                                                                                                                                                | ${null}
        ${'200 when no objects return'} | ${[]}                   | ${200}             | ${{ type: 'error', data: new ResourceNotFoundError(Constants.errors.notFound.contact.CODE).withTitle(Constants.errors.notFound.contact.TITLE).withReason(formatString(Constants.errors.notFound.contact.MESSAGE, '728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7')) }} | ${null}
        ${'400 with invalidId'}         | ${[{ id: 'not-uuid' }]} | ${400}             | ${null}                                                                                                                                                                                                                                                      | ${null}
        ${'400 when service error'}     | ${[]}                   | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE) }}                                                                                                                                                                          | ${{ reason: 'GENERAL API ERROR', code: Constants.errors.generalError.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }}
    `(
        '$testName',
        async ({
            contact,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
        }) => {
            serviceMock.getById = jest
                .fn()
                .mockResolvedValue(serviceMockReturn);
            let id = contact[0]?.id;
            if (id !== 'not-uuid' && !uuidValidate(id)) {
                id = Uuid();
            }
            const response: Response = await Runtime.instance.inject({
                method: 'GET',
                url: `/contacts/${id}`,
            });

            expect(response.statusCode).toEqual(expectedStatusCode);
            const payload = JSON.parse(response.payload);
            if (expectedStatusCode == 200) {
                expect(payload.data).toEqual(contact);
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
                    for (const [key, value] of Object.entries(expectedError)) {
                        if (value === 'exists') {
                            expect(payload.errors).toHaveProperty(key);
                        } else {
                            expect(payload.errors).toHaveProperty(key, value);
                        }
                    }
                }
            }
        }
    );
});

describe('ContactHandler getCollection tests', () => {
    it.each`
        testName                     | contact      | expectedStatusCode | serviceMockReturn                                                                                                                                                                                                                                                   | expectedError
        ${'200 with value'}          | ${[contact]} | ${200}             | ${{ type: 'ok', data: { type: 'collection', value: [contact] } }}                                                                                                                                                                                                   | ${null}
        ${'200 with no value'}       | ${[]}        | ${200}             | ${{ type: 'ok', data: { type: 'collection', value: [] } }}                                                                                                                                                                                                          | ${null}
        ${'400 when service errors'} | ${[]}        | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.repository.contact.storageProvider.undefined.CODE, '', Constants.errors.repository.contact.storageProvider.undefined.TITLE, Constants.errors.repository.contact.storageProvider.undefined.MESSAGE) }} | ${{ reason: 'GENERAL API ERROR', code: Constants.errors.repository.contact.storageProvider.undefined.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }}
    `(
        '$testName',
        async ({
            contact,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
        }) => {
            serviceMock.getCollection = jest
                .fn()
                .mockResolvedValue(serviceMockReturn);
            const response = await Runtime.instance.inject({
                method: 'GET',
                url: '/contacts',
            });

            expect(response.statusCode).toEqual(expectedStatusCode);
            const payload = JSON.parse(response.payload);
            if (expectedStatusCode == 200) {
                expect(payload.data).toEqual(contact);
            } else {
                for (const [key, value] of Object.entries(expectedError)) {
                    if (value === 'exists') {
                        expect(payload.errors).toHaveProperty(key);
                    } else {
                        expect(payload.errors).toHaveProperty(key, value);
                    }
                }
            }
        }
    );
});

describe('ContactHandler post tests', () => {
    it.each`
        testName                      | contact           | expectedStatusCode | serviceMockReturn                                                                                                                                                                    | expectedError
        ${'201 with Valid contact'}   | ${contact}        | ${201}             | ${{ type: 'ok', data: { type: 'resource', value: contact } }}                                                                                                                        | ${null}
        ${'400 with Invalid contact'} | ${invalidContact} | ${400}             | ${{ type: 'ok', data: { type: 'resource', value: contact } }}                                                                                                                        | ${{ reason: Constants.errors.validation.contact.create.MESSAGE, code: Constants.errors.validation.contact.create.CODE, instance: 'exists', pointer: '', title: Constants.errors.validation.contact.create.TITLE, rootCauses: 'exists' }}
        ${'400 with service error'}   | ${contact}        | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE).withReason(Constants.errors.generalError.MESSAGE).withTitle(Constants.errors.generalError.TITLE) }} | ${{ reason: Constants.errors.generalError.MESSAGE, code: Constants.errors.generalError.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }}
    `(
        '$testName',
        async ({
            contact,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
        }) => {
            serviceMock.create = jest.fn().mockResolvedValue(serviceMockReturn);
            const response = await Runtime.instance.inject({
                method: 'POST',
                url: '/contacts',
                payload: contact,
            });
            expect(response.statusCode).toEqual(expectedStatusCode);
            const payload = JSON.parse(response.payload);
            if (expectedStatusCode == 201) {
                expect(payload.data).toEqual([contact]);
            } else {
                for (const [key, value] of Object.entries(expectedError)) {
                    if (value === 'exists') {
                        expect(payload.errors).toHaveProperty(key);
                    } else {
                        expect(payload.errors).toHaveProperty(key, value);
                    }
                }
            }
        }
    );
});

describe('ContactHandler update tests', () => {
    it.each`
        testName                        | contact               | expectedStatusCode | serviceMockReturn                                                                                                                                                                    | expectedError
        ${'200 with Valid contact'}     | ${contact}            | ${200}             | ${{ type: 'ok', data: { type: 'resource', value: contact } }}                                                                                                                        | ${null}
        ${'400 with Invalid contact'}   | ${invalidContact}     | ${400}             | ${{ type: 'ok', data: { type: 'resource', value: contact } }}                                                                                                                        | ${{ reason: Constants.errors.validation.contact.update.MESSAGE, code: Constants.errors.validation.contact.update.CODE, instance: 'exists', pointer: '', title: Constants.errors.validation.contact.update.TITLE, rootCauses: 'exists' }}
        ${'400 with invalid contactId'} | ${{ id: 'not-uuid' }} | ${400}             | ${{ type: 'ok', data: { type: 'resource', value: contact } }}                                                                                                                        | ${{ reason: Constants.errors.handler.contact.update.MESSAGE, code: Constants.errors.handler.contact.update.CODE, instance: 'exists', pointer: '', title: Constants.errors.handler.contact.update.TITLE, rootCauses: 'exists' }}
        ${'400 with service error'}     | ${contact}            | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE).withReason(Constants.errors.generalError.MESSAGE).withTitle(Constants.errors.generalError.TITLE) }} | ${{ reason: Constants.errors.generalError.MESSAGE, code: Constants.errors.generalError.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }}
    `(
        '$testName',
        async ({
            contact,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
        }) => {
            let id = contact.id;
            if (id !== 'not-uuid' && !uuidValidate(id)) {
                id = Uuid();
            }
            serviceMock.update = jest.fn().mockResolvedValue(serviceMockReturn);
            const response = await Runtime.instance.inject({
                method: 'PUT',
                url: `/contacts/${id}`,
                payload: contact,
            });
            expect(response.statusCode).toEqual(expectedStatusCode);
            const payload = JSON.parse(response.payload);
            if (expectedStatusCode == 200) {
                expect(payload.data).toEqual([contact]);
            } else {
                for (const [key, value] of Object.entries(expectedError)) {
                    if (value === 'exists') {
                        expect(payload.errors).toHaveProperty(key);
                    } else {
                        expect(payload.errors).toHaveProperty(key, value);
                    }
                }
            }
        }
    );
});

describe('ContactHandler delete tests', () => {
    it.each`
        testName                        | contact               | expectedStatusCode | serviceMockReturn                                                                                                                                                                    | expectedError
        ${'204 with Valid contact'}     | ${contact}            | ${204}             | ${{ type: 'ok', data: { type: 'resource', value: contact } }}                                                                                                                        | ${null}
        ${'400 with invalid contactId'} | ${{ id: 'not-uuid' }} | ${400}             | ${{ type: 'ok', data: { type: 'resource', value: contact } }}                                                                                                                        | ${{ reason: Constants.errors.handler.contact.delete.MESSAGE, code: Constants.errors.handler.contact.delete.CODE, instance: 'exists', pointer: '', title: Constants.errors.handler.contact.delete.TITLE, rootCauses: 'exists' }}
        ${'400 with service error'}     | ${contact}            | ${400}             | ${{ type: 'error', data: new GeneralAPIError(Constants.errors.generalError.CODE).withReason(Constants.errors.generalError.MESSAGE).withTitle(Constants.errors.generalError.TITLE) }} | ${{ reason: Constants.errors.generalError.MESSAGE, code: Constants.errors.generalError.CODE, instance: 'exists', pointer: '', title: Constants.errors.generalError.TITLE, rootCauses: 'exists' }}
    `(
        '$testName',
        async ({
            contact,
            expectedStatusCode,
            serviceMockReturn,
            expectedError,
        }) => {
            serviceMock.delete = jest.fn().mockResolvedValue(serviceMockReturn);
            const response = await Runtime.instance.inject({
                method: 'DELETE',
                url: `/contacts/${contact.id}`,
            });
            expect(response.statusCode).toEqual(expectedStatusCode);
            if (expectedStatusCode != 204) {
                const payload = JSON.parse(response.payload);
                for (const [key, value] of Object.entries(expectedError)) {
                    if (value === 'exists') {
                        expect(payload.errors).toHaveProperty(key);
                    } else {
                        expect(payload.errors).toHaveProperty(key, value);
                    }
                }
            }
        }
    );
});
