import { ILogger } from './logger.interface';
import { Server } from '../types/server';

export interface IHttpProvider {
  server: Server;
  prefix: string;
  version: string;
  log: ILogger;
}
