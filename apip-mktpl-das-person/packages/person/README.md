# person

This is the main package for the person domain interface. This will be a
publishable library where the index will export the following:

| Export                  | Signature                                                  |
| :---------------------- | :--------------------------------------------------------- |
| `PersonRouter`          | `PersonRouter(handler: PersonHandler)`                     |
| `PersonHandler`         | `PersonHandler(service: PersonService)`                    |
| `PersonService`         | `PersonService(repository: PersonRepository)`              |
| `PersonRepository`      | `PersonRepository(storageProvider: PersonStorageProvider)` |
| `PersonStorageProvider` | `new PersonStorageProvider()`                              |

This is being built in a hexagonal architecture ("adapters & ports") fashion
to enable a maintainable and evolvable capability.

## Running unit tests

Run `yarn nx test person` to execute the unit tests via [Jest](https://jestjs.io).

## Running lint

Run `yarn nx lint person` to execute the lint via [ESLint](https://eslint.org/).

# Environment Variables

copy .env.local from etc to root

```
cp packages/person/etc/configs/.env.local ./.env
```

# Layers

## routers

Routers are used to wireup the fastify endpoints to the actual code that implements them in the handlers layer

## handlers

Handlers are the implementation for a specific route. This layer calls out to the service layer, and shapes that response according to the API Style Guide for the calling client. This layer is also responsible for request validations and dealing with any possible form data.

## services

Services are where the core business logic resides. A service is called by a handler, and it in turn calls out to a repository and performs whatever business logic is required for the call being made.

## repositories

Repositories are responsibe for communicating with a storage provider to /create/read/update/delete data needed by the service layer. This is where data aggregations, compilation, joins, etc would be handled. Since this will call out to the DAS service, it is also responsible for handling HTTP connections and protocol.

# providers

Providers are code that talk with external services, such as the DOI making http calls to the DAS to get data from the database.

## storage provider

This layer facilitates the communication with the storage system. This allows for memory store when developing and testing and calling out to the DAS to use a long term store.

# JWT Validation

At this point we are just validating the JWT is a valid "shape". We will need to update the [registration](https://github.com/procter-gamble/apip-mktpl-das-person/blob/main/src/providers/jwt/jwtProvider.ts#L9) of FastifyJwt to use jwks once that is in place, then we will need to pass additional options to the [verify](https://github.com/procter-gamble/apip-mktpl-das-person/blob/main/src/providers/jwt/jwtProvider.ts#L15) code to validate items such as complete, allowedAud, allowedIss, maxAge

When we make these updates here is documentation that will assist:

-   [Verifying With jwks](https://github.com/fastify/fastify-jwt#verifying-with-jwks)
-   [Fastify-Jwt Verify](https://github.com/fastify/fastify-jwt#verify)
-   [fast-jwt Create Verifier](https://github.com/nearform/fast-jwt#createverifier)
