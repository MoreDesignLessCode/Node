# API Program Typescript Types

These typescript types are generic types that can be leveraged within a TS
project.

These were built out of necessity with the generic models that will be used
across the many Developer Domain Interfaces and Data Services for the API
Program Marketplace.

Default implementations may include dependencies such as an HTTP Server like
Fastify or Express but the interfaces and types should remain external dep free
or using the code NodeJS modules.

## Repository

This repository is a monorepo powered by
<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer">
<img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45">
</a>

Remember to leverage the `format` and `lint` functions before committing to
avoid unnecessary commits (if it happens, it happens but we can try to do without
them).

## Packages

This monorepo is broken in to packages that are focused on a particular service
type.

Currently we have the following packages:

- API - This is a set of types/interfaces and default implementations for
  building an API. Initial work has been done to support RESTFul APIs but with
  use cases or exposure GraphQL and tRPC could be supported.
- TCP - (TBD) This is a set of types/interfaces and default implementations for
  building a TCP based service such as an event listener that attaches to a TCP
  streaming event dispatcher like Kafka/RabbitMQ/Solace/etc.

### Dependency Graph

Run `nx graph` to see a diagram of the dependencies of the projects.
