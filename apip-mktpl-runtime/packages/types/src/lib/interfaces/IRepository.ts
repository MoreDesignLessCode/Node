import { Resource } from '../models/resource';
import { Result } from '../models/result';
import { Uuid } from '../models/id';

export interface IRepository {
  save(id: Uuid, object: Resource, loggedInUserId: Uuid): Promise<Result>;
  delete(id: Uuid, loggedInUserId: Uuid): Promise<Result>;
  all(): Promise<Result>;
  find(id: Uuid): Promise<Result>;
  create(object: Resource, loggedInUserId: Uuid): Promise<Result>;
}
