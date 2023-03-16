import {
  IContext,
  DefaultRequestContext,
} from '@procter-gamble/apip-api-types';
import {
  FastifyInstance,
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import * as qs from 'qs';
import fp from 'fastify-plugin';

type APIP = {
  ctx: IContext;
};

declare module 'fastify' {
  interface FastifyRequest {
    apip: APIP;
  }
}
const fastifyRequestContextMiddleware: FastifyPluginCallback = (
  instance: FastifyInstance,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  opts: any,
  next: () => void
) => {
  instance.addHook(
    'onRequest',
    (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
      request.apip = { ctx: new DefaultRequestContext() };
      if (request.params)
        request.apip.ctx.set('request:pathparams', request.params);
      const _url = request.url.replace(/\?(2,)/, '?');
      const _qsSymbolIndex = _url.indexOf('?');
      if (_qsSymbolIndex != -1) {
        request.apip.ctx.set(
          'request:queryparams',
          qs.parse(_url.slice(_qsSymbolIndex + 1))
        );
      }

      done();
    }
  );
  next();
};

export default fp(fastifyRequestContextMiddleware, {
  name: 'apip-request-context',
  fastify: '4.x',
});
