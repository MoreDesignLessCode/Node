import { Request } from '../models/request';
import { Reply } from '../models/reply';

export interface IHandler {
  get(req: Request, reply: Reply): void;
  getCollection(req: Request, reply: Reply): void;
  post(req: Request, reply: Reply): void;
  update(req: Request, reply: Reply): void;
  delete(req: Request, reply: Reply): void;
}
