import { APIError } from '../../types/api.error';
import { Uuid } from '../../types/id';

export class ValidationAPIError extends APIError {
  constructor(_code: string, ...innerErrors: unknown[]) {
    super(
      _code,
      Uuid(),
      'ERROR MESSAGE (PLEASE OVERRIDE)',
      'VALIDATION API ERROR',
      '',
      ...innerErrors
    );

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ValidationAPIError.prototype);
  }
}
