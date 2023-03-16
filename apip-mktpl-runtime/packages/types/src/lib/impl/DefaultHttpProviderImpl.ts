import Fastify from 'fastify';
import { IHttpProvider } from '../interfaces/IHttpProvider';
import { Logger } from '../models/logger';
import { Server } from '../models/server';

export class DefaultHttpProvider implements IHttpProvider {
  server!: Server;
  prefix!: string;
  version!: string;
  log!: Logger;

  constructor(options: object) {
    this.server = Fastify(options);
    this.prefix = this.server.prefix;
    this.version = this.server.version;
    this.log = this.server.log;
  }
}
