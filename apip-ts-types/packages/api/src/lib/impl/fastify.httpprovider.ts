import { fastify, FastifyInstance } from 'fastify';
import { IHttpProvider } from '../interfaces/http.interface';
import { ILogger } from '../interfaces/logger.interface';
import { Server } from '../types/server';

export class FastifyHttpProvider implements IHttpProvider {
  instance!: FastifyInstance;
  server!: Server;
  prefix!: string;
  version!: string;
  log!: ILogger;

  constructor(options: object) {
    this.instance = fastify(options);
    this.server = this.instance.server;
    this.prefix = this.instance.prefix;
    this.version = this.instance.version;
    this.log = this.instance.log;
  }
}
