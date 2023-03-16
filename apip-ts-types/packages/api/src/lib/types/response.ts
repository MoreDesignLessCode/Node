import { IResource } from '../interfaces/resource.interface';
import { APIError } from './api.error';
import { Includes } from './includes';

export type Response = {
  data: IResource[];
  errors: APIError;
  meta: IResource;
  includes: Includes;
};
