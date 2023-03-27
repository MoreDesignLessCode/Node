import { match } from 'ts-pattern';
import {
    Constants,
    formatString,
    Contact,
    ContactMemoryStorageProvider,
} from '../../index';
import {
    DefaultRequestContext,
    parseUuid,
} from '@cvshealth/apip-api-types';

let testContactRepository: ContactMemoryStorageProvider;
let testContacts: Contact[];
let testUpdateContact: Contact;
let testContact: Contact;
let testNewContact: Contact;

beforeEach(() => {
    testContacts = [
        {
            id: parseUuid('778f1ecf-3287-41bc-9778-61b809827b85'),
            personId: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
            type: 'urn:mailto',
            value: 'developer.jd@cvshealth.com',
        },
        {
            id: parseUuid('91da57f9-f772-4dde-8ea5-1b9bf0818108'),
            personId: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
            type: 'urn:mobile',
            value: '513-867-5309',
        },
        {
            id: parseUuid('df4da5ef-db03-49ca-aea4-3238fcdf96cb'),
            personId: parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
            type: 'urn:mailto',
            value: 'example@address.edu',
        },
        {
            id: parseUuid('6c49bf49-d902-4128-8146-6adf6f657d6e'),
            personId: parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
            type: 'urn:fax',
            value: 'thefactsmachine@example.gov',
        },
    ];
    testContactRepository = new ContactMemoryStorageProvider(testContacts);
    testUpdateContact = {
        id: parseUuid('778f1ecf-3287-41bc-9778-61b809827b85'),
        personId: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
        type: 'urn:mailto',
        value: 'seniordeveloper.jd@cvshealth.com',
    };
    testContact = {
        id: parseUuid('df4da5ef-db03-49ca-aea4-3238fcdf96cb'),
        personId: parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
        type: 'urn:mailto',
        value: 'example@address.edu',
    };
    testNewContact = {
        id: parseUuid('b3c77a22-d78a-4e60-b798-6e90492391e1'),
        personId: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
        type: 'urn:fax',
        value: 'developerfaxmachine@cvshealth.com',
    };
});

describe('all function test', () => {
    it('the all function should return all contacts in the repo', async () => {
        const result = await testContactRepository.all();
        match(result)
            .with({ type: 'ok' }, (result) => {
                expect(result.data.value).toStrictEqual(testContacts);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('find function test', () => {
    it.each`
        testName                         | id
        ${'ok when id does exist'}       | ${parseUuid('df4da5ef-db03-49ca-aea4-3238fcdf96cb')}
        ${'fail when id does not exist'} | ${parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3aba')}
    `('$testName', async ({ id }) => {
        const result = await testContactRepository.findById(
            id,
            new DefaultRequestContext()
        );

        match(result)
            .with({ type: 'ok' }, (result) => {
                expect(result.data.value).toStrictEqual(testContact);
            })
            .with({ type: 'error' }, (result) => {
                expect(result.data.reason).toEqual(
                    formatString(Constants.errors.notFound.contact.MESSAGE, id)
                );
            })
            .exhaustive();
    });
});

describe('create function test', () => {
    it('create should add a contact object to the repo', async () => {
        const contact = await testContactRepository.create(
            testNewContact,
            new DefaultRequestContext()
        );

        match(contact)
            .with({ type: 'ok' }, () => {
                // ok
            })
            .with({ type: 'error' }, () => {
                expect(false).toBe(true);
            })
            .exhaustive();

        const result = await testContactRepository.all();
        match(result)
            .with({ type: 'ok' }, (result) => {
                expect(result.data.value).toContainEqual(testNewContact);
            })
            .with({ type: 'error' }, () => {
                expect(false).toBe(true);
            })
            .exhaustive();
    });
});

describe('save function test', () => {
    it('saving a contact object should return an updated contact', async () => {
        const result = await testContactRepository.save(
            parseUuid('778f1ecf-3287-41bc-9778-61b809827b85'),
            testUpdateContact,
            new DefaultRequestContext()
        );
        match(result)
            .with({ type: 'ok' }, (result) => {
                expect(result.data.value).toBe(testUpdateContact);
            })
            .with({ type: 'error' }, () => expect(false).toBe(true))
            .exhaustive();
    });

    it("should fail if it can't match id", async () => {
        const id = parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b8');
        match(
            await testContactRepository.save(
                id,
                testUpdateContact,
                new DefaultRequestContext()
            )
        )
            .with({ type: 'error' }, (result) => {
                expect(result.data.reason).toEqual(
                    formatString(Constants.errors.notFound.contact.MESSAGE, id)
                );
            })
            .with({ type: 'ok' }, () => expect(false).toBe(true))
            .exhaustive();
    });
});

describe('delete function test', () => {
    it.each`
        testName                         | id
        ${'ok when id does exist'}       | ${parseUuid('6c49bf49-d902-4128-8146-6adf6f657d6e')}
        ${'fail when id does not exist'} | ${parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab8')}
    `('$testName', async ({ id }) => {
        const result1 = await testContactRepository.delete(
            id,
            new DefaultRequestContext()
        );
        match(result1)
            .with({ type: 'ok' }, () => {
                // ok
            })
            .with({ type: 'error' }, (result) => {
                expect(result.data.reason).toEqual(
                    formatString(Constants.errors.notFound.contact.MESSAGE, id)
                );
            });

        const result2 = await testContactRepository.delete(
            id,
            new DefaultRequestContext()
        );
        match(result2)
            .with({ type: 'error' }, (result) => {
                expect(result.data.reason).toEqual(
                    formatString(Constants.errors.notFound.contact.MESSAGE, id)
                );
            })
            .with({ type: 'ok' }, () => {
                expect(false).toBe(true);
            })
            .exhaustive();
    });
});
