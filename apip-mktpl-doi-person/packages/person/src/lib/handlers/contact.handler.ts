import {
    IHandler,
    IService,
    IResource,
    IRequest,
    PathParams,
    ResponseBuilder,
} from '@cvshealth/apip-api-types';
import { match } from 'ts-pattern';
import { validate as uuidValidate } from 'uuid';
import { FastifyReply } from 'fastify';
import { Contact, ContactSchema } from '../models/contact';
import {
    ValidationAPIError,
    ResourceNotFoundError,
    GeneralAPIError,
} from '../errors';
import { Constants } from '../models';

export class ContactHandler implements IHandler {
    contactService: IService<Contact>;
    responseBuilder: ResponseBuilder;

    constructor(contactService: IService<Contact>) {
        this.contactService = contactService;
        this.responseBuilder = new ResponseBuilder();
    }

    get = async (req: IRequest<Contact>, reply: FastifyReply) => {
        try {
            const params = req.apip.ctx.get<PathParams>('request:pathparams');

            if (params.id === undefined) {
                return this.getCollection(req, reply);
            }

            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.contact.get.CODE
                );
            }

            const result = await this.contactService.getById(
                params.id,
                req.apip.ctx
            );

            match(result)
                .with({ type: 'ok' }, (res) => {
                    const result: IResource[] = [];
                    result.push(res.data.value);
                    this.responseBuilder.setData(result);
                    reply
                        .type('application/json')
                        .code(200)
                        .send(this.responseBuilder.build());
                })
                .with({ type: 'error' }, (res) => {
                    const error = res.data;
                    if (error instanceof ResourceNotFoundError) {
                        const result: IResource[] = [];
                        this.responseBuilder.setData(result);
                        reply
                            .type('application/json')
                            .code(200)
                            .send(this.responseBuilder.build());
                    } else {
                        this.responseBuilder.setErrors(error);
                        reply
                            .type('application/json')
                            .code(400)
                            .send(this.responseBuilder.build());
                    }
                })
                .exhaustive();
        } catch (error) {
            req.log.error(error);
            const err = this.generateGenericError(
                error as Error,
                Constants.errors.handler.contact.get.CODE,
                Constants.errors.handler.contact.get.MESSAGE,
                Constants.errors.handler.contact.get.TITLE
            );
            this.responseBuilder.setErrors(err);
            reply
                .type('application/json')
                .code(400)
                .send(this.responseBuilder.build());
        }
    };

    getCollection = async (req: IRequest<Contact>, reply: FastifyReply) => {
        const result = await this.contactService.getCollection(req.apip.ctx);
        match(result)
            .with({ type: 'ok' }, (result) => {
                this.responseBuilder.setData(result.data.value as Contact[]);
                reply
                    .type('application/json')
                    .code(200)
                    .send(this.responseBuilder.build());
            })
            .with({ type: 'error' }, (result) => {
                this.responseBuilder.setErrors(result.data);
                reply
                    .type('application/json')
                    .code(400)
                    .send(this.responseBuilder.build());
            })
            .exhaustive();
    };

    post = async (req: IRequest<Contact>, reply: FastifyReply) => {
        const { body: contact } = req;

        const { value: validContact, error } = ContactSchema.validate(contact, {
            stripUnknown: true,
        });

        if (error) {
            const validationError = new ValidationAPIError(
                Constants.errors.validation.contact.create.CODE,
                error
            )
                .withReason(Constants.errors.validation.contact.create.MESSAGE)
                .withTitle(Constants.errors.validation.contact.create.TITLE);
            this.responseBuilder.setErrors(validationError);
            reply
                .type('application/json')
                .code(400)
                .send(this.responseBuilder.build());
        } else {
            const result = await this.contactService.create(
                validContact,
                req.apip.ctx
            );
            match(result)
                .with({ type: 'ok' }, (result) => {
                    const res: IResource[] = [];
                    res.push(result.data.value);
                    this.responseBuilder.setData(res);
                    reply
                        .type('application/json')
                        .code(201)
                        .send(this.responseBuilder.build());
                })
                .with({ type: 'error' }, (result) => {
                    this.responseBuilder.setErrors(result.data);
                    reply
                        .type('application/json')
                        .code(400)
                        .send(this.responseBuilder.build());
                })
                .exhaustive();
        }
    };

    put = async (req: IRequest<Contact>, reply: FastifyReply) => {
        try {
            const { body: contact } = req;
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.contact.get.CODE
                );
            }

            const { value: validContact, error } = ContactSchema.validate(
                contact,
                {
                    stripUnknown: true,
                }
            );

            if (error) {
                const validationError = new ValidationAPIError(
                    Constants.errors.validation.contact.update.CODE,
                    error
                )
                    .withReason(
                        Constants.errors.validation.contact.update.MESSAGE
                    )
                    .withTitle(
                        Constants.errors.validation.contact.update.TITLE
                    );
                this.responseBuilder.setErrors(validationError);
                reply
                    .type('application/json')
                    .code(400)
                    .send(this.responseBuilder.build());
            } else {
                const result = await this.contactService.update(
                    params.id,
                    validContact,
                    req.apip.ctx
                );
                match(result)
                    .with({ type: 'ok' }, (result) => {
                        const res: IResource[] = [];
                        res.push(result.data.value);
                        this.responseBuilder.setData(res);
                        reply
                            .type('application/json')
                            .code(200)
                            .send(this.responseBuilder.build());
                    })
                    .with({ type: 'error' }, (result) => {
                        this.responseBuilder.setErrors(result.data);
                        reply
                            .type('application/json')
                            .code(400)
                            .send(this.responseBuilder.build());
                    })
                    .exhaustive();
            }
        } catch (error) {
            req.log.error(error);
            const err = this.generateGenericError(
                error as Error,
                Constants.errors.handler.contact.update.CODE,
                Constants.errors.handler.contact.update.MESSAGE,
                Constants.errors.handler.contact.update.TITLE
            );
            this.responseBuilder.setErrors(err);
            reply
                .type('application/json')
                .code(400)
                .send(this.responseBuilder.build());
        }
    };

    delete = async (req: IRequest<Contact>, reply: FastifyReply) => {
        try {
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.contact.get.CODE
                );
            }
            const result = await this.contactService.delete(
                params.id,
                req.apip.ctx
            );
            match(result)
                .with({ type: 'ok' }, () =>
                    reply.type('application/json').code(204).send()
                )
                .with({ type: 'error' }, (result) => {
                    const error = result.data;
                    this.responseBuilder.setErrors(error);
                    reply
                        .type('application/json')
                        .code(400)
                        .send(this.responseBuilder.build());
                })
                .exhaustive();
        } catch (error) {
            req.log.error(error);
            const err = this.generateGenericError(
                error as Error,
                Constants.errors.handler.contact.delete.CODE,
                Constants.errors.handler.contact.delete.MESSAGE,
                Constants.errors.handler.contact.delete.TITLE
            );
            this.responseBuilder.setErrors(err);
            reply
                .type('application/json')
                .code(400)
                .send(this.responseBuilder.build());
        }
    };

    private generateGenericError(
        error: Error,
        code: string,
        reason: string,
        title: string
    ) {
        return new GeneralAPIError(code, error)
            .withReason(reason)
            .withTitle(title);
        //.toJson();
    }
}
