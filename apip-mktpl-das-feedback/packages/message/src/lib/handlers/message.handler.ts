import {
    IHandler,
    IService,
    IResource,
    Result,
    IRequest,
    PathParams,
    QueryParameters,
} from '@cvshealth/apip-api-types';
import { match } from 'ts-pattern';
import { validate as uuidValidate } from 'uuid';
import { FastifyReply } from 'fastify';
import { Messages, MessageSchema } from '../models/message';
import {
    ValidationAPIError,
    ResourceNotFoundError,
    GeneralAPIError,
} from '../errors';
import { Constants } from '../models';
import { fastifyRequestContextMiddleware } from '@cvshealth/apip-context-middleware'
//
export class MessageHandler implements IHandler {
    messageService: IService<Messages>;

    constructor(messageService: IService<Messages>) {
        this.messageService = messageService;
    }

    get = async (req: IRequest<Messages>, reply: FastifyReply) => {
        try {
            const queryParams: any = req.query
            const requestType = queryParams?.artifactType
            const requestMessageId = queryParams?.id?.split(',') || []
            req.apip.ctx.set<QueryParameters>('artifactType',requestType)
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            req.apip.ctx.set<QueryParameters>('id',requestMessageId)
            if (params.id === undefined) {
                return this.getCollection(req, reply);
            }
         

            // if (!uuidValidate(params.id)) {
            //     throw new ValidationAPIError(
            //         Constants.errors.handler.message.get.CODE
            //     );
            // }
            const result = await this.messageService.getById(
                params.id,
                req.apip.ctx
            );
            match(result)
                .with({ type: 'ok' }, (res) => {
                    const result: IResource[] = [];
                    result.push(res.data.value);
                    reply.type('application/json').code(200).send(result);
                })
                .with({ type: 'error' }, (res) => {
                    const error = res.data;
                    if (error instanceof ResourceNotFoundError) {
                        const result: IResource[] = [];
                        reply.type('application/json').code(200).send(result);
                    } else {
                        reply
                            .type('application/json')
                            .code(400)
                            .send(error.toJson());
                    }
                })
                .exhaustive();
        } catch (error) {
            this.handleError(
                req,
                error,
                reply,
                Constants.errors.handler.message.get.CODE,
                Constants.errors.handler.message.get.MESSAGE,
                Constants.errors.handler.message.get.TITLE
            );
        }
    };

    getCollection = async (req: IRequest<Messages>, reply: FastifyReply) => {
        const queryParams: any = req.query
        const requestType = queryParams?.artifactType
        const requestMessageId = queryParams?.id?.split(',') || []
        req.apip.ctx.set<QueryParameters>('artifactType',requestType)
        const params = req.apip.ctx.get<PathParams>('request:pathparams');
        req.apip.ctx.set<QueryParameters>('id',requestMessageId)
        const result = await this.messageService.getCollection(req.apip.ctx);
        match(result)
            .with({ type: 'ok' }, (result) => {
                reply
                    .type('application/json')
                    .code(200)
                    .send(result.data.value);
            })
            .with({ type: 'error' }, (result) => {
                reply
                    .type('application/json')
                    .code(400)
                    .send(result.data.toJson());
            })
            .exhaustive();
    };

    post = async (req: IRequest<Messages>, reply: FastifyReply) => {
        const { body: message } = req;

        const { value: validMessage, error } = MessageSchema.validate(message);

        if (error) {
            this.handleValidationError(
                error,
                reply,
                Constants.errors.validation.message.create.CODE,
                Constants.errors.validation.message.create.MESSAGE,
                Constants.errors.validation.message.update.TITLE
            );
        } else {
            const result = await this.messageService.create(
                validMessage,
                req.apip.ctx
            );
            this.matchOkOrError(201, result, reply);
        }
    };

    put = async (req: IRequest<Messages>, reply: FastifyReply) => {
        try {
            const { body: message } = req;
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.message.get.CODE
                );
            }

            const { value: validPerson, error } = MessageSchema.validate(message);

            if (error) {
                this.handleValidationError(
                    error,
                    reply,
                    Constants.errors.validation.message.update.CODE,
                    Constants.errors.validation.message.update.MESSAGE,
                    Constants.errors.validation.message.update.TITLE
                );
            } else {
                const result = await this.messageService.update(
                    validPerson.id,
                    validPerson,
                    req.apip.ctx
                );
                this.matchOkOrError(200, result, reply);
            }
        } catch (error) {
            req.log.error(error);
            reply
                .type('application/json')
                .code(400)
                .send(
                    this.generateGenericError(
                        error as Error,
                        Constants.errors.handler.message.update.CODE,
                        Constants.errors.handler.message.update.MESSAGE,
                        Constants.errors.handler.message.update.TITLE
                    )
                );
        }
    };

    delete = async (req: IRequest<Messages>, reply: FastifyReply) => {
        try {
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.message.get.CODE
                );
            }

            const result = await this.messageService.delete(
                params.id,
                req.apip.ctx
            );
            match(result)
                .with({ type: 'ok' }, () =>
                    reply.type('application/json').code(204).send()
                )
                .with({ type: 'error' }, (result) => {
                    const error = result.data;
                    reply
                        .type('application/json')
                        .code(400)
                        .send(error.toJson());
                })
                .exhaustive();
        } catch (error) {
            this.handleError(
                req,
                error,
                reply,
                Constants.errors.handler.message.delete.CODE,
                Constants.errors.handler.message.delete.MESSAGE,
                Constants.errors.handler.message.delete.TITLE
            );
        }
    };

    handleValidationError = (
        error: unknown,
        reply: FastifyReply,
        code: string,
        message: string,
        title: string
    ): void => {
        reply.log.error(error);
        const validationError = new ValidationAPIError(code, error)
            .withReason(message)
            .withTitle(title);
        reply.type('application/json').code(400).send(validationError.toJson());
    };

    matchOkOrError = (
        statusCode: number,
        result: Result<Messages>,
        reply: FastifyReply
    ): void => {
        match(result)
            .with({ type: 'ok' }, (result) =>
                reply
                    .type('application/json')
                    .code(statusCode)
                    .send(result.data.value)
            )
            .with({ type: 'error' }, (result) => {
                reply.log.error(result);
                reply
                    .type('application/json')
                    .code(400)
                    .send(result.data.toJson());
            })
            .exhaustive();
    };

    handleError = (
        req: IRequest<Messages>,
        error: Error,
        reply: FastifyReply,
        code: string,
        message: string,
        title: string
    ): void => {
        req.log.error(error);
        reply
            .type('application/json')
            .code(400)
            .send(
                this.generateGenericError(error as Error, code, message, title)
            );
    };

    generateGenericError = (
        error: Error,
        code: string,
        reason: string,
        title: string
    ): object => {
        return new GeneralAPIError(code, error)
            .withReason(reason)
            .withTitle(title)
            .toJson();
    };
}
