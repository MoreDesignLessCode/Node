import { APIError } from './apierror';
import { Data } from './data';

export type Result =
  | { type: 'success'; data: Data }
  | { type: 'error'; data: APIError };
