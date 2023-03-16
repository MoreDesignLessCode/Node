import { IContext } from '@procter-gamble/apip-api-types';
import {
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
  FastifyInstance,
  FastifyPluginOptions,
} from 'fastify';
import { createVerifier, VerifierOptions } from 'fast-jwt';
import { Buffer } from 'node:buffer';
import fp from 'fastify-plugin';
type APIP = {
  ctx: IContext;
};

declare module 'fastify' {
  interface FastifyRequest {
    apip: APIP;
  }
}

export interface JwtOptions extends Partial<VerifierOptions> {
  errorHandler?: (error: Error, reply: FastifyReply) => void;
  key: string | Buffer;
}

const middlewareFn: FastifyPluginCallback = (
  fastify: FastifyInstance,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: FastifyPluginOptions,
  done: () => void
) => {
  if (!('complete' in options)) options.complete = true;

  fastify.addHook(
    'onRequest',
    (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
      try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (!token) throw new Error('Authorization token not found');
        const verifier = createVerifier(options);
        const decoded = verifier(token);
        if (decoded.payload)
          request.apip.ctx.set('auth:claims', decoded.payload);
        if (decoded.header)
          request.apip.ctx.set('auth:headers', decoded.header);
        if (decoded.signature)
          request.apip.ctx.set('auth:signature', decoded.signature);
        request.apip.ctx.set('auth:token', token);
      } catch (e) {
        if (options.errorHandler) {
          options.errorHandler(e, reply);
        } else {
          reply.status(401).send();
        }
      }
      done();
    }
  );
  done();
};

export const JwtMiddleware = fp(middlewareFn, {
  name: 'apip-request-jwt',
  fastify: '4.x',
  dependencies: ['apip-request-context'],
});
