import { Request } from '../types/request';
import { Reply } from '../types/reply';

export interface IRequestHandler {
  (req: Request, reply: Reply): Promise<void> | void;
}

export interface IHandler {
  get?: IRequestHandler;
  delete?: IRequestHandler;
  head?: IRequestHandler;
  options?: IRequestHandler;
  patch?: IRequestHandler;
  post?: IRequestHandler;
  put?: IRequestHandler;
}
