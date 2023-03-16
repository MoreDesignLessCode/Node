import { IncomingMessage } from 'http';
import { Http2ServerRequest } from 'http2';
import { ParsedQs } from 'qs';
import { FastifyRequest } from 'fastify';
import { Uuid } from './id';

export type PathParams = { id: Uuid }
export type Request = IncomingMessage | Http2ServerRequest | FastifyRequest;
export type QueryParameters =
  | { [key: string]: undefined }
  | string
  | string[]
  | ParsedQs
  | ParsedQs[];
