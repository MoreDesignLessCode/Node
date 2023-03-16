import { APIError, Uuid } from '@procter-gamble/apip-api-types';
import { Constants } from '../models/constants';

export class ResourceNotFoundError extends APIError {
    constructor(_code: string, ...innerErrors: unknown[]) {
        super(
            _code,
            Uuid(),
            Constants.errors.generalError.TITLE,
            'RESOURCE NOT FOUND ERROR',
            '',
            ...innerErrors
        );

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ResourceNotFoundError.prototype);
    }
}
