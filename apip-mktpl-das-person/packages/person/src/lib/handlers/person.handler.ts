import {
    IHandler,
    IService,
    IResource,
    Result,
    IRequest,
    PathParams,
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

export class PersonHandler implements IHandler {
    personService: IService<Person>;

    constructor(personService: IService<Person>) {
        this.personService = personService;
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

            const result = await this.personService.getById(
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
                Constants.errors.handler.person.get.CODE,
                Constants.errors.handler.person.get.MESSAGE,
                Constants.errors.handler.person.get.TITLE
            );
        }
    };

    getCollection = async (req: IRequest<Person>, reply: FastifyReply) => {
        const result = await this.personService.getCollection(req.apip.ctx);
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
            this.handleValidationError(
                error,
                reply,
                Constants.errors.validation.person.create.CODE,
                Constants.errors.validation.person.create.MESSAGE,
                Constants.errors.validation.person.update.TITLE
            );
        } else {
            const result = await this.personService.create(
                validPerson,
                req.apip.ctx
            );
            this.matchOkOrError(201, result, reply);
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
                this.handleValidationError(
                    error,
                    reply,
                    Constants.errors.validation.person.update.CODE,
                    Constants.errors.validation.person.update.MESSAGE,
                    Constants.errors.validation.person.update.TITLE
                );
            } else {
                const result = await this.personService.update(
                    params.id,
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

            const result = await this.personService.delete(
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
                Constants.errors.handler.person.delete.CODE,
                Constants.errors.handler.person.delete.MESSAGE,
                Constants.errors.handler.person.delete.TITLE
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
        result: Result<Person>,
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
        req: IRequest<Person>,
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
