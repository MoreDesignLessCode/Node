import * as AuthZErrors from './constants.errors.authorization';
import * as NotFoundErrors from './constants.errors.notfound';
import * as PersonHandlerErrors from './constants.errors.handler';
import * as RepositoryErrors from './constants.errors.repository';
import * as ValidationErrors from './constants.errors.validation';

export const Constants = {
    errors: {
        generalError: {
            CODE: 'PREFIX-####(PLEASE OVERRIDE)',
            MESSAGE: 'ERROR MESSAGE',
            TITLE: 'ERROR MESSAGE (PLEASE OVERRIDE)',
        },
        ...AuthZErrors, // 40XX codes
        ...PersonHandlerErrors, // 41XX codes
        ...NotFoundErrors, // 42XX codes
        ...RepositoryErrors, // 43XX codes
        ...ValidationErrors, // 44XX codes
    },
};
