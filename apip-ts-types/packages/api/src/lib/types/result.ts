import { APIError } from './api.error';
import { Data } from './data';
import { IResource } from '../interfaces/resource.interface';

export type Result<T extends IResource> =
  | { type: 'ok'; data: Data<T> }
  | { type: 'error'; data: APIError };
