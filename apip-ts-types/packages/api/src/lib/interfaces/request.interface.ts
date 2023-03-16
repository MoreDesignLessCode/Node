import { IResource } from './resource.interface';
import { FastifyRequest } from 'fastify';


export interface IRequest<T extends IResource> extends FastifyRequest {
    body: T
}
