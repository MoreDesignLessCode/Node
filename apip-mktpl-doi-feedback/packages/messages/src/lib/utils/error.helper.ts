import { Uuid, Result } from '@cvshealth/apip-api-types';
import { ResourceNotFoundError } from '../errors';
import { Constants } from '../models';
import { formatString } from './format.string';

export const handleResourceNotFoundError = (id: Uuid): Result<any> => {
    const error = new ResourceNotFoundError(
        Constants.errors.notFound.message.CODE
    )
        .withTitle(Constants.errors.notFound.message.TITLE)
        .withReason(formatString(Constants.errors.notFound.message.MESSAGE, id));

    return { type: 'error', data: error };
};
