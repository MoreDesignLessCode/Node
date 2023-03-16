import { Resource } from '../models/resource';
import { Result } from '../models/result';
import { Uuid } from '../models/id';

export interface IService {
  getById(id: Uuid): Result;
  getCollection(): Result;
  create(newObject: Resource): Result;
  update(id: Uuid, updateObject: Resource): Result;
  delete(id: Uuid): Result;
}
