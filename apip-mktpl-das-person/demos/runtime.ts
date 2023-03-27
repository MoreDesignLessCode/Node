import {
    PersonHandler,
    PersonRouter,
    PersonRepository,
    PersonService,
    PersonPgStorageProvider,
} from '../dist/packages/person';
import { FastifyHttpProvider } from '@cvshealth/apip-api-types';
import { fastifyRequestContextMiddleware } from '@cvshealth/apip-context-middleware';
import { JwtMiddleware, JwtOptions } from '@cvshealth/apip-jwt-middleware';
import * as dotenv from 'dotenv';

dotenv.config();

const port = process.env.PERSON_DAS_PORT || 3000;
const Runtime = new FastifyHttpProvider({ logger: true });

Runtime.instance.register(fastifyRequestContextMiddleware);
Runtime.instance.register(JwtMiddleware, {
    key: 'e98256815795d097dc84594fe5bcf6c55d90d11f04b25e814c7a4bff90667bfb',
    complete: true,
    errorHandler: (err, reply) => {
        reply.log.error(err);
        reply.status(401).send({ unauthorized: 'you' });
    },
} as JwtOptions);

new PersonRouter(
    Runtime,
    new PersonHandler(
        new PersonService(new PersonRepository(new PersonPgStorageProvider()))
    )
);

Runtime.instance.listen({ port: port as number }, (err) => {
    if (err) throw err;
});
