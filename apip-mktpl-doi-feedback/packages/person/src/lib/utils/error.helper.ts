import { Uuid, Result } from '@cvshealth/apip-api-types';
import { ResourceNotFoundError } from '../errors';
import { Person, Constants } from '../models';
import { formatString } from './format.string';

export const handleResourceNotFoundError = (id: Uuid): Result<Person> => {
    const error = new ResourceNotFoundError(
        Constants.errors.notFound.person.CODE
    )
        .withTitle(Constants.errors.notFound.person.TITLE)
        .withReason(formatString(Constants.errors.notFound.person.MESSAGE, id));

    return { type: 'error', data: error };
};
