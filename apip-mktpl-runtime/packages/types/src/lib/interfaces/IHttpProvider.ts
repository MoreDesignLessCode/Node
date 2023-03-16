import { Server } from '../models/server';
import { Logger } from '../models/logger';

export interface IHttpProvider {
  server: Server;
  prefix: string;
  version: string;
  log: Logger;
}
