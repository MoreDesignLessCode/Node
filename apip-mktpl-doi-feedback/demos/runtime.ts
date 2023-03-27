// import {
//     PersonHandler,
//     PersonRouter,
//     PersonRepository,
//     PersonService,
//     PersonMemoryStorageProvider,
//     Person,
//     PersonHttpStorageProvider,
// } from '../dist/packages/person';
import {
    TicketHandler,
    TicketMemoryStorageProvider,
    TicketRepository,
    TicketRouter,
    Tickets,
    TicketsHttpStorageProvider,
    TicketsService
} from '../dist/packages/tickets';
import {
    RatingHandler,
    ratingMemoryStorageProvider,
    RatingRepository,
    RatingRouter,
    Ratings,
    RatingsHttpStorageProvider,
    RatingService
} from '../dist/packages/ratings';
import {
    MessageHandler,MessagessService,
    Messages, MessagesRouter,MessagessHttpStorageProvider, MessagessMemoryStorageProvider, MessagessRepository
} from '../dist/packages/messages';

import {
    Attachments, AttachmentsHttpStorageProvider, AttachmentsMemoryStorageProvider, AttachmentsRepository
} from '../dist/packages/attachments';
import { FastifyHttpProvider, parseUuid } from '@cvshealth/apip-api-types';
import { fastifyRequestContextMiddleware } from '@cvshealth/apip-context-middleware';
import { JwtMiddleware, JwtOptions } from '@cvshealth/apip-jwt-middleware';
import * as dotenv from 'dotenv';
import { IStorageProvider } from '@cvshealth/apip-api-types';

dotenv.config();

const port = process.env.PORT || 3000;
const storage = process.env.PERSON_DOI_STORAGE;
const Runtime = new FastifyHttpProvider({ logger: true });
// let personStorageProvider: IStorageProvider<Person>;
let ticketStorageProvider: IStorageProvider<Tickets>;
let ratingStorageProvider: IStorageProvider<Ratings>;
let messageStorageProvider: IStorageProvider<Messages>;
let attatchmentStorageProvider: IStorageProvider<Attachments>;


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

if (storage === 'memorys') {
    // personStorageProvider = new PersonMemoryStorageProvider(testPersonsData);
    ticketStorageProvider = new TicketMemoryStorageProvider();
    messageStorageProvider = new MessagessMemoryStorageProvider();
    attatchmentStorageProvider = new AttachmentsMemoryStorageProvider();
} else {
    // personStorageProvider = new PersonHttpStorageProvider();
    ticketStorageProvider = new TicketsHttpStorageProvider();
    ratingStorageProvider = new RatingsHttpStorageProvider();
    messageStorageProvider = new MessagessHttpStorageProvider();
    attatchmentStorageProvider = new AttachmentsHttpStorageProvider();

}


Runtime.instance.register(fastifyRequestContextMiddleware);
// Runtime.instance.register(JwtMiddleware, {
//     key: 'e98256815795d097dc84594fe5bcf6c55d90d11f04b25e814c7a4bff90667bfb',
//     errorHandler: (err, reply) => {
//         reply.log.error(err);
//         reply.status(401).send({ unauthorized: 'you' });
//     },
// } as JwtOptions);
const ticketRepository = new TicketRepository(ticketStorageProvider)
const ratingRepository = new RatingRepository(ratingStorageProvider)
const participantRepository = new ParticipantsRepository(participantStorageProvider)
const messagesRepository = new MessagessRepository(messageStorageProvider)
const attachmentsRepository = new AttachmentsRepository(attatchmentStorageProvider)


new TicketRouter(
    Runtime,
    new TicketHandler(new TicketsService(
        ticketRepository,
        messagesRepository,
        attachmentsRepository
    ))
)
new RatingRouter(
    Runtime,
    new RatingHandler(new RatingService(
        ratingRepository,
        participantRepository,
        messagesRepository,
        attachmentsRepository
    ))
)
new RatingRouter(
    Runtime,
    new RatingHandler(new RatingService(
        ratingRepository,
        participantRepository,
        messagesRepository,
        attachmentsRepository
    ))
)
new MessagesRouter(
    Runtime,
    new MessageHandler(new MessagessService(
        messagesRepository,
        attachmentsRepository
    ))
)

// new PersonRouter(
//     Runtime,
//     new PersonHandler(
//         new PersonService(new PersonRepository(personStorageProvider))
//     )
// );

Runtime.instance.listen({ port: port as number }, (err) => {
    if (err) throw err;
});
