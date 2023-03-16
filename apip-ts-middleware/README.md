# API Program Typescript Middlewares

These middlewares are to be used in conjunction with API Program's Typescript
Types (`@procter-gamble/apip-api-types`) for API development in a hexagonal
architecture pattern.

These were built out of necessity across the many Developer Domain 
Interfaces and Data Services for the API Program Marketplace.

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

| Package Name | Description |
| :----------: | :---------- |
| context      | sets up a request middleware that can be used to store information between the different ports/adapters in the request lifecycle of an API request |
|              |             |

### Dependency Graph

Run `nx graph` to see a diagram of the dependencies of the projects.
