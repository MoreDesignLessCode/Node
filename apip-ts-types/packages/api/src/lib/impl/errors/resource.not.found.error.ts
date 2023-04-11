import { APIError } from '../../types/api.error';
import { Uuid } from '../../types/id';

export class ResourceNotFoundError extends APIError {
  constructor(_code: string, ...innerErrors: unknown[]) {
    super(
      _code,
      Uuid(),
      'ERROR MESSAGE (PLEASE OVERRIDE)',
      'RESOURCE NOT FOUND ERROR',
      '',
      ...innerErrors
    );

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ResourceNotFoundError.prototype);
  }
}
