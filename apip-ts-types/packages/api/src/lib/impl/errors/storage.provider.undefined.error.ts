import { APIError } from '../../types/api.error';
import { Uuid } from '../../types/id';

export class StorageProviderUndefinedError extends APIError {
  constructor(_code: string, ...innerErrors: unknown[]) {
    super(
      _code,
      Uuid(),
      'ERROR MESSAGE (PLEASE OVERRIDE)',
      'STORAGE PROVIDER UNDEFINED ERROR',
      '',
      ...innerErrors
    );

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, StorageProviderUndefinedError.prototype);
  }
}
