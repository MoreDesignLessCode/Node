import { IContext } from './context.interface';
import { IResource } from './resource.interface';
import { Result } from '../types/result';
import { Uuid } from '../types/id';

export interface IService<T extends IResource> {
  getById(id: Uuid, context: IContext): Promise<Result<T>>;
  getCollection(context: IContext): Promise<Result<T>>;
  create(entity: T, context: IContext): Promise<Result<T>>;
  update(id: Uuid, entity: T, context: IContext): Promise<Result<T>>;
  delete(id: Uuid, context: IContext): Promise<Result<T>>;
}
