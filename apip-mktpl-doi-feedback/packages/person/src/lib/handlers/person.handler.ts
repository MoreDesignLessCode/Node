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
import { Person, PersonSchema } from '../models/person';
import {
    ValidationAPIError,
    ResourceNotFoundError,
    GeneralAPIError,
} from '../errors';
import { Constants } from '../models';
// needed to wire apip.ctx to req
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { fastifyRequestContextMiddleware } from '@cvshealth/apip-context-middleware';

export class PersonHandler implements IHandler {
    service: IService<Person>;
    constructor(personService: IService<Person>) {
        this.service = personService;
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
            //comment

            const result = await this.service.getById(params.id, req.apip.ctx);
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
            reply
                .type('application/json')
                .code(400)
                .send(validationError.toJson());
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
                reply
                    .type('application/json')
                    .code(400)
                    .send(validationError.toJson());
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
            reply
                .type('application/json')
                .code(400)
                .send(
                    this.generateGenericError(
                        error as Error,
                        Constants.errors.handler.person.update.CODE,
                        Constants.errors.handler.person.update.MESSAGE,
                        Constants.errors.handler.person.update.TITLE
                    )
                );
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
        result: Result<Person>,
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
