# apip-mktpl-das-person

Person Data Access Microservice for Marketplace API Platform

# Yarn commands

-   `yarn install` - installs all the components needed by the application
-   `yarn start` - Runs the TypeScript directly using nodemon
-   `yarn build` - Runs nx 'affected:build' command
-   `yarn test` - Runs nx 'affected:test' command
-   `yarn test:all` - Runs nx 'affected:test' command with options for code coverage and skip cache directives
-   `yarn migrate:up:dryrun` - Run "up" migrations without executing in database, useful to potentially see what will be run
-   `yarn migrate:up` - Run "up" migrations
-   `yarn migrate:create {NAME}` - creates migration files that will be run with up/down commands
-   `yarn migrate:down:dryrun` - Run "down" migrations without executing in database, useful to potentially see what will be run
-   `yarn migrate:down` - Run "down" migrations

# Environment Variables

copy .env.local from etc to root

```
cp etc/configs/.env.local ./.env
```

# Layers

## routers

Routers are used to wireup the fastify endpoints to the actual code that implements them in the handlers layer

## handlers

Handlers are the implementation for a specific route. This layer calls out to the service layer, and shapes that response according to the API Style Guide for the calling client. This layer is also responsible for request validations and dealing with any possible form data.

## services

Services are where the core business logic resides. A service is called by a handler, and it in turn calls out to a repository and performs whatever business logic is required for the call being made.

## repositories

Repositories are responsible for communicating with a storage provider to /create/read/update/delete data needed by the service layer. This is where data aggregations, compilation, joins, etc would be handled.

## providers

providers deal with external systems such as database, authorizations, or http.

# JWT Validation

At this point we are just validating the JWT is a valid "shape". We will need to update the [registration](https://github.com/cvshealth/apip-mktpl-das-person/blob/main/src/providers/jwt/jwtProvider.ts#L9) of FastifyJwt to use jwks once that is in place, then we will need to pass additional options to the [verify](https://github.com/cvshealth/apip-mktpl-das-person/blob/main/src/providers/jwt/jwtProvider.ts#L15) code to validate items such as complete, allowedAud, allowedIss, maxAge

When we make these updates here is documentation that will assist:

-   [Verifying With jwks](https://github.com/fastify/fastify-jwt#verifying-with-jwks)
-   [Fastify-Jwt Verify](https://github.com/fastify/fastify-jwt#verify)
-   [fast-jwt Create Verifier](https://github.com/nearform/fast-jwt#createverifier)
