import { IResource } from '../interfaces/resource.interface';

export type Data<T extends IResource> =
  | { type: 'resource'; value: T }
  | { type: 'collection'; value: Array<T> };
