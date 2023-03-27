import {
    PersonHandler,
    PersonRouter,
    PersonRepository,
    PersonService,
    PersonMemoryStorageProvider,
    Person,
    PersonHttpStorageProvider,
    ContactRouter,
    ContactHandler,
    ContactService,
    ContactRepository,
    Contact,
    ContactMemoryStorageProvider,
} from '../dist/packages/person';
import { FastifyHttpProvider, parseUuid } from '@cvshealth/apip-api-types';
import { fastifyRequestContextMiddleware } from '@cvshealth/apip-context-middleware';
import { JwtMiddleware, JwtOptions } from '@cvshealth/apip-jwt-middleware';
import * as dotenv from 'dotenv';
import { IStorageProvider } from '@cvshealth/apip-api-types';

dotenv.config();

const port = process.env.PORT || 3000;
const storage = process.env.PERSON_DOI_STORAGE;
const Runtime = new FastifyHttpProvider({ logger: true });
let personStorageProvider: IStorageProvider<Person>;
let contactStorageProvider: IStorageProvider<Contact>;

const testPersonsData = [
    {
        id: parseUuid('728cb5aa-9eb1-4d61-a81d-9ef3026c3ab7'),
        name: {
            display: 'Joe Developer',
            given: 'Joe',
            middle: '',
            family: 'Developer',
        },
    },
    {
        id: parseUuid('cef35b6e-056d-43b9-b707-3fe568c3ab65'),
        name: {
            display: 'Brandon Schenz',
            given: 'Brandon',
            middle: '',
            family: 'Schenz',
        },
    },
    {
        id: parseUuid('3fb83674-a2b0-415c-a4ca-ee972fdc37b9'),
        name: {
            display: 'Tyler Bosh',
            given: 'Tyler',
            middle: '',
            family: 'Bosh',
        },
    },
];

const testContactData = [
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

if (storage === 'memory') {
    personStorageProvider = new PersonMemoryStorageProvider(testPersonsData);
    contactStorageProvider = new ContactMemoryStorageProvider(testContactData);
} else {
    personStorageProvider = new PersonHttpStorageProvider();
}

Runtime.instance.register(fastifyRequestContextMiddleware);
Runtime.instance.register(JwtMiddleware, {
    key: 'e98256815795d097dc84594fe5bcf6c55d90d11f04b25e814c7a4bff90667bfb',
    errorHandler: (err, reply) => {
        reply.log.error(err);
        reply.status(401).send({ unauthorized: 'you' });
    },
} as JwtOptions);

new PersonRouter(
    Runtime,
    new PersonHandler(
        new PersonService(new PersonRepository(personStorageProvider))
    )
);

new ContactRouter(
    Runtime,
    new ContactHandler(
        new ContactService(new ContactRepository(contactStorageProvider))
    )
);

Runtime.instance.listen({ port: port as number }, (err) => {
    if (err) throw err;
});
