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
import { Ratings, RatingSchema } from '../models/rating';
import {
    ValidationAPIError,
    ResourceNotFoundError,
    GeneralAPIError,
} from '../errors';
import { Constants } from '../models';
import { fastifyRequestContextMiddleware } from '@cvshealth/apip-context-middleware'

export class RatingHandler implements IHandler {
    ratingService: IService<Ratings>;

    constructor(ratingService: IService<Ratings>) {
        this.ratingService = ratingService;
    }

    get = async (req: IRequest<Ratings>, reply: FastifyReply) => {
        try {
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
             
            const queryParams: any = req.query
            const includesParams = queryParams?.includes?.split(',') || []
            req.apip.ctx.set<QueryParameters>('includes',includesParams)
            if (params.id === undefined) {
                return this.getCollection(req, reply);
            }

            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.rating.get.CODE
                );
            }

            const result = await this.ratingService.getById(
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
                Constants.errors.handler.rating.get.CODE,
                Constants.errors.handler.rating.get.MESSAGE,
                Constants.errors.handler.rating.get.TITLE
            );
        }
    };

    getCollection = async (req: IRequest<Ratings>, reply: FastifyReply) => {
        const result = await this.ratingService.getCollection(req.apip.ctx);
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

    post = async (req: IRequest<Ratings>, reply: FastifyReply) => {
        const { body: rating } = req;

        const { value: validPerson, error } = RatingSchema.validate(rating);

        if (error) {
            this.handleValidationError(
                error,
                reply,
                Constants.errors.validation.rating.create.CODE,
                Constants.errors.validation.rating.create.MESSAGE,
                Constants.errors.validation.rating.update.TITLE
            );
        } else {
            const result = await this.ratingService.create(
                validPerson,
                req.apip.ctx
            );
            this.matchOkOrError(201, result, reply);
        }
    };

    put = async (req: IRequest<Ratings>, reply: FastifyReply) => {
        try {
            const { body: rating } = req;
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.rating.get.CODE
                );
            }

            // const { value: validrating, error } = RatingSchema.validate(rating);
              let error=false;
            if (error) {
                this.handleValidationError(
                    error,
                    reply,
                    Constants.errors.validation.rating.update.CODE,
                    Constants.errors.validation.rating.update.MESSAGE,
                    Constants.errors.validation.rating.update.TITLE
                );
            } else {
                const result = await this.ratingService.update(
                    params.id,
                    rating,
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
                        Constants.errors.handler.rating.update.CODE,
                        Constants.errors.handler.rating.update.MESSAGE,
                        Constants.errors.handler.rating.update.TITLE
                    )
                );
        }
    };

    delete = async (req: IRequest<Ratings>, reply: FastifyReply) => {
        try {
            const params = req.apip.ctx.get<PathParams>('request:pathparams');
            if (!uuidValidate(params.id)) {
                throw new ValidationAPIError(
                    Constants.errors.handler.rating.get.CODE
                );
            }

            const result = await this.ratingService.delete(
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
                Constants.errors.handler.rating.delete.CODE,
                Constants.errors.handler.rating.delete.MESSAGE,
                Constants.errors.handler.rating.delete.TITLE
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
        result: Result<Ratings>,
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
        req: IRequest<Ratings>,
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
