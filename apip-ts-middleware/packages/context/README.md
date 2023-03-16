# API Program Context Middleware

A middleware that enabled a RequestContext throughout the lifecycle of the
request.

## Plugin Lifecycle

This Context Plugin implements itself on the `onRequest` lifecycle for Fastify and
does not offer a decorator at this time. In order to use this middleware on a
specific route you will need to register your routes via a grouping ("prefix")
and enable the middleware on that prefix.

## Running unit tests

Run `nx test api` to execute the unit tests via [Jest](https://jestjs.io).

## Running lint

Run `nx lint api` to execute the lint via [ESLint](https://eslint.org/).
