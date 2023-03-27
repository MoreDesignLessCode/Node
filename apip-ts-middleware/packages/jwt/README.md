# API Program JWT Middleware

A middleware that enables JWT Authorization and setting up the Auth Context on
the API Program Context Middleware plugin (a dependency);

## Usage

1. Import the plugin `import {JwtMiddleware} from '@cvshealth/apip-jwt-middleware'`
1. Register the Plugin

```
import { JwtMiddleware } from '@cvshealth/apip-jwt-middleware'

....

app.register(JwtMiddleware, { key: 'secret', complete: true })

....

```

### Error Handler

You can override the default error handler by passing in the option `errorHandler`

```
import { JwtMiddleware } from '@cvshealth/apip-jwt-middleware'

....
errorFn = (err, reply) => {
  if(err){
  // do something with the error
  }
  reply.status(401).send() //customize the error response if you want
}
app.register(JwtMiddleware, { key: 'secret', complete: true })

....

```

## Typescript

This plugin was built using typescript and exposes the interface `JwtOptions`
which extends `VerifierOptions` from the underlying JWT library `fast-jwt`
using the `Partial<>` type semantics.

### JwtOptions:

- `errorHandler: (err: Error, reply: FastifyReply) => void` - This allows you to
  override the default error handling when an error occurs. Errors that are thrown
  are primarily the errors from `fast-jwt` library as it is the underlying engine
  for JWT processing. `Error` is the node Error class
- `key: string | Buffer` - Key is the "secret" or Public/Private Key from `getJWKs` library to verify the JWTs.

_copied from fast-jwt_

- `key`: A string or a buffer containing the secret for `HS*` algorithms or the PEM encoded public key for `RS*`, `PS*`, `ES*` and `EdDSA` algorithms. The key can also be a function accepting a Node style callback or a function returning a promise. This is the only mandatory option, which MUST NOT be provided if the token algorithm is `none`.

- `algorithms`: List of strings with the names of the allowed algorithms. By default, all algorithms are accepted.

- `complete`: Return an object with the decoded header, payload, signature and input (the token part before the signature), instead of just the content of the payload. Default is `false`.

- `cache`: A positive number specifying the size of the verified tokens cache (using LRU strategy). Setting to `true` is equivalent to provide the size `1000`. When enabled, as you can see in the benchmarks section below, performances dramatically improve. By default the cache is disabled.

- `cacheTTL`: The maximum time to live of a cache entry (in milliseconds). If the token has a earlier expiration or the verifier has a shorter `maxAge`, the earlier takes precedence. The default is `600000`, which is 10 minutes.

- `errorCacheTTL`: A number or function `function (tokenError) => number` that represents the maximum time to live of a cache error entry (in milliseconds). Example: the `key` function fails or does not return a secret or public key. By default **errors are not cached**, the `errorCacheTTL` default value is `-1`.

- `allowedJti`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the id claim (`jti`). By default, all values are accepted.

- `allowedAud`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the audience claim (`aud`). By default, all values are accepted.

- `allowedIss`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the issuer claim (`iss`). By default, all values are accepted.

- `allowedSub`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the subject claim (`sub`). By default, all values are accepted.

- `allowedNonce`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the nonce claim (`nonce`). By default, all values are accepted.

- `requiredClaims`: An array of strings containing which claims should exist in the token. By default, no claim is marked as required.

- `ignoreExpiration`: Do not validate the expiration of the token. Default is `false`.

- `ignoreNotBefore`: Do not validate the activation of the token. Default is `false`.

- `maxAge`: The maximum allowed age (in milliseconds) for tokens to still be valid. By default this is not checked.

- `clockTimestamp`: The timestamp in milliseconds (like the output of `Date.now()`) that should be used as the current time for all necessary time comparisons. Default is the system time.

- `clockTolerance`: Timespan in milliseconds is the tolerance to apply to the current timestamp when performing time comparisons. Default is `0`.

## Plugin Lifecycle

This JWT Plugin implements itself on the `onRequest` lifecycle for Fastify and
does not offer a decorator at this time. In order to use this middleware on a
specific route you will need to register your routes via a grouping ("prefix")
and enable the middleware on that prefix.

### Dependencies

This JWT Plugin depends on the `apip-api-types` package for the `IContext` interface.

Tests for this package require the `apip-api-types` package and the
`apip-context-middleware` package

## Running unit tests

Run `nx test jwt` to execute the unit tests via [Jest](https://jestjs.io).

## Running lint

Run `nx lint jwt` to execute the lint via [ESLint](https://eslint.org/).
