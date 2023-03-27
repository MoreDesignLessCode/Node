import { Uuid, APIError } from '@cvshealth/apip-api-types';
import { Constants } from '../models/constants';

export class GeneralAPIError extends APIError {
    constructor(_code: string, ...innerErrors: unknown[]) {
        super(
            _code,
            Uuid(),
            Constants.errors.generalError.TITLE,
            'GENERAL API ERROR',
            '',
            ...innerErrors
        );

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, GeneralAPIError.prototype);
    }
}
