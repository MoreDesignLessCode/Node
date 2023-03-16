import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { fastifyRequestContextMiddleware } from '@procter-gamble/apip-context-middleware';
import { JwtMiddleware, JwtOptions } from './index';
import { createSigner } from 'fast-jwt';
import { Buffer } from 'node:buffer';

describe('Jwt Middleware', () => {
  const secret =
    'e98256815795d097dc84594fe5bcf6c55d90d11f04b25e814c7a4bff90667bfb';
  const claims = {
    sub: '1234567890',
    name: 'A Person',
    aud: 'app-1',
  };

  const validSigner = createSigner({ key: secret, expiresIn: 300000 });
  const expiredSigner = createSigner({
    key: secret,
    expiresIn: 300000,
    clockTimestamp: 1672534800000,
  });
  const invalidSigner = createSigner({ key: 'foo', expiresIn: 300000 });
  const token = {
    valid: validSigner(claims),
    expired: expiredSigner(claims),
    invalid: invalidSigner(claims),
  };

  type Test = {
    name: string;
    want: {
      request: {
        url?: string;
        headers?: { [key: string]: string };
      };
      verifierOptions?: JwtOptions;
    };
    expected: {
      status?: number;
      ctx?: { [key: string]: string };
    };
  };
  const tt: Test[] = [
    {
      name: 'jwt is valid',
      want: {
        request: {
          url: '/one',
          headers: { authorization: `Bearer ${token.valid}` },
        },
        verifierOptions: {
          key: secret,
          complete: true,
        },
      },
      expected: {
        status: 200,
        ctx: { 'auth:token': token.valid },
      },
    },
    {
      name: 'jwt key is invalid',
      want: {
        request: {
          url: '/one',
          headers: { authorization: `Bearer ${token.invalid}` },
        },
        verifierOptions: {
          key: secret,
          complete: true,
        },
      },
      expected: {
        status: 401,
        ctx: { 'auth:token': token.invalid },
      },
    },
    {
      name: 'jwt is expired',
      want: {
        request: {
          url: '/one',
          headers: { authorization: `Bearer ${token.expired}` },
        },
        verifierOptions: {
          key: secret,
          complete: true,
        },
      },
      expected: {
        status: 401,
        ctx: { 'auth:token': token.expired },
      },
    },
    {
      name: 'ctx payload is valid',
      want: {
        request: {
          url: '/one',
          headers: { authorization: `Bearer ${token.valid}` },
        },
        verifierOptions: {
          key: secret,
          complete: true,
        },
      },
      expected: {
        status: 200,
        ctx: {
          'auth:token': token.valid,
          'auth:claims': JSON.parse(
            Buffer.from(token.valid.split('.')[1], 'base64').toString()
          ),
        },
      },
    },
    {
      name: 'errorHandler is called',
      want: {
        request: {
          url: '/one',
          headers: { authorization: `Bearer ${token.invalid}` },
        },
        verifierOptions: {
          key: secret,
          complete: true,
          errorHandler: (e, reply) => {
            reply.status(499).send({ message: 'error' });
          },
        },
      },
      expected: {
        status: 499,
      },
    },
    {
      name: 'audience is app-1',
      want: {
        request: {
          url: '/one',
          headers: { authorization: `Bearer ${token.valid}` },
        },
        verifierOptions: {
          key: secret,
          complete: true,
          allowedAud: ['app-1'],
        },
      },
      expected: {
        status: 200,
      },
    },
    {
      name: 'audience is not app-2',
      want: {
        request: {
          url: '/one',
          headers: { authorization: `Bearer ${token.valid}` },
        },
        verifierOptions: {
          key: secret,
          complete: true,
          allowedAud: ['app-2'],
        },
      },
      expected: {
        status: 401,
      },
    },
    {
      name: 'complete is false',
      want: {
        request: {
          url: '/one',
          headers: { authorization: `Bearer ${token.valid}` },
        },
        verifierOptions: {
          key: secret,
          complete: false,
        },
      },
      expected: {
        status: 200,
        ctx: {
          'auth:token': token.valid,
          'auth:claims': undefined,
        },
      },
    },
    {
      name: 'complete is missing',
      want: {
        request: {
          url: '/one',
          headers: { authorization: `Bearer ${token.valid}` },
        },
        verifierOptions: {
          key: secret,
        },
      },
      expected: {
        status: 200,
        ctx: {
          'auth:token': token.valid,
          'auth:claims': JSON.parse(
            Buffer.from(token.valid.split('.')[1], 'base64').toString()
          ),
        },
      },
    },
  ];

  tt.forEach(({ name, want, expected }) => {
    it(`${name}`, async () => {
      const app = fastify.fastify();
      await app.register(fastifyRequestContextMiddleware);
      await app.register(JwtMiddleware, want.verifierOptions);
      await app.get(
        want.request.url,
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
