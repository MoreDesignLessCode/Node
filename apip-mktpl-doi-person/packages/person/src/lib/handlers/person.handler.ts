import {
    IHandler,
    IService,
    IResource,
    Result,
    IRequest,
    PathParams,
    APIError,
    ResponseBuilder,
} from '@procter-gamble/apip-api-types';
import { match } from 'ts-pattern';
import { validate as uuidValidate } from 'uuid';
import { FastifyReply } from 'fastify';
import { Person, PersonSchema } from '../models/person';
import {
    ValidationAPIError,
    ResourceNotFoundError,
    GeneralAPIError,
} from '../errors';
import { Constants } from '../models';
// needed to wire apip.ctx to req
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { fastifyRequestContextMiddleware } from '@procter-gamble/apip-context-middleware';

export class PersonHandler implements IHandler {
    service: IService<Person>;
    responseBuilder: ResponseBuilder;

    constructor(personService: IService<Person>) {
        this.service = personService;
        this.responseBuilder = new ResponseBuilder();
    }

    get = async (req: IRequest<Person>, reply: FastifyReply) => {
        try {
            const params = req.apip.ctx.get<PathParams>('request:pathparams');

            if (params.id === undefined) {
                return this.getCollection(req, reply);
            }

            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.person.get.CODE
                );
            }

            const result = await this.service.getById(params.id, req.apip.ctx);
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
                        this.responseBuilder.setData([]);
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
            this.handleError(
                req,
                error,
                reply,
                Constants.errors.handler.person.get.CODE,
                Constants.errors.handler.person.get.MESSAGE,
                Constants.errors.handler.person.get.TITLE
            );
        }
    };

    getCollection = async (req: IRequest<Person>, reply: FastifyReply) => {
        const result = await this.service.getCollection(req.apip.ctx);
        match(result)
            .with({ type: 'ok' }, (result) => {
                this.responseBuilder.setData(result.data.value as Person[]);
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

    post = async (req: IRequest<Person>, reply: FastifyReply) => {
        const { body: person } = req;
        const { value: validPerson, error } = PersonSchema.validate(person);

        if (error) {
            const validationError = new ValidationAPIError(
                Constants.errors.validation.person.create.CODE,
                error
            )
                .withReason(Constants.errors.validation.person.create.MESSAGE)
                .withTitle(Constants.errors.validation.person.create.TITLE);
            this.responseBuilder.setErrors(validationError);
            reply
                .type('application/json')
                .code(400)
                .send(this.responseBuilder.build());
        } else {
            const result = await this.service.create(validPerson, req.apip.ctx);
            this.matchOkOrError(result, reply, 201);
        }
    };

    put = async (req: IRequest<Person>, reply: FastifyReply) => {
        try {
            const { body: person } = req;
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.person.get.CODE
                );
            }

            const { value: validPerson, error } = PersonSchema.validate(person);

            if (error) {
                const validationError = new ValidationAPIError(
                    Constants.errors.validation.person.update.CODE,
                    error
                )
                    .withReason(
                        Constants.errors.validation.person.update.MESSAGE
                    )
                    .withTitle(Constants.errors.validation.person.update.TITLE);
                this.responseBuilder.setErrors(validationError);
                reply
                    .type('application/json')
                    .code(400)
                    .send(this.responseBuilder.build());
            } else {
                const result = await this.service.update(
                    params.id,
                    validPerson,
                    req.apip.ctx
                );
                this.matchOkOrError(result, reply, 200);
            }
        } catch (error) {
            req.log.error(error);
            this.responseBuilder.setErrors(
                this.generateGenericError(
                    error as Error,
                    Constants.errors.handler.person.update.CODE,
                    Constants.errors.handler.person.update.MESSAGE,
                    Constants.errors.handler.person.update.TITLE
                )
            );
            reply
                .type('application/json')
                .code(400)
                .send(this.responseBuilder.build());
        }
    };

    delete = async (req: IRequest<Person>, reply: FastifyReply) => {
        try {
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.person.get.CODE
                );
            }

            const result = await this.service.delete(params.id, req.apip.ctx);
            match(result)
                .with({ type: 'ok' }, () =>
                    reply.type('application/json').code(204).send()
                )
                .with({ type: 'error' }, (result) => {
                    this.responseBuilder.setErrors(result.data);
                    reply
                        .type('application/json')
                        .code(400)
                        .send(this.responseBuilder.build());
                })
                .exhaustive();
        } catch (error) {
            this.handleError(
                req,
                error,
                reply,
                Constants.errors.handler.person.delete.CODE,
                Constants.errors.handler.person.delete.MESSAGE,
                Constants.errors.handler.person.delete.TITLE
            );
        }
    };

    handleError = (
        req: IRequest<Person>,
        error: unknown,
        reply: FastifyReply,
        code: string,
        message: string,
        title: string
    ) => {
        req.log.error(error);
        this.responseBuilder.setErrors(
            this.generateGenericError(error as Error, code, message, title)
        );
        reply
            .type('application/json')
            .code(400)
            .send(this.responseBuilder.build());
    };

    generateGenericError = (
        error: Error,
        code: string,
        reason: string,
        title: string
    ): APIError => {
        return new GeneralAPIError(code, error)
            .withReason(reason)
            .withTitle(title);
    };

    matchOkOrError = (
        result: Result<Person>,
        reply: FastifyReply,
        statusCode: number
    ) => {
        match(result)
            .with({ type: 'ok', data: { type: 'resource' } }, (result) => {
                this.responseBuilder.setData([result.data.value]);
                reply
                    .type('application/json')
                    .code(statusCode)
                    .send(this.responseBuilder.build());
            })
            .with({ type: 'ok', data: { type: 'collection' } }, (result) => {
                this.responseBuilder.setData(result.data.value);
                reply
                    .type('application/json')
                    .code(statusCode)
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
}
