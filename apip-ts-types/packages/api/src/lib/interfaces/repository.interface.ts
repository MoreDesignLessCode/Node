import { IContext } from './context.interface';
import { IResource } from './resource.interface';
import { Result } from '../types/result';
import { Uuid } from '../types/id';

export interface IRepository<T extends IResource> {
  all(context: IContext): Promise<Result<T>>;
  create(resource: T, context: IContext): Promise<Result<T>>;
  delete(id: Uuid, context: IContext): Promise<Result<T>>;
  find(id: Uuid, context: IContext): Promise<Result<T>>;
  update(id: Uuid, resource: T, context: IContext): Promise<Result<T>>;
}
