import { IContext } from './context.interface';
import { IResource } from './resource.interface';
import { Result } from '../types/result';
import { Uuid } from '../types/id';

export interface IStorageProvider<T extends IResource> {
  all(context: IContext): Promise<Result<T>>;
  create(entity: T, context: IContext): Promise<Result<T>>;
  delete(id: Uuid, context: IContext): Promise<Result<T>>;
  findById(id: Uuid, context: IContext): Promise<Result<T>>;
  save(id: Uuid, entity: T, context: IContext): Promise<Result<T>>;
}
