import { Uuid } from '../../types/id';
import { APIError } from '../../types/api.error';

export class GeneralAPIError extends APIError {
  constructor(_code: string, ...innerErrors: unknown[]) {
    super(
      _code,
      Uuid(),
      'ERROR MESSAGE (PLEASE OVERRIDE)',
      'GENERAL API ERROR',
      '',
      ...innerErrors
    );

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, GeneralAPIError.prototype);
  }
}
