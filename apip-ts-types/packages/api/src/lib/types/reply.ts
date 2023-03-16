import { ServerResponse } from 'http';
import { Http2ServerResponse } from 'http2';
import { FastifyReply } from 'fastify';

export type Reply = ServerResponse | Http2ServerResponse | FastifyReply;
