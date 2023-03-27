import {
    IHandler,
    IService,
    IResource,
    Result,
    IRequest,
    PathParams,
} from '@cvshealth/apip-api-types';
import { match } from 'ts-pattern';
import { validate as uuidValidate } from 'uuid';
import { FastifyReply } from 'fastify';
import { Attachments, AttachmentsSchema } from '../models/attachment';
import {
    ValidationAPIError,
    ResourceNotFoundError,
    GeneralAPIError,
} from '../errors';
import { Constants } from '../models';
// needed to wire apip.ctx to req
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { fastifyRequestContextMiddleware } from '@cvshealth/apip-context-middleware';

export class AttachmentsHandler implements IHandler {
    attachmentsService: IService<Attachments>;

    constructor(attachmentsService: IService<Attachments>) {
        this.attachmentsService = attachmentsService;
    }

    get = async (req: IRequest<Attachments>, reply: FastifyReply) => {
        try {
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            if (params.id === undefined) {
                return this.getCollection(req, reply);
            }
            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.attachment.get.CODE
                );
            }

            const result = await this.attachmentsService.getById(params.id, req.apip.ctx);
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
            req.log.error(error);
            reply
                .type('application/json')
                .code(400)
                .send(
                    this.generateGenericError(
                        error as Error,
                        Constants.errors.handler.attachment.get.CODE,
                        Constants.errors.handler.attachment.get.MESSAGE,
                        Constants.errors.handler.attachment.get.TITLE
                    )
                );
        }
    };

    getCollection = async (req: IRequest<Attachments>, reply: FastifyReply) => {
        const result = await this.attachmentsService.getCollection( req.apip.ctx);
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

    post = async (req: IRequest<Attachments>, reply: FastifyReply) => {
        const { body: attachment } = req;
        const { value: validAttachment, error } = AttachmentsSchema.validate(attachment);

        if (error) {
            const validationError = new ValidationAPIError(
                Constants.errors.validation.attachment.create.CODE,
                error
            )
                .withReason(Constants.errors.validation.attachment.create.MESSAGE)
                .withTitle(Constants.errors.validation.attachment.create.TITLE);
            reply
                .type('application/json')
                .code(400)
                .send(validationError.toJson());
        } else {
            const result = await this.attachmentsService.create(validAttachment, req.apip.ctx);
            this.matchOkOrError(result, reply, 201);
            
        }
    };

    put = async (req: IRequest<Attachments>, reply: FastifyReply) => {
        try {
            const { body: attachment } = req;
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.attachment.get.CODE
                );
            }

            const { value: validAttachment, error } = AttachmentsSchema.validate(
                attachment,
                {
                    stripUnknown: true,
                }
            );

            if (error) {
                const validationError = new ValidationAPIError(
                    Constants.errors.validation.attachment.update.CODE,
                    error
                )
                    .withReason(
                        Constants.errors.validation.attachment.update.MESSAGE
                    )
                    .withTitle(Constants.errors.validation.attachment.update.TITLE);
                reply
                    .type('application/json')
                    .code(400)
                    .send(validationError.toJson());
            } else {  const result = await this.attachmentsService.update(
                params.id,
                validAttachment,
                req.apip.ctx
            );
            this.matchOkOrError(result, reply, 200);}
        } catch (error) {
            req.log.error(error);
            reply
                .type('application/json')
                .code(400)
                .send(
                    this.generateGenericError(
                        error as Error,
                        Constants.errors.handler.attachment.update.CODE,
                        Constants.errors.handler.attachment.update.MESSAGE,
                        Constants.errors.handler.attachment.update.TITLE
                    )
                );
        }
    };

    delete = async (req: IRequest<Attachments>, reply: FastifyReply) => {
        try {
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.attachment.get.CODE
                );
            }
            const result = await this.attachmentsService.delete(params.id, req.apip.ctx);
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
            req.log.error(error);
            reply
                .type('application/json')
                .code(400)
                .send(
                    this.generateGenericError(
                        error as Error,
                        Constants.errors.handler.attachment.delete.CODE,
                        Constants.errors.handler.attachment.delete.MESSAGE,
                        Constants.errors.handler.attachment.delete.TITLE
                    )
                );
        }
    };

   
    handleError = (
        req: IRequest<Attachments>,
        error: unknown,
        reply: FastifyReply,
        code: string,
        message: string,
        title: string
    ) => {
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
    ): unknown => {
        return new GeneralAPIError(code, error)
            .withReason(reason)
            .withTitle(title)
            .toJson();
    };

    matchOkOrError = (
        result: Result<Attachments>,
        reply: FastifyReply,
        statusCode: number
    ) => {
        match(result)
            .with({ type: 'ok' }, (result) =>
                reply
                    .type('application/json')
                    .code(statusCode)
                    .send(result.data.value)
            )
            .with({ type: 'error' }, (result) => {
                reply
                    .type('application/json')
                    .code(400)
                    .send(result.data.toJson());
            })
            .exhaustive();
    };
}
