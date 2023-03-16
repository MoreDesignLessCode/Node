import { Resource } from '../models/resource';
import { Result } from '../models/result';
import { Uuid } from '../models/id';

export interface IStorageProvider {
  save(id: Uuid, object: Resource): Result;
  delete(id: Uuid): Result;
  all(): Result;
  find(id: Uuid): Result;
  create(object: Resource): Result;
}
