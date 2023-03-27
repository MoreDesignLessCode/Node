import {
    TicketHandler,
    TicketPgStorageProvider,
    TicketRepository,
    TicketRouter,
    Tickets,
    TicketService
} from '../dist/packages/ticket';
import {
    RatingHandler,
    RatingPgStorageProvider,
    RatingRepository,
    RatingRouter,
    Ratings,
    RatingService
} from '../dist/packages/rating';

import {
    MessageHandler,
    MessagePgStorageProvider,
    MessageRepository,
    MessageRouter,
    Messages,
    MessageService
} from '../dist/packages/message';
import {
    AttachmentHandler,
    AttachmentPgStorageProvider,
    AttachmentRepository,
    AttachmentRouter,
    Attachments,
    AttachmentService
} from '../dist/packages/attachment';

import { FastifyHttpProvider } from '@cvshealth/apip-api-types';
import * as dotenv from 'dotenv';
import { fastifyRequestContextMiddleware } from '@cvshealth/apip-context-middleware';
import { JwtMiddleware, JwtOptions } from '@cvshealth/apip-jwt-middleware';





dotenv.config();

const port = process.env.PERSON_DAS_PORT || 3000;
const Runtime = new FastifyHttpProvider({ logger: true });

Runtime.instance.register(fastifyRequestContextMiddleware);
// Runtime.instance.register(JwtMiddleware, {
//     key: 'e98256815795d097dc84594fe5bcf6c55d90d11f04b25e814c7a4bff90667bfb',
//     complete: true,
//     errorHandler: (err, reply) => {
//         reply.log.error(err);
//         reply.status(401).send({ unauthorized: 'you' });
//     },
// } as JwtOptions);
Runtime.instance.register(require('@fastify/multipart'))
Runtime.instance.register(require('@fastify/formbody'))

// new PersonRouter(
//     Runtime,
//     new PersonHandler(
//         new PersonService(new PersonRepository(new PersonPgStorageProvider()))
//     )
// );
new TicketRouter(
    Runtime,
    new TicketHandler(
        new TicketService(new TicketRepository(new TicketPgStorageProvider()))
    ))
    new RatingRouter(
        Runtime,
        new RatingHandler(
            new RatingService(new RatingRepository(new RatingPgStorageProvider()))
        ))
        new AttachmentRouter(
            Runtime,
            new AttachmentHandler(
                new AttachmentService(new AttachmentRepository(new AttachmentPgStorageProvider()))
            ))    


new MessageRouter(
    Runtime,
    new MessageHandler(
        new MessageService(new MessageRepository(new MessagePgStorageProvider()))
    )
);

Runtime.instance.listen({ port: port as number }, (err) => {
    if (err) throw err;
});