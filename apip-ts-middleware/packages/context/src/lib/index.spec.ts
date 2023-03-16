import fastify, {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';
import fastifyRequestContextMiddleware from './index';
describe('Request Context Middleware', () => {
  const tt = [
    { name: 'ctx is defined', want: { url: '/one' }, expected: undefined },
    {
      name: 'ctx query params parsed',
      want: { url: '/one?foo=bar' },
      expected: { foo: 'bar' },
    },
    {
      name: 'ctx array params parsed',
      want: { url: '/one?foo=bar&foo=baz' },
      expected: { foo: ['bar', 'baz'] },
    },
  ];

  tt.forEach(({ name, want, expected }) => {
    it(`${name}`, async () => {
      const mockFastify: FastifyInstance = {
        addHook: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      const mockRequest: FastifyRequest = {
        method: 'GET',
        url: want.url,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockReply: FastifyReply = {} as any;
      const mockNext = jest.fn();

      fastifyRequestContextMiddleware(mockFastify, {}, mockNext);

      const preHandlerHook = (mockFastify.addHook as jest.Mock).mock
        .calls[0][1];

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      preHandlerHook(mockRequest, mockReply, () => {});
      expect(typeof mockRequest.apip.ctx).toBeDefined();
      expect(mockRequest.apip.ctx.get('request:queryparams')).toEqual(expected);
    });
  });
});

describe('Request Context Middleware - Path Params', () => {
  const tt = [
    {
      name: 'ctx path params parsed',
      want: {
        route: { url: '/one/:id' },
        request: { url: '/one/123' },
      },
      expected: {
        status: 200,
        ctx: {
          'request:pathparams': { id: '123' },
        },
      },
    },
    {
      name: 'ctx multiple path params parsed',
      want: {
        route: { url: '/one/:id/thing/:subId' },
        request: { url: '/one/123/thing/456' },
      },
      expected: {
        status: 200,
        ctx: {
          'request:pathparams': { id: '123', subId: '456' },
        },
      },
    },
  ];

  tt.forEach(({ name, want, expected }) => {
    it(`${name}`, async () => {
      const app = fastify.fastify();
      await app.register(fastifyRequestContextMiddleware);
      await app.get(
        want.route.url,
        (req: FastifyRequest, reply: FastifyReply) => {
          expect(typeof req.apip.ctx).toBeDefined();
          if (expected.ctx) {
            Object.keys(expected.ctx).forEach((key) => {
              expect(req.apip.ctx.get(key)).toEqual(expected.ctx[key]);
            });
          }
          reply.status(200).send({ message: 'ok' });
        }
      );
      await app.ready();
      const response = await app.inject(want.request);

      if (response.statusCode != expected.status && response.payload) {
        console.log(JSON.parse(response.payload).message);
      }
      expect(response.statusCode).toEqual(expected.status);
    });
  });
});
